import { s3 } from '@configs'
import { Arg, Query, Resolver } from 'type-graphql'

@Resolver()
export class S3Resolver {
  @Query(() => String, { nullable: true })
  getSignedUrl(
    @Arg('key') key: string
  ): Promise<String | null> {
    return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key })
  }

  @Query(() => [String])
  getSignedUrls(
    @Arg('keys', () => [String]) keys: string[]
  ): Promise<string[]> {
    return Promise.all(keys.map(async key =>
      await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key })))
  }
}