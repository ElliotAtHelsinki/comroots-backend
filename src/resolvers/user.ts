import { ConversationCol, InboxCol } from '@collections'
import { s3 } from '@configs'
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX, __prod__ } from '@constants'
import { Vote, User, UserFollow, Conversation as ConversationEnt } from '@entities'
import { ForgotPasswordResponse, Location, PhotoResponse, UploadedFileResponse, UserInfo, UserResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, isValidEmail, saveAttributes, sendEmail, validateLogin, validateRegister } from '@utils'
import argon2 from 'argon2'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { ArrayContains } from 'typeorm'
import { v4 } from 'uuid'

@Resolver(User)
export class UserResolver {

  @Query(() => Boolean, { nullable: true })
  @FieldResolver(() => Boolean, { nullable: true })
  async userFollowStatus(
    @Root() root: User,
    @Arg('id', () => Int, { nullable: true }) id: number,
    @Ctx() { req, userFollowLoader }: Context
  ): Promise<boolean | null> {
    const { userId } = req.session
    if (id) {
      return userId ?
        userFollowLoader.load({ followedUserId: id, followingUserId: userId })
        :
        null
    }
    else {
      return userId ?
        userFollowLoader.load({ followedUserId: root.id, followingUserId: userId })
        :
        null
    }
  }

