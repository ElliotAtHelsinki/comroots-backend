import { s3 } from '@configs'
import { Experience } from '@entities'
import { ExperienceInput, ExperienceResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, saveAttributes } from '@utils'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { v4 } from 'uuid'

@Resolver(Experience)
export class ExperienceResolver {
  @FieldResolver(() => String)
  async photoUrl(
    @Root() item: Experience
  ): Promise<string | null> {
    return item.photo ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: item.photo }) : null
  }

  @Query(() => [Experience])
  async experiences(
    @Arg('userId', () => Int) userId: number
  ): Promise<Experience[]> {
    return (await Experience.find({ where: { userId } }))
  }

  @UseMiddleware(isAuth)
  @Mutation(() => ExperienceResponse)
  async createExperience(
    @Arg('input', () => ExperienceInput) input: ExperienceInput,
    @Ctx() { req }: Context
  ): Promise<ExperienceResponse> {
    const { userId } = req.session
    const { title, workplace, startDate, endDate, photo } = input
    if (!title) {
      return {
        errors: [{
          field: 'title',
          message: 'Title cannot be empty!'
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
        Key: `users/${userId}/photos/experiences/${v4()}.${ext}`,
      }).promise()
      key = uploaded.Key
    }
    return {
      experience: await Experience.create({
        title,
        workplace,
        startDate,
        endDate,
        photo: key,
        userId
      }).save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => ExperienceResponse)
  async updateExperience(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => ExperienceInput) input: ExperienceInput,
    @Ctx() { req }: Context
  ): Promise<ExperienceResponse> {
    const { userId } = req.session
    const { title, photo } = input
    if (title != undefined && title == '') {
      return {
        errors: [{
          field: 'title',
          message: 'Title cannot be empty!'
        }]
      }
    }
    const experience = await Experience.findOne({ where: { id, userId } })
    if (!experience) {
      throw new Error('Not authorised!')
    }
    saveAttributes<Experience, ExperienceInput>(experience, input)
    if (photo) {
      const { createReadStream, filename, } = await photo
      const ext = getExtensionFromFilename(filename)
      const stream = createReadStream()
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `users/${userId}/photos/experiences/${v4()}.${ext}`,
      }).promise()
      experience.photo = uploaded.Key
    }
    return {
      experience: await experience.save()
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteExperience(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const experience = await Experience.findOne({ where: { id, userId } })
    if (!experience) {
      throw new Error('Not authorised!')
    }
    await experience.remove()
    return true
  }
}