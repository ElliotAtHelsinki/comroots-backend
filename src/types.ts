import {
  createApplicationLoader,
  createApplicationStatusLoader,
  createCommentVoteLoader,
  createFollowLoader,
  createModStatusLoader,
  createOwnerStatusLoader,
  createPageLoader,
  createSpaceLoader,
  createSubscriptionLoader,
  createTagLoader,
  createVoteLoader,
  createUserFollowLoader,
  createUserLoader,
  createApplicantsNoLoader,
  createFollowerNumberLoader,
  createSubscriberNumberLoader,
  createUserFollowerNumberLoader,
  createUserFollowingNumberLoader
} from '@loaders'
import { Request, Response } from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import { DataSource } from 'typeorm'

export type Context = {
  orm: DataSource
  req: Request & { session: session.Session & Partial<session.SessionData> & { userId?: number } }
  res: Response
  redis: Redis
  userLoader: ReturnType<typeof createUserLoader>
  voteLoader: ReturnType<typeof createVoteLoader>
  spaceLoader: ReturnType<typeof createSpaceLoader>
  commentVoteLoader: ReturnType<typeof createCommentVoteLoader>
  tagLoader: ReturnType<typeof createTagLoader>
  subscriptionLoader: ReturnType<typeof createSubscriptionLoader>
  modStatusLoader: ReturnType<typeof createModStatusLoader>
  pageLoader: ReturnType<typeof createPageLoader>
  followLoader: ReturnType<typeof createFollowLoader>
  ownerStatusLoader: ReturnType<typeof createOwnerStatusLoader>
  userFollowLoader: ReturnType<typeof createUserFollowLoader>
  applicationStatusLoader: ReturnType<typeof createApplicationStatusLoader>
  applicationLoader: ReturnType<typeof createApplicationLoader>
  applicantsNoLoader: ReturnType<typeof createApplicantsNoLoader>
  followerNumberLoader: ReturnType<typeof createFollowerNumberLoader>
  subscriberNumberLoader: ReturnType<typeof createSubscriberNumberLoader>
  userFollowerNumberLoader: ReturnType<typeof createUserFollowerNumberLoader>
  userFollowingNumberLoader: ReturnType<typeof createUserFollowingNumberLoader>
}