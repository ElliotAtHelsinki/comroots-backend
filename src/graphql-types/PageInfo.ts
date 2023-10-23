import { Field, InputType } from 'type-graphql'

@InputType()
export class PageInfo {
  @Field({ nullable: true })
  fullPageName?: string

  @Field({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  about?: string
}