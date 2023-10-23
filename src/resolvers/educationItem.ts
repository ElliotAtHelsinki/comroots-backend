import { s3 } from '@configs'
import { EducationItem } from '@entities'
import { EducationItemInput, EducationItemResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, saveAttributes } from '@utils'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { v4 } from 'uuid'

@Resolver(EducationItem)
export class EducationItemResolver {
  @FieldResolver(() => String)
  async photoUrl(
    @Root() item: EducationItem
  ): Promise<string | null> {
    return item.photo ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: item.photo }) : null
  }

  @Query(() => [EducationItem])
  async educationItems(
    @Arg('userId', () => Int) userId: number
  ): Promise<EducationItem[]> {
    return (await EducationItem.find({ where: { userId } }))
  }

  @UseMiddleware(isAuth)
  @Mutation(() => EducationItemResponse)
  async createEducationItem(
    @Arg('input', () => EducationItemInput) input: EducationItemInput,
    @Ctx() { req }: Context
  ): Promise<EducationItemResponse> {
    const { userId } = req.session
    const { school, status, startDate, endDate, photo } = input
    if (!school) {
      return {
        errors: [{
          field: 'school',
          message: 'School cannot be empty!'
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
        Key: `users/${userId}/photos/educationItems/${v4()}.${ext}`
      }).promise()
      key = uploaded.Key
    }
    return {
      educationItem: await EducationItem.create({
        school,
        status,
        startDate,
        endDate,
        photo: key,
        userId
      }).save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => EducationItemResponse)
  async updateEducationItem(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => EducationItemInput) input: EducationItemInput,
    @Ctx() { req }: Context
  ): Promise<EducationItemResponse> {
    const { userId } = req.session
    const { school, photo } = input
    if (school != undefined && school == '') {
      return {
        errors: [{
          field: 'school',
          message: 'School cannot be empty!'
        }]
      }
    }
    const educationItem = await EducationItem.findOne({ where: { id, userId } })
    if (!educationItem) {
      throw new Error('Not authorised!')
    }
    saveAttributes<EducationItem, EducationItemInput>(educationItem, input)
    if (photo) {
      const { createReadStream, filename, } = await photo
      const ext = getExtensionFromFilename(filename)
      const stream = createReadStream()
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `users/${userId}/photos/educationItems/${v4()}.${ext}`,
      }).promise()
      educationItem.photo = uploaded.Key
    }
    return {
      educationItem: await educationItem.save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteEducationItem(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const educationItem = await EducationItem.findOne({ where: { id, userId } })
    if (!educationItem) {
      throw new Error('Not authorised!')
    }
    await educationItem.remove()
    return true
  }
}