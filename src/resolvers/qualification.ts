import { s3 } from '@configs'
import { Qualification } from '@entities'
import { QualificationInput, QualificationResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, saveAttributes } from '@utils'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { v4 } from 'uuid'

@Resolver(Qualification)
export class QualificationResolver {
  @FieldResolver(() => String)
  async photoUrl(
    @Root() item: Qualification
  ): Promise<string | null> {
    return item.photo ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: item.photo }) : null
  }

  @Query(() => [Qualification])
  async qualifications(
    @Arg('userId', () => Int) userId: number
  ): Promise<Qualification[]> {
    return (await Qualification.find({ where: { userId } }))
  }

  @UseMiddleware(isAuth)
  @Mutation(() => QualificationResponse)
  async createQualification(
    @Arg('input', () => QualificationInput) input: QualificationInput,
    @Ctx() { req }: Context
  ): Promise<QualificationResponse> {
    const { userId } = req.session
    const { name, issuingOrganisation, issuanceDate, expire, expirationDate, photo, credentialID, credentialURL } = input
    if (!name) {
      return {
        errors: [{
          field: 'name',
          message: 'Name cannot be empty!'
        }]
      }
    }
    if (!issuingOrganisation) {
      return {
        errors: [{
          field: 'issuingOrganisation',
          message: 'Issuing organisation cannot be empty!'
        }]
      }
    }
    let key
    if (photo) {
      const { createReadStream, filename } = await photo
      const stream = createReadStream()
      const ext = getExtensionFromFilename(filename)
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `users/${userId}/photos/qualifications/${v4()}.${ext}`,
      }).promise()
      key = uploaded.Key
    }
    return {
      qualification: await Qualification.create({
        name,
        issuingOrganisation,
        issuanceDate,
        expire,
        expirationDate,
        credentialID,
        credentialURL,
        photo: key,
        userId
      }).save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => QualificationResponse)
  async updateQualification(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => QualificationInput) input: QualificationInput,
    @Ctx() { req }: Context
  ): Promise<QualificationResponse> {
    const { userId } = req.session
    const { name, issuingOrganisation, photo } = input
    if (!name) {
      return {
        errors: [{
          field: 'name',
          message: 'Name cannot be empty!'
        }]
      }
    }
    if (!issuingOrganisation) {
      return {
        errors: [{
          field: 'issuingOrganisation',
          message: 'Issuing organisation cannot be empty!'
        }]
      }
    }
    const qualification = await Qualification.findOne({ where: { id, userId } })
    if (!qualification) {
      throw new Error('Not authorised!')
    }
    saveAttributes<Qualification, QualificationInput>(qualification, input)
    if (photo) {
      const { createReadStream, filename, } = await photo
      const ext = getExtensionFromFilename(filename)
      const stream = createReadStream()
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `users/${userId}/photos/qualifications/${v4()}.${ext}`,
      }).promise()
      qualification.photo = uploaded.Key
    }
    return {
      qualification: await qualification.save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteQualification(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const qualification = await Qualification.findOne({ where: { id, userId } })
    if (!qualification) {
      throw new Error('Not authorised!')
    }
    await qualification.remove()
    return true
  }
}