  @Query(() => String, { nullable: true })
  @FieldResolver(() => String)
  async avatarUrl(
    @Root() user: User,
    @Ctx() { req }: Context
  ): Promise<string | null> {
    if (user) {
      if (user.avatar) {
        return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: user.avatar })
      }
      return null
    }
    else {
      const thisUser = await User.findOneBy({ id: req.session.userId })
      return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: thisUser!.avatar })
    }
  }

  @Query(() => String, { nullable: true })
  @FieldResolver(() => String)
  async coverPhotoUrl(
    @Root() user: User,
    @Ctx() { req }: Context
  ): Promise<string | null> {
    if (user) {
      if (user.coverPhoto) {
        return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: user.coverPhoto })
      }
      return null
    }
    else {
      const thisUser = await User.findOneBy({ id: req.session.userId })
      return s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: thisUser!.coverPhoto })
    }
  }

  @FieldResolver(() => Int)
  async followerNumber(
    @Root() user: User,
    @Ctx() { userFollowerNumberLoader }: Context
  ): Promise<number> {
    return userFollowerNumberLoader.load(user.id)
  }

  @FieldResolver(() => Int)
  async followingNumber(
    @Root() user: User,
    @Ctx() { userFollowingNumberLoader }: Context
  ): Promise<number> {
    return userFollowingNumberLoader.load(user.id)
  }

  @FieldResolver(() => String)
  email(
    @Root() user: User,
    @Ctx() { req }: Context
  ): string | null {
    if (req.session.userId == user.id) {
      return user.email!
    }
    return ''
  }

  @Query(() => User, { nullable: true })
  async user(
    @Arg('username', () => String) username: string,
  ): Promise<User | null> {

    return await User.findOne({ where: { username } })
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: Context
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [{
          field: 'newPassword',
          message: 'Password must be at least 8 characters.'
        }]
      }
    }
    if (newPassword.length > 128) {
      return {
        errors: [{
          field: 'newPassword',
          message: 'Password must not be longer than 128 characters.'
        }]
      }
    }

    const redisKey = FORGET_PASSWORD_PREFIX + token

    const userId = await redis.get(redisKey)
    if (!userId) {
      return {
        errors: [{
          field: 'token',
          message: 'Token invalid/expired.'
        }]
      }
    }
    const id = parseInt(userId)
    const user = await User.findOneBy({ id })

    if (!user) {
      return {
        errors: [{
          field: 'token',
          message: 'User no longer exists.'
        }]
      }
    }

    await User.update({ id }, { password: await argon2.hash(newPassword) })
    await redis.del(redisKey)

    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: Context
  ): Promise<ForgotPasswordResponse> {
    if (!isValidEmail(email)) {
      return {
        errors: [{
          field: 'email',
          message: 'Invalid email.'
        }],
        success: false
      }
    }

    const user = await User.findOneBy({ email })
    if (!user) {
      return { success: true }
    }

    const token = v4()
    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 3)

    await sendEmail(
      email,
      `<a href='${process.env.FRONTEND_ORIGIN}/change-password/${token}'>Reset Password</a>`
    )
    return { success: true }
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | null> {
    if (!req.session.userId) {
      return null
    }
    return User.findOneBy({ id: req.session.userId })
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('email') email: string,
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Arg('location', () => Location, { nullable: true }) location: Location,
    @Ctx() { orm, req }: Context
  ): Promise<UserResponse> {
    const errors = validateRegister(email, username, password)
    if (errors) {
      return { errors }
    }
    const hashedPassword = await argon2.hash(password)
    let user: User
    try {
      const result = await orm.createQueryBuilder().insert().into(User).values({
        email,
        username,
        password: hashedPassword,
        mostRecentLatitude: location?.latitude,
        mostRecentLongitude: location?.longitude
      }).returning('*').execute()
      user = result.raw[0]
    }
    catch (err) {
      if (err.code == '23505') {
        const erroneousField: string = err.detail.slice(err.detail.indexOf('(') + 1, err.detail.indexOf(')'))
        return {
          errors: [{
            field: erroneousField,
            message: `${erroneousField.charAt(0).toUpperCase() + erroneousField.slice(1)} already taken.`
          }]
        }
      }
      else {
        console.error(err)
        throw new Error('Internal Server Error!')
      }
    }
    req.session.userId = user!.id
    return { user: user! }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('emailOrUsername') emailOrUsername: string,
    @Arg('password') password: string,
    @Arg('location', () => Location, { nullable: true }) location: Location,
    @Ctx() ctx: Context
  ): Promise<UserResponse> {
    const { req } = ctx
    const { input, errors } = validateLogin(emailOrUsername, password)
    if (errors) {
      return { errors }
    }
    let user: User | null
    try {
      user = await User.findOneBy(
        input == 'Email' ? { email: emailOrUsername } : { username: emailOrUsername }
      )
      if (!user) {
        return {
          errors: [{
            field: 'emailOrUsername',
            message: `${input} doesn\'t exist.`
          }]
        }
      }
    }
    catch (err) {
      return {
        errors: [{
          field: 'emailOrUsername',
          message: 'Internal Server Error!'
        }]
      }
    }
    const valid = await argon2.verify(user!.password!, password)
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'Incorrect password!'
        }]
      }
    }
    req.session.userId = user.id
    if (location) {
      const { latitude, longitude } = location
      await User.update({ id: user.id }, { mostRecentLatitude: latitude, mostRecentLongitude: longitude })
    }
    return { user }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve) => {
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME,
          {
            sameSite: __prod__ ? 'lax' : 'none',
            secure: true,
          }
        )
        if (err) {
          console.error(err)
          resolve(false)
        }
        else {
          resolve(true)
        }
      })
    })
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteUser(
    @Arg('id', () => Int) id: number,
    @Ctx() { req, orm }: Context
  ): Promise<boolean> {
    const user = await User.findOneBy({ id })
    if (!user) {
      return false
    }
    if (user.id != req.session.userId) {
      throw new Error('Not authorised!')
    }
    const votes = await Vote.findBy({ userId: id })
    const upvotes = votes.filter(v => v.value == 1)
    const downvotes = votes.filter(v => v.value == -1)
    const upvotedPostIds = upvotes.map(u => u.postId)
    const downvotedPostIds = downvotes.map(d => d.postId)
    if (upvotedPostIds.length > 0) {
      orm.query(`
        UPDATE post SET points = points - 1 WHERE id IN (${upvotedPostIds.join(', ')});
      `)
    }
    if (downvotedPostIds.length > 0) {
      orm.query(`
        UPDATE post SET points = points + 1 WHERE id IN (${downvotedPostIds.join(', ')});
      `)
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `users/${user.id}` }).promise()
    result?.Contents?.forEach(async c => {
      if (c.Key) {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: c.Key }).promise()
      }
    })
    const conversations = await ConversationEnt.findBy({ participants: ArrayContains([req.session.userId!]) })
    conversations.forEach(async c => {
      await ConversationCol.delete(c.firestoreCollectionId)
      const inboxes = await InboxCol.whereArrayContains('conversationIds', c.firestoreCollectionId).find()
      inboxes.forEach(async i => {
        i.conversationIds = i.conversationIds.filter(id => id != c.firestoreCollectionId)
        await InboxCol.update(i)
      })
      const inbox = await InboxCol.whereEqualTo('userId', req.session.userId!).findOne()
      await InboxCol.delete(inbox!.id)
      await c.remove()
    })
    await user.remove()
    return true
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateInfo(
    @Arg('input', () => UserInfo) input: UserInfo,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const user = await User.findOneBy({ id: req.session.userId })
    saveAttributes<User, UserInfo>(user, input)
    await user!.save()
    return true
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadAvatar(
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `users/${userId}/photos/avatars/${v4()}.${ext}`,
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
  async changeAvatar(
    @Arg('key', () => String) key: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    await User.update({ id: userId }, { avatar: key })
    return true
  }

  @Mutation(() => UploadedFileResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async uploadCoverPhoto(
    @Arg('upload', () => GraphQLUpload) upload: FileUpload,
    @Ctx() { req }: Context
  ): Promise<UploadedFileResponse> {
    const { userId } = req.session
    const { createReadStream, filename, mimetype, encoding } = upload as FileUpload
    const stream = createReadStream()
    const ext = getExtensionFromFilename(filename)
    const uploaded = await s3.upload({
      Bucket: process.env.S3_BUCKET,
      Body: stream,
      Key: `users/${userId}/photos/coverPhotos/${v4()}.${ext}`,
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
  async changeCoverPhoto(
    @Arg('key', () => String) key: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    await User.update({ id: userId }, { coverPhoto: key })
    return true
  }

  @Query(() => [PhotoResponse])
  @UseMiddleware(isAuth)
  async avatars(
    @Ctx() { req }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `users/${userId}/photos/avatars` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `users/${userId}/photos/avatars`)
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
  async coverPhotos(
    @Ctx() { req }: Context
  ): Promise<PhotoResponse[]> {
    const { userId } = req.session
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `users/${userId}/photos/coverPhotos` }).promise()
    let keys = result?.Contents?.map(item => item.Key as string)
    if (keys == undefined || keys.length == 0) {
      return []
    }
    else {
      keys = keys.filter(k => k != `users/${userId}/photos/coverPhotos`)
      return Promise.all(keys.map(async key => {
        return {
          key,
          url: await s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: key })
        } as PhotoResponse
      }))
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async followUser(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ) {
    const { userId } = req.session
    if (id == userId) {
      throw new Error('You can\'t follow yourself!')
    }
    const follow = await UserFollow.findOneBy({ followingUserId: userId, followedUserId: id })
    if (!follow) {
      const user = await User.findOneBy({ id })
      if (!user) {
        return false
      }
      await UserFollow.create({ followingUserId: userId, followedUserId: id }).save()
    }
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async unfollowUser(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: Context
  ) {
    const { userId } = req.session

    const follow = await UserFollow.findOneBy({ followingUserId: userId, followedUserId: id })
    if (follow) {
      await follow.remove()
    }
    return true
  }

  @Mutation(() => [String], { nullable: true })
  async setSkills(
    @Arg('skills', () => [String]) skills: string[],
    @Ctx() { req }: Context
  ): Promise<string[] | null> {
    const { userId } = req.session
    const user = await User.findOneBy({ id: userId })
    if (!user) {
      return []
    }
    user.skills = skills
    await user.save()
    return user.skills
  }
}