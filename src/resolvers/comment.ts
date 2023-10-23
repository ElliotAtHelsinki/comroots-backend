import { Comment, CommentVote, Page, Post, User } from '@entities'
import { PaginatedComments } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { toPostgresTime } from '@utils'
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql'

@Resolver(Comment)
export class CommentResolver {

  @FieldResolver(() => User)
  creator(
    @Root() root: Comment,
    @Ctx() { userLoader }: Context
  ) {
    return root.creatorId ? userLoader.load(root.creatorId) : null
  }

  @FieldResolver(() => Page)
  pageCreator(
    @Root() root: Comment,
    @Ctx() { pageLoader }: Context
  ) {
    return root.pageCreatorId ? pageLoader.load(root.pageCreatorId) : null
  }

  @Query(() => PaginatedComments)
  async comments(
    @Ctx() { req, orm }: Context,
    @Arg('postId', () => Int) postId: number,
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
  ): Promise<PaginatedComments | null> {
    const { userId } = req.session

    const realLimit = Math.min(limit, 5)
    const realLimitPlusOne = realLimit + 1

    const comments = await orm.query(`
      SELECT *
      FROM comment c
      WHERE c."postId" = ${postId}
      ${cursor ? `AND c."createdAt" < '${toPostgresTime(cursor)}'` : ''} 
      ORDER BY 
        ${userId ? `c."creatorId" = ${userId} DESC,` : ''} 
        c.points DESC,
        c."createdAt" DESC
      LIMIT ${realLimitPlusOne}
    `)

    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length - 1 == realLimit
    }
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() root: Comment,
    @Ctx() { req, commentVoteLoader }: Context
  ) {
    return req.session?.userId ?
      (await commentVoteLoader.load({ commentId: root.id, userId: req.session.userId }))?.value
      :
      null
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Comment)
  async createComment(
    @Arg('postId', () => Int) postId: number,
    @Arg('text', () => String) text: string,
    @Arg('pageId', () => Int, { nullable: true }) pageId: number,
    @Ctx() { req, orm }: Context
  ): Promise<Comment | null> {
    const { userId } = req.session
    const post = await Post.findOneBy({ id: postId })
    if (!post) {
      return null
    }
    if (pageId) {
      const page = await Page.findOne({ where: { id: pageId } })
      if (!page) {
        throw new Error('Page does not exist!')
      }
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
        SELECT * FROM page_owners_user WHERE "userId" = ${userId} AND "pageId" = ${pageId};
      `)
      if (ownerProof.length == 0) {
        throw new Error('You are not an owner of this page.')
      }
    }
    return await Comment.create({
      text,
      postId,
      creatorType: pageId ? 'page' : 'user',
      creatorId: pageId ? undefined : userId,
      pageCreatorId: pageId,
    }).save()
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg('id', () => Int) id: number,
    @Arg('text', () => String) text: string,
    @Ctx() { orm, req }: Context
  ): Promise<Comment | null> {
    const comment = await Comment.findOne({ where: { id } })
    if (comment) {
      if (comment.creatorType == 'user') {
        if (comment.creatorId != req.session.userId) {
          throw new Error('Not authorised!')
        }
      }
      else {
        const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${comment.pageCreatorId};
        `)
        if (ownerProof.length == 0) {
          throw new Error('Not authorised!')
        }
      }
      comment.text = text
      return comment.save()
    }
    else {
      throw new Error('Post not found.')
    }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteComment(
    @Arg('id', () => Int) id: number,
    @Ctx() { orm, req }: Context
  ): Promise<boolean> {
    const comment = await Comment.findOneBy({ id })
    if (!comment) {
      throw new Error('Comment not found!')
    }
    if (comment.creatorType == 'user') {
      if (comment.creatorId != req.session.userId) {
        throw new Error('Not authorised!')
      }
    }
    else {
      const ownerProof: { userId: number, pageId: number }[] = await orm.query(`
          SELECT * FROM page_owners_user WHERE "userId" = ${req.session.userId} AND "pageId" = ${comment.pageCreatorId};
        `)
      if (ownerProof.length == 0) {
        throw new Error('Not authorised!')
      }
    }
    await comment.remove()
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async voteComment(
    @Arg('commentId', () => Int) commentId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req, orm }: Context
  ) {
    const { userId } = req.session
    if (value == 0) return false
    const realValue = value > 0 ? 1 : value < 0 ? -1 : 0

    const commentVote = await CommentVote.findOne({ where: { commentId, userId } })

    if (commentVote) {
      if (commentVote.value == realValue) {
        await commentVote.remove()
        const comment = await Comment.findOne({ where: { id: commentId } })
        if (comment) {
          comment.points = comment.points + (realValue == 1 ? -1 : 1)
          await comment.save()
        }
      }
      else {
        await orm.transaction(async transactionalEntityManager => {
          commentVote.value = realValue
          await transactionalEntityManager.save(commentVote)
          await transactionalEntityManager.increment(Comment, { id: commentId }, 'points', realValue == -1 ? -2 : 2)
        })
      }
    }
    else {
      await orm.transaction(async transactionalEntityManager => {
        const newCommentVote = new CommentVote()
        newCommentVote.userId = userId!
        newCommentVote.commentId = commentId
        newCommentVote.value = realValue
        await transactionalEntityManager.save(newCommentVote)
        await transactionalEntityManager.increment(Comment, { id: commentId }, 'points', realValue)
      })
    }

    return true
  }
}