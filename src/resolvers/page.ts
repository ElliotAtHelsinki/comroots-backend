import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { Page, PageFollow, User } from '@entities'
import { Context } from '@types'
import { isAuth } from '@middlewares'
import { In } from 'typeorm'
import { s3 } from '@configs'
import { PageInfo, PageResponse, PhotoResponse, UploadedFileResponse } from '@graphql-types'
import _ from 'lodash'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import { v4 } from 'uuid'
import { getExtensionFromFilename, saveAttributes } from '@utils'

@Resolver(Page)
export class PageResolver {
  @FieldResolver(() => String)
  avatarUrl(
    @Root() page: Page
  ): Promise<string | null> {
    return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: page.avatar })
  }

  @FieldResolver(() => String)
  coverPhotoUrl(
    @Root() page: Page
  ): Promise<string | null> {
    return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: page.coverPhoto })
  }

  @Query(() => Boolean, { nullable: true })
  @FieldResolver(() => Boolean, { nullable: true })
  async followStatus(
    @Root() root: Page,
    @Arg('pageId', () => Int, { nullable: true }) pageId: number,
    @Ctx() { req, followLoader }: Context
  ): Promise<boolean | null> {
    const { userId } = req.session
    if (pageId) {
      return userId ?
        followLoader.load({ pageId, userId })
        :
        null
    }
    else {
      return userId ?
        followLoader.load({ pageId: root.id, userId })
        :
        null
    }
  }

  @FieldResolver(() => Boolean, { nullable: true })
  async ownerStatus(
    @Root() root: Page,
    @Ctx() { req, ownerStatusLoader }: Context
  ): Promise<boolean | null> {
    const { userId } = req.session
    return userId ?
      ownerStatusLoader.load({ pageId: root.id, userId })
      :
      null
  }

  @FieldResolver(() => Int)
  async followerNumber(
    @Root() page: Page,
    @Ctx() { followerNumberLoader }: Context
  ): Promise<number> {
    return followerNumberLoader.load(page.id)
  }

  @Query(() => Page)
  async page(
    @Arg('pageName', () => String) pageName: string,
  ): Promise<Page | null> {
    return Page.findOneBy({ pageName })
  }

  @UseMiddleware(isAuth)
  @Query(() => [Page])
  async myPages(
    @Ctx() { orm, req }: Context
  ): Promise<Page[]> {
    const myPageIds: { pageId: number }[] = await orm.query(`
      SELECT "pageId" FROM page_owners_user WHERE "userId" = ${req.session.userId};
    `)
    return Page.findBy({ id: In(myPageIds.map(item => item.pageId)) })
  }

  @UseMiddleware(isAuth)
  @Mutation(() => PageResponse)
  async createPage(
    @Arg('pageName') pageName: string,
    @Ctx() { req }: Context
  ): Promise<PageResponse> {
    const { userId } = req.session
    const p = await Page.findOne({ where: { pageName } })
    if (p) {
      return {
        errors: [{
          field: 'pageName',
          message: 'Page already exists.'
        }]
      }
    }
    if (!/^[A-Za-z0-9_-]*$/.test(pageName)) {
      return {
        errors: [{
          field: 'pageName',
          message: 'Page\'s name must contain only letters, numbers, underscores and dashes.'
        }]
      }
    }
    const page = await Page.create({
      pageName,
      owners: [(await User.findOneBy({ id: userId }))!],
    }).save()
    await PageFollow.create({ pageId: page.id, userId }).save()
    return { page }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deletePage(
    @Arg('id', () => Int) id: number,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const page = await Page.findOne({ where: { id } })
    if (!page) {
      throw new Error('Page not found.')
    }
    const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
      SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${id};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    try {
      const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `pages/${id}` }).promise()
      result?.Contents?.forEach(async c => {
        if (c.Key) {
          await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: c.Key }).promise()
        }
      })
      await page.remove()
      return true
    }
    catch (e) {
      console.error(e)
      return false
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async follow(
    @Arg('pageId', () => Int) pageId: number,
    @Ctx() { orm, req }: Context
  ) {
    const { userId } = req.session

    const follow = await PageFollow.findOne({ where: { pageId, userId } })
    if (!follow) {
      const page = await Page.findOne({ where: { id: pageId } })
      if (!page) {
        return false
      }
      await PageFollow.create({ pageId, userId }).save()
    }
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async unfollow(
    @Arg('pageId', () => Int) pageId: number,
    @Ctx() { req }: Context
  ) {
    const { userId } = req.session

    const follow = await PageFollow.findOne({ where: { pageId, userId } })
    if (follow) {
      await follow.remove()
    }
    return true
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadPageAvatar(
    @Arg('pageId', () => Int) pageId: number,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req, orm }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `pages/${pageId}/photos/avatars/${v4()}.${ext}`,
    }).promise()
    return {
      filename,
      mimetype,
      encoding,
      url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: uploaded.Key })
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async changePageAvatar(
    @Arg('pageId', () => Int) pageId: number,
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    await Page.update({ id: pageId }, { avatar: key })
    return true
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadPageCoverPhoto(
    @Arg('pageId', () => Int) pageId: number,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req, orm }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `pages/${pageId}/photos/coverPhotos/${v4()}.${ext}`,
    }).promise()
    return {
      filename,
      mimetype,
      encoding,
      url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: uploaded.Key })
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async changePageCoverPhoto(
    @Arg('pageId', () => Int) pageId: number,
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    await Page.update({ id: pageId }, { coverPhoto: key })
    return true
  }

  @Query(() => [PhotoResponse])
  @UseMiddleware(isAuth)
  async pageAvatars(
    @Arg('pageId', () => Int) pageId: number,
    @Ctx() { req, orm }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `pages/${pageId}/photos/avatars` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `pages/${pageId}/photos/avatars`)
      return Promise.all(keys.map(async key => {
        return {
          key,
          url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key })
        } as PhotoResponse
      }))
    }
  }

  @Query(() => [PhotoResponse])
  @UseMiddleware(isAuth)
  async pageCoverPhotos(
    @Arg('pageId', () => Int) pageId: number,
    @Ctx() { req, orm }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${pageId} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `pages/${pageId}/photos/coverPhotos` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `pages/${pageId}/photos/coverPhotos`)
      return Promise.all(keys.map(async key => {
        return {
          key,
          url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key })
        } as PhotoResponse
      }))
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updatePageInfo(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => PageInfo) input: PageInfo,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const ownerProof = await orm.query(`
      SELECT * FROM page_owners_user WHERE "pageId" = ${id} AND "userId" = ${userId};
    `)
    if (ownerProof.length == 0) {
      throw new Error('You are not an owner of this page.')
    }
    const page = await Page.findOneBy({ id })
    saveAttributes<Page, PageInfo>(page, input)
    await page!.save()
    return true
  }
}