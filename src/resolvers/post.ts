import { Page, PageFollow, Post, Space, SpaceSubscription, Tag, User, UserFollow, Vote } from '@entities'
import { PaginatedPosts, PostInputCreate, PostInputUpdate, PostResponse } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { saveAttributes, toPostgresTime } from '@utils'
import _ from 'lodash'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'
import { In } from 'typeorm'

@Resolver(Post)
export class PostResolver {

  @FieldResolver(() => User)
  creator(
    @Root() root: Post,
    @Ctx() { userLoader }: Context
  ) {
    return root.creatorId ? userLoader.load(root.creatorId) : null
  }

  @FieldResolver(() => Page)
  pageCreator(
    @Root() root: Post,
    @Ctx() { pageLoader }: Context
  ) {
    return root.pageCreatorId ? pageLoader.load(root.pageCreatorId) : null
  }

  @FieldResolver(() => Space)
  space(
    @Root() root: Post,
    @Ctx() { spaceLoader }: Context
  ) {
    return spaceLoader.load(root.spaceId)
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() root: Post,
    @Ctx() { req, voteLoader }: Context
  ) {
    return req.session?.userId ?
      (await voteLoader.load({ postId: root.id, userId: req.session.userId }))?.value
      :
      null
  }

  @FieldResolver(() => [Tag])
  async tags(
    @Root() root: Post,
    @Ctx() { tagLoader }: Context
  ): Promise<Tag[]> {
    return await tagLoader.load(root.id)
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req, orm }: Context
  ) {
    const { userId } = req.session
    if (value == 0) return false
    const realValue = value > 0 ? 1 : value < 0 ? -1 : 0

    const vote = await Vote.findOne({ where: { postId, userId } })

    if (vote) {
      if (vote.value == realValue) {
        await vote.remove()
        const post = await Post.findOne({ where: { id: postId } })
        if (post) {
          post.points = post.points + (realValue == 1 ? -1 : 1)
          await post.save()
        }
      }
      else {
        await orm.transaction(async transactionalEntityManager => {
          vote.value = realValue
          await transactionalEntityManager.save(vote)
          await transactionalEntityManager.increment(Post, { id: postId }, 'points', realValue == -1 ? -2 : 2)
        })
      }
    }
    else {
      await orm.transaction(async transactionalEntityManager => {
        const newVote = new Vote()
        newVote.userId = userId!
        newVote.postId = postId
        newVote.value = realValue
        await transactionalEntityManager.save(newVote)
        await transactionalEntityManager.increment(Post, { id: postId }, 'points', realValue)
      })
    }

    return true
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Ctx() { req, orm }: Context,
    @Arg('spaceId', () => Int, { nullable: true }) spaceId: number,
    @Arg('pageId', () => Int, { nullable: true }) pageId: number,
    @Arg('userId', () => Int, { nullable: true }) userId: number,
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {

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

    const posts: Post[] = await orm.query(`
      SELECT *
      FROM post p
      ${cursor ? `WHERE p."createdAt" < '${toPostgresTime(cursor)}'` : 'WHERE true'} 
      ${spaceId ? `AND p."spaceId" = ${spaceId}` : ''}
      ${pageId ? `AND p."pageCreatorId" = ${pageId}` : ''}
      ${userId ? `AND p."creatorId" = ${userId}` : ''}
      ${general && req.session.userId ? `
        AND (
          ${subscribedSpaceIds && subscribedSpaceIds.length ? `p."spaceId" IN (${subscribedSpaceIds.join(', ')})` : 'false'}
          ${followedPageIds && followedPageIds.length ? `OR p."pageCreatorId" IN (${followedPageIds.join(', ')})` : 'OR false'}
          ${followedUserIds && followedUserIds.length ? `OR p."creatorId" IN (${followedUserIds.join(', ')})` : 'OR false'}
          OR p."creatorId" = ${req.session.userId}
        )
        ` : ''
      }
      ORDER BY 
        ${req.session.userId ? `p."creatorId" = ${req.session.userId} DESC,` : ''} 
        p.points DESC, 
        p."createdAt" DESC
      LIMIT ${realLimitPlusOne}
    `)

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length - 1 == realLimit
    }
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id', () => Int) id: number,
  ): Promise<Post | null> {

    return await Post.findOne({ where: { id } })
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Ctx() { orm, req }: Context,
    @Arg('input', () => PostInputCreate) input: PostInputCreate,
  ): Promise<PostResponse> {
    const { spaceName, title, text, tags, pageId } = input

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

    if (tags == null || tags.length == 0) {
      return {
        errors: [{
          field: 'tags',
          message: 'All posts must have at least one tag.'
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
    else { // pages don't have to subsrcibe to space to create posts/offers
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

    const dbTags = await Tag.find({ where: { id: In(tags) } })
    if (dbTags.length != tags.length) {
      return {
        errors: [{
          field: 'tags',
          message: 'One or more tags do not exist!'
        }]
      }
    }

    return {
      post: await Post.create({
        title,
        text,
        spaceId: space.id,
        creatorType: pageId ? 'page' : 'user',
        creatorId: pageId ? undefined : req.session.userId,
        pageCreatorId: pageId,
        tags: dbTags
      }).save()
    }
  }

  @Mutation(() => PostResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => PostInputUpdate) input: PostInputUpdate,
    @Ctx() { orm, req }: Context
  ): Promise<PostResponse | null> {
    type FormattedInput = Omit<PostInputUpdate, 'tags'> & { tags?: Tag[] }
    let clone = _.cloneDeep(input)
    delete clone.tags
    let formattedInput: FormattedInput = clone as Omit<PostInputUpdate, 'tags'>
    if (input.tags && input.tags.length > 0) {
      formattedInput.tags = await Tag.find({ where: { id: In(input.tags!) } })
      if (formattedInput.tags.length != input.tags.length) {
        throw new Error('One or more tags do not exist!')
      }
    }
    const post = await Post.findOne({ where: { id } })
    if (post) {
      if (post.creatorType == 'user') {
        if (post.creatorId != req.session.userId) {
          throw new Error('Not authorised!')
        }
      }
      else {
        const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${post.pageCreatorId};
        `)
        if (ownerProof.length == 0) {
          throw new Error('Not authorised!')
        }
      }
      saveAttributes<Post, FormattedInput>(post, formattedInput)
      await post.save()
      return { post }
    }
    else {
      throw new Error('Post not found.')
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const post = await Post.findOneBy({ id })
    if (!post) {
      return false
    }
    if (post.creatorType == 'user') {
      if (post.creatorId != req.session.userId) {
        throw new Error('Not authorised!')
      }
    }
    else {
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${post.pageCreatorId};
        `)
      if (ownerProof.length == 0) {
        throw new Error('Not authorised!')
      }
    }
    await post.remove()
    return true
  }

  @Mutation(() => Boolean)
  triggerPostsInvalidate() {
    return true
  }
}