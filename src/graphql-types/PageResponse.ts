import { Page } from '@entities'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class PageResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Page, { nullable: true })
  page?: Page
}