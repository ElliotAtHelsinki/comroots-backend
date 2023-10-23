import { Comment, CommentVote, Conversation, CV, EducationItem, Experience, Offer, OfferApplication, Page, PageFollow, Post, Qualification, Space, SpaceSubscription, Tag, Vote, User, UserFollow } from '@entities'
import path from 'path'
import { DataSource } from 'typeorm'

export const typeORMConfig = {
  type: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  logging: true,
  synchronize: false,
  entities: [
    User,
    Post,
    Vote,
    Space,
    SpaceSubscription,
    Comment,
    CommentVote,
    Offer,
    OfferApplication,
    Tag,
    Conversation,
    Page,
    PageFollow,
    UserFollow,
    EducationItem,
    Experience,
    Qualification,
    CV
  ],
  migrationsTableName: 'type_orm_migrations',
  migrations: [path.join(__dirname, '../migrations/*')],
  cli: {
    migrationsDir: 'migrations'
  }
} as ConstructorParameters<typeof DataSource>[0]