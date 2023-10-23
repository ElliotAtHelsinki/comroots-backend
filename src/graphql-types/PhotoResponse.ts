import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class PhotoResponse {
  @Field(() => String, { nullable: true })
  key?: string

  @Field(() => String, { nullable: true })
  url?: string
}