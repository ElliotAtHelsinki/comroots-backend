import { s3 } from '@configs'
import { Offer, OfferApplication, Page, PageFollow, Space, SpaceSubscription, User, UserFollow } from '@entities'
import { OfferResponse, PaginatedOffers, OfferInputUpdate, OfferInputCreate } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename, saveAttributes, toPostgresTime } from '@utils'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { In } from 'typeorm'
import { v4 } from 'uuid'

@Resolver(Offer)
export class OfferResolver {

  @FieldResolver(() => String)
  async photoUrl(
    @Root() offer: Offer
  ): Promise<string | null> {
    return offer.photo ? s3.getSignedUrlPromise('getObject', { Bucket: process.env.S3_BUCKET, Key: offer.photo }) : null
  }

  @FieldResolver(() => [User], { nullable: true })
  async applications(
    @Root() offer: Offer,
    @Ctx() { orm, req, applicationLoader }: Context
  ) {
    const { userId } = req.session

    if (offer.creatorType == 'user') {
      if (offer.creatorId != req.session.userId) {
        return null
      }
    }
    else {
      if (!userId) {
        return null
      }
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
        SELECT * FROM page_owners_user WHERE "userId" = ${userId} AND "pageId" = ${offer.pageCreatorId};
      `)
      if (ownerProof.length == 0) {
        return null
      }
    }
    return applicationLoader.load(offer.id)
  }

  @FieldResolver(() => String)
  applicationStatus(
    @Root() root: Offer,
    @Ctx() { req, applicationStatusLoader }: Context
  ) {
    const { userId } = req.session
    return userId ? applicationStatusLoader.load({ offerId: root.id, userId }) : null
  }

  @FieldResolver(() => User)
  creator(
    @Root() root: Offer,
    @Ctx() { userLoader }: Context
  ) {
    return root.creatorId ? userLoader.load(root.creatorId) : null
  }

  @FieldResolver(() => Page)
  pageCreator(
    @Root() root: Offer,
    @Ctx() { pageLoader }: Context
  ) {
    return root.pageCreatorId ? pageLoader.load(root.pageCreatorId) : null
  }


  @FieldResolver(() => Space)
  async space(
    @Root() root: Offer,
    @Ctx() { spaceLoader }: Context
  ): Promise<Space> {
    return spaceLoader.load(root.spaceId)
  }

  @FieldResolver(() => Int)
  async applicantsNo(
    @Root() root: Offer,
    @Ctx() { applicantsNoLoader }: Context
  ): Promise<number> {
    return applicantsNoLoader.load(root.id)
  }

  @Query(() => PaginatedOffers)
  async offers(
    @Ctx() { req, orm }: Context,
    @Arg('spaceId', () => Int, { nullable: true }) spaceId: number,
    @Arg('pageId', () => Int, { nullable: true }) pageId: number,
    @Arg('userId', () => Int, { nullable: true }) userId: number,
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedOffers> {

    // DESC: latest to oldest; ASC: oldest to latest
    const realLimit = Math.min(limit, 50)
    const realLimitPlusOne = realLimit + 1

    const general = !spaceId && !pageId && !userId
    let subscribedSpaceIds
    let followedPageIds
    let followedUserIds
    if (general) {
      const SpaceSubscriptions = await SpaceSubscription.findBy({ userId: req.session.userId })
      const PageFollows = await PageFollow.findBy({ userId: req.session.userId })
      const UserFollows = await UserFollow.findBy({ followingUserId: req.session.userId })
      subscribedSpaceIds = SpaceSubscriptions.map(ss => ss.spaceId)
      followedPageIds = PageFollows.map(pf => pf.pageId)
      followedUserIds = UserFollows.map(uf => uf.followedUserId)
    }

    const offers: Offer[] = await orm.query(`
      SELECT *
      FROM offer o
      ${cursor ? `WHERE o."createdAt" < '${toPostgresTime(cursor)}'` : 'WHERE true'} 
      ${spaceId ? `AND o."spaceId" = ${spaceId}` : ''}
      ${pageId ? `AND o."pageCreatorId" = ${pageId}` : ''}
      ${userId ? `AND o."creatorId" = ${userId}` : ''}
      ${general && req.session.userId ? `
        AND (
          ${subscribedSpaceIds && subscribedSpaceIds.length ? `o."spaceId" IN (${subscribedSpaceIds.join(', ')})` : 'false'}
          ${followedPageIds && followedPageIds.length ? `OR o."pageCreatorId" IN (${followedPageIds.join(', ')})` : 'OR false'}
          ${followedUserIds && followedUserIds.length ? `OR o."creatorId" IN (${followedUserIds.join(', ')})` : 'OR false'}
          OR o."creatorId" = ${req.session.userId}
        )
        ` : ''
      }
      ORDER BY 
        ${req.session.userId ? `o."creatorId" = ${req.session.userId} DESC,` : ''} 
        o."createdAt" DESC
      LIMIT ${realLimitPlusOne}
    `)

    return {
      offers: offers.slice(0, realLimit),
      hasMore: offers.length - 1 == realLimit
    }
  }

  @Query(() => Offer, { nullable: true })
  async offer(
    @Arg('id', () => Int) id: number,
  ): Promise<Offer | null> {

    return await Offer.findOneBy({ id })
  }

  @Mutation(() => OfferResponse)
  @UseMiddleware(isAuth)
  async createOffer(
    @Ctx() { orm, req }: Context,
    @Arg('input', () => OfferInputCreate) input: OfferInputCreate,
  ): Promise<OfferResponse> {
    const {
      pageId,
      spaceName,
      title,
      address,
      benefits,
      department,
      description,
      employmentType,
      recruiting,
      requirements,
      salaryRange,
      workplace,
      photo
    } = input

    if (!spaceName) {
      return {
        errors: [{
          field: 'spaceName',
          message: 'Space cannot be empty.'
        }]
      }
    }

    if (!title) {
      return {
        errors: [{
          field: 'title',
          message: 'Title is required.'
        }]
      }
    }

    const space = await Space.findOne({ where: { spaceName } })
    if (!space) {
      return {
        errors: [{
          field: 'spaceName',
          message: 'Space does not exist!'
        }]
      }
    }

    if (pageId) {
      const page = await Page.findOne({ where: { id: pageId } })
      if (!page) {
        return {
          errors: [{
            field: 'pageId',
            message: 'Page does not exist!'
          }]
        }
      }
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
        SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${pageId};
      `)
      if (ownerProof.length == 0) {
        throw new Error('You are not an owner of this page.')
      }
    }
    else {
      const subscription = await SpaceSubscription.findOne({ where: { spaceId: space.id, userId: req.session.userId } })
      if (!subscription) {
        return {
          errors: [{
            field: 'spaceName',
            message: 'You are not subscribed to this space!'
          }]
        }
      }
    }
    const offer = await Offer.create({
      spaceId: space.id,
      creatorType: pageId ? 'page' : 'user',
      creatorId: req.session.userId,
      pageCreatorId: pageId,
      title,
      address,
      benefits,
      department,
      description,
      employmentType,
      recruiting,
      requirements,
      salaryRange, workplace,
    }).save()
    if (photo) {
      const { createReadStream, filename } = await photo
      const stream = createReadStream()
      const ext = getExtensionFromFilename(filename)
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `offers/${offer.id}/${v4()}.${ext}`,
      }).promise()
      offer.photo = uploaded.Key
      await offer.save()
    }

    return {
      offer
    }
  }

  @Mutation(() => Offer, { nullable: true })
  @UseMiddleware(isAuth)
  async updateOffer(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => OfferInputUpdate) input: OfferInputUpdate,
    @Ctx() { orm, req }: Context
  ): Promise<Offer | null> {
    const { photo } = input
    const offer = await Offer.findOne({ where: { id } })
    if (offer) {
      if (offer.creatorType == 'user') {
        if (offer.creatorId != req.session.userId) {
          throw new Error('Not authorised!')
        }
      }
      else {
        const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${offer.pageCreatorId};
        `)
        if (ownerProof.length == 0) {
          throw new Error('Not authorised!')
        }
      }
      saveAttributes<Offer, OfferInputUpdate>(offer, input)
      if (photo) {
        const { createReadStream, filename, } = await photo
        const ext = getExtensionFromFilename(filename)
        const stream = createReadStream()
        const uploaded = await s3.upload({
          Bucket: process.env.S3_BUCKET,
          Body: stream,
          Key: `offers/${offer.id}/${v4()}.${ext}`,
        }).promise()
        offer.photo = uploaded.Key
      }
      return await offer.save()
    }
    else {
      throw new Error('Offer not found.')
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteOffer(
    @Arg('id', () => Int) id: number,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const offer = await Offer.findOneBy({ id })
    if (!offer) {
      return false
    }
    if (offer.creatorType == 'user') {
      if (offer.creatorId != req.session.userId) {
        throw new Error('Not authorised!')
      }
    }
    else {
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${offer.pageCreatorId};
        `)
      if (ownerProof.length == 0) {
        throw new Error('Not authorised!')
      }
    }
    const result = await s3.listObjectsV2({ Bucket: process.env.S3_BUCKET, Prefix: `offers/${offer.id}` }).promise()
    result?.Contents?.forEach(async c => {
      if (c.Key) {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: c.Key }).promise()
      }
    })
    await offer.remove()
    return true
  }

  @Mutation(() => Boolean)
  triggerOffersInvalidate() {
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => OfferApplication)
  async apply(
    @Arg('offerId', () => Int) offerId: number,
    @Ctx() { req }: Context
  ): Promise<OfferApplication> {
    const { userId } = req.session
    const offer = await Offer.findOne({ where: { id: offerId } })
    if (!offer) {
      throw new Error('Offer not found.')
    }
    if (offer.creatorId == userId) {
      throw new Error('You cannot apply to your own offer.')
    }
    if (!offer.recruiting) {
      throw new Error('Offer is not recruiting.')
    }
    const application = await OfferApplication.findOneBy({ offerId, userId })
    if (application) {
      throw new Error('You have already applied to this offer.')
    }
    return OfferApplication.create({
      offerId,
      userId: req.session.userId
    }).save()
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteOfferApplication(
    @Arg('offerId', () => Int) offerId: number,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const application = await OfferApplication.findOneBy({ offerId, userId })
    if (application) {
      if (application.userId == userId) {
        await application.remove()
        return true
      }
      else {
        throw new Error('Not authorised!')
      }
    }
    return false
  }

  @UseMiddleware(isAuth)
  @Mutation(() => OfferApplication)
  async updateApplicationStatus(
    @Arg('id', () => Int) id: number,
    @Arg('status', () => String) status: 'accepted' | 'rejected',
    @Ctx() { req }: Context
  ): Promise<OfferApplication> {
    const { userId } = req.session
    const application = await OfferApplication.findOne({ where: { id } })
    if (!application) {
      throw new Error('Application not found.')
    }
    const offer = (await Offer.findOne({ where: { id: application.offerId } })) as Offer
    if (offer.creatorType == 'user') {
      if (offer.creatorId != userId) {
        throw new Error('Not authorised!')
      }
    }
    else {
      const page = await Page.findOne({ where: { id: offer.pageCreatorId }, relations: { owners: true } })
      if (!page?.owners?.map(o => o.id).includes(userId!)) {
        throw new Error('Not authorised!')
      }
    }
    if (!['accepted', 'rejected'].includes(status)) {
      throw new Error('Invalid status.')
    }
    application.status = status
    return application.save()
  }

  @UseMiddleware(isAuth)
  @Query(() => [Offer])
  async appliedOffers(
    @Ctx() { req }: Context
  ): Promise<Offer[]> {
    const { userId } = req.session
    const applications = await OfferApplication.find({ where: { userId } })
    const offerIds = applications.map(a => a.offerId)
    return await Offer.find({ where: { id: In(offerIds) } })
  }
}