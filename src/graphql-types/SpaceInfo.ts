import { Field, InputType } from 'type-graphql'

@InputType()
export class SpaceInfo {
  @Field({ nullable: true })
  fullSpaceName?: string

  @Field({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  rules?: string

  @Field({ nullable: true })
  about?: string
}