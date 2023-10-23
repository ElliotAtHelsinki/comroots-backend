import { Post } from '@entities'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Post, { nullable: true })
  post?: Post
}