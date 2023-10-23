import { Comment } from '@entities'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedComments {
  @Field(() => [Comment])
  comments: Comment[]

  @Field(() => Boolean)
  hasMore: boolean
}