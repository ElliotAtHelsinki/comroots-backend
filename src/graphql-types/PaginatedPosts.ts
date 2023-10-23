import { Post } from '@entities'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]

  @Field(() => Boolean)
  hasMore: boolean
}