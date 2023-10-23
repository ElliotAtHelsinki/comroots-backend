import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { CV } from '@entities'
import { UploadedFileResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { getExtensionFromFilename } from '@utils'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { v4 } from 'uuid'
import { Context } from '@types'
import { s3 } from '@configs'

@Resolver(CV)
export class CVResolver {

  @FieldResolver()
  async url(
    @Root() cv: CV,
    @Ctx() { req }: Context
  ): Promise<string> {
    return cv.key ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: cv.key }) : ''
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadCV(
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `users/${userId}/cvs/${filename}`,
    }).promise()
    await CV.create({ filename, key: uploaded.Key, userId }).save()
    return {
      filename,
      mimetype,
      encoding,
      url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: uploaded.Key })
    }
  }

  @Query(() => [CV], { nullable: true })
  async cvs(
    @Arg('userId', () => Int) userId: number,
  ): Promise<CV[] | null> {
    return CV.findBy({ userId })
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteCV(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const cv = await CV.findOneBy({ id, userId })
    if (!cv) {
      throw new Error('Not authorised!')
    }
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: cv.key! }).promise()
    await cv.remove()
    return true
  }
}