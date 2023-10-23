import { Field, InputType } from 'type-graphql'

@InputType()
export class UserInfo {
  @Field({ nullable: true })
  fullName?: string

  @Field({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  about?: string
}