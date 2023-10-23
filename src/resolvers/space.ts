import { s3 } from '@configs'
import { Space, SpaceSubscription, User } from '@entities'
import { PhotoResponse, SpaceInfo, SpaceResponse, UploadedFileResponse } from '@graphql-types'
import { isAuth } from '@src/middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, saveAttributes } from '@utils'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { In } from 'typeorm'
import { v4 } from 'uuid'

@Resolver(Space)
export class SpaceResolver {

  @FieldResolver(() => String)
  async avatarUrl(
    @Root() space: Space
  ): Promise<string | null> {
    return space.avatar ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: space.avatar }) : null
  }

  @FieldResolver(() => String)
  async coverPhotoUrl(
    @Root() space: Space
  ): Promise<string | null> {
    return space.avatar ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: space.coverPhoto }) : null
  }

  @Query(() => Boolean, { nullable: true })
  @FieldResolver(() => Boolean, { nullable: true })
  async subscriptionStatus(
    @Root() root: Space,
    @Arg('spaceId', () => Int, { nullable: true }) spaceId: number,
    @Ctx() { req, subscriptionLoader }: Context
  ): Promise<boolean | null> {
    if (spaceId) {
      return req.session?.userId ?
        subscriptionLoader.load({ spaceId, userId: req.session.userId })
        :
        null
    }
    else {
      return req.session?.userId ?
        subscriptionLoader.load({ spaceId: root.id, userId: req.session.userId })
        :
        null
    }
  }

  @FieldResolver(() => Boolean)
  async modStatus(
    @Root() root: Space,
    @Ctx() { req, modStatusLoader }: Context
  ): Promise<boolean> {
    return req.session?.userId ?
      modStatusLoader.load({ spaceId: root.id, userId: req.session.userId })
      :
      false
  }

  @FieldResolver(() => Int)
  async subscriberNumber(
    @Root() space: Space,
    @Ctx() { subscriberNumberLoader }: Context
  ): Promise<number> {
    return subscriberNumberLoader.load(space.id)
  }

  @UseMiddleware(isAuth)
  @Query(() => [Space])
  async mySpaces(
    @Ctx() { orm, req }: Context
  ): Promise<Space[]> {
    const mySpaceIds: { spaceId: number }[] = await orm.query(`
      SELECT "spaceId" FROM space_mods_user WHERE "userId" = ${req.session.userId};
    `)
    return Space.findBy({ id: In(mySpaceIds.map(item => item.spaceId)) })
  }

  @Mutation(() => SpaceResponse)
  @UseMiddleware(isAuth)
  async createSpace(
    @Arg('spaceName', () => String) spaceName: string,
    @Ctx() { req }: Context
  ): Promise<SpaceResponse | null> {
    const s = await Space.findOne({ where: { spaceName } })
    if (s) {
      return {
        errors: [{
          field: 'spaceName',
          message: 'Space already exists.'
        }]
      }
    }
    if (!/^[A-Za-z0-9_-]*$/.test(spaceName)) {
      return {
        errors: [{
          field: 'spaceName',
          message: 'Space\'s name must contain only letters, numbers, underscores and dashes.'
        }]
      }
    }
    const space = Space.create({ spaceName })
    space.mods = [(await User.findOneBy({ id: req.session.userId }))!]
    await space.save()
    await SpaceSubscription.create({ spaceId: space.id, userId: req.session.userId }).save()
    return { space }
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadSpaceAvatar(
    @Arg('spaceId', () => Int) spaceId: number,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req, orm }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const modProof = await orm.query(`
        SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
      `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `spaces/${spaceId}/photos/avatars/${v4()}.${ext}`,
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
  async changeSpaceAvatar(
    @Arg('spaceId', () => Int) spaceId: number,
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    await Space.update({ id: spaceId }, { avatar: key })
    return true
  }

  @UseMiddleware(isAuth)
  @Query(() => [PhotoResponse])
  async spaceAvatars(
    @Arg('spaceId', () => Int) spaceId: number,
    @Ctx() { req, orm }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `spaces/${spaceId}/photos/avatars` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `spaces/${spaceId}/photos/avatars`)
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
  async deleteSpaceAvatar(
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const regex = new RegExp('(?<=spaces/)(.*)(?=/photos/avatars)')
    const spaceId = regex.exec(key)?.[0]
    if (!spaceId) {
      throw new Error('Invalid key.')
    }
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise()
    return true
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadSpaceCoverPhoto(
    @Arg('spaceId', () => Int) spaceId: number,
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req, orm }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const modProof = await orm.query(`
        SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
      `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `spaces/${spaceId}/photos/coverPhotos/${v4()}.${ext}`,
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
  async changeSpaceCoverPhoto(
    @Arg('spaceId', () => Int) spaceId: number,
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    await Space.update({ id: spaceId }, { coverPhoto: key })
    return true
  }

  @Query(() => [PhotoResponse])
  @UseMiddleware(isAuth)
  async spaceCoverPhotos(
    @Arg('spaceId', () => Int) spaceId: number,
    @Ctx() { req, orm }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `spaces/${spaceId}/photos/coverPhotos` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `spaces/${spaceId}/photos/coverPhotos`)
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
  async deleteSpaceCoverPhoto(
    @Arg('key', () => String) key: string,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const regex = new RegExp('(?<=spaces/)(.*)(?=/photos/coverPhotos)')
    const spaceId = regex.exec(key)?.[0]
    if (!spaceId) {
      throw new Error('Invalid key.')
    }
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${spaceId} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: key }).promise()
    return true
  }

  @Query(() => Space, { nullable: true })
  async space(
    @Arg('spaceName', () => String) spaceName: string
  ): Promise<Space | null> {
    return Space.findOne({ where: { spaceName } })
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async subscribe(
    @Arg('spaceId', () => Int) spaceId: number,
    @Ctx() { req }: Context
  ) {
    const { userId } = req.session

    const subscription = await SpaceSubscription.findOne({ where: { spaceId, userId } })
    if (!subscription) {
      const space = await Space.findOne({ where: { id: spaceId } })
      if (!space) {
        return false
      }
      await SpaceSubscription.create({ spaceId, userId }).save()
    }
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async unsubscribe(
    @Arg('spaceId', () => Int) spaceId: number,
    @Ctx() { req }: Context
  ) {
    const { userId } = req.session

    const subscription = await SpaceSubscription.findOne({ where: { spaceId, userId } })
    if (subscription) {
      await subscription.remove()
    }
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteSpace(
    @Arg('id', () => Int) id: number,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${id} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `spaces/${id}` }).promise()
    result?.Contents?.forEach(async c => {
      if (c.Key) {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: c.Key }).promise()
      }
    })
    await Space.delete({ id })
    return true
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateSpaceInfo(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => SpaceInfo) input: SpaceInfo,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const modProof = await orm.query(`
      SELECT * FROM space_mods_user WHERE "spaceId" = ${id} AND "userId" = ${userId};
    `)
    if (modProof.length == 0) {
      throw new Error('You are not a mod of this space.')
    }
    const space = await Space.findOneBy({ id })
    saveAttributes<Space, SpaceInfo>(space, input)
    await space!.save()
    return true
  }
}