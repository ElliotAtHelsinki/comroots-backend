import { COOKIE_NAME, __prod__ } from '@constants'
import { createApplicantsNoLoader, createApplicationLoader, createApplicationStatusLoader, createCommentVoteLoader, createFollowerNumberLoader, createFollowLoader, createModStatusLoader, createOwnerStatusLoader, createPageLoader, createSpaceLoader, createSubscriberNumberLoader, createSubscriptionLoader, createTagLoader, createUserFollowerNumberLoader, createUserFollowingNumberLoader, createUserFollowLoader, createUserLoader, createVoteLoader } from '@loaders'
import { CommentResolver, ConversationResolver, CVResolver, EducationItemResolver, ExperienceResolver, OfferResolver, PageResolver, PostResolver, QualificationResolver, QuicksightResolver, S3Resolver, SpaceResolver, TagResolver, UserResolver } from '@resolvers'
import typeORMSource from '@src/type-orm.source'
import { Context } from '@types'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import { graphqlUploadExpress } from 'graphql-upload'
import Redis from 'ioredis'
import { buildSchema } from 'type-graphql'

const main = async () => {
  const orm = await typeORMSource.initialize()
  // await orm.dropDatabase()
  await orm.runMigrations()
  
  const app = express()
  app.use(cors({
    credentials: true,
    // origin: !__prod__ ? ['http://localhost:3000', 'https://studio.apollographql.com'] :
    //   [process.env.FRONTEND_ORIGIN, 'https://studio.apollographql.com']
    origin: [process.env.FRONTEND_ORIGIN, 'https://studio.apollographql.com']
  }))
  app.use(express.json({
    limit: '1gb',
    verify: (_, __, buf) => {
      if (buf.byteLength / (1024 * 1024) > 1024) {
        throw new Error(`${process.env.NON_API_ERROR_PREFIX}Request too large. It must be less than 1GB.${process.env.NON_API_ERROR_SUFFIX}`)
      }
    }
  }))

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)
  // await redis.flushall()

  app.set('trust proxy', true)

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTTL: true,
        disableTouch: true
      }),
      cookie: { // lax + secure false -> chrome dev; none + secure true -> apollo studio, prod: lax + secure
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: false,
        sameSite: 'lax',
        // sameSite: 'none',
        secure: true,
        // secure: false,
        // domain: __prod__ ? process.env.DOMAIN_SUFFIX : undefined
          domain: process.env.DOMAIN_SUFFIX
      },
      secret: process.env.REDIS_SECRET,
      saveUninitialized: false,
      resave: false
    })
  )

  app.listen(parseInt(process.env.API_PORT), () => {
    if (!__prod__) {
      console.log(`Server started on localhost:${process.env.API_PORT}.`)
    }
    else {
      console.log(`Server started at ${process.env.BACKEND_ORIGIN}.`)
    }
  })
  app.get('/', (_, res) => {
    res.send('Start querying at /graphql.')
  })

  const apolloServer = new ApolloServer({
    introspection: true,
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        PostResolver,
        SpaceResolver,
        CommentResolver,
        OfferResolver,
        TagResolver,
        S3Resolver,
        ConversationResolver,
        PageResolver,
        EducationItemResolver,
        ExperienceResolver,
        QualificationResolver,
        CVResolver,
        QuicksightResolver
      ],
      validate: false
    }),
     
    context: ({ req, res }): Context => ({
      orm,
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      voteLoader: createVoteLoader(),
      spaceLoader: createSpaceLoader(),
      commentVoteLoader: createCommentVoteLoader(),
      tagLoader: createTagLoader(),
      subscriptionLoader: createSubscriptionLoader(),
      modStatusLoader: createModStatusLoader(),
      pageLoader: createPageLoader(),
      followLoader: createFollowLoader(),
      ownerStatusLoader: createOwnerStatusLoader(),
      userFollowLoader: createUserFollowLoader(),
      applicationStatusLoader: createApplicationStatusLoader(),
      applicationLoader: createApplicationLoader(),
      applicantsNoLoader: createApplicantsNoLoader(),
      followerNumberLoader: createFollowerNumberLoader(),
      subscriberNumberLoader: createSubscriberNumberLoader(),
      userFollowerNumberLoader: createUserFollowerNumberLoader(),
      userFollowingNumberLoader: createUserFollowingNumberLoader()
    })
  })

  await apolloServer.start()
  app.use(graphqlUploadExpress())
  apolloServer.applyMiddleware({ app, cors: false })
}

main().catch(console.error)