import { Field, InputType, Int } from 'type-graphql'

@InputType()
export class PostInputCreate {
  @Field(() => Int, { nullable: true })
  pageId?: number

  @Field({ nullable: true })
  spaceName?: string

  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  text?: string

  @Field(() => [Int], { nullable: true })
  tags?: number[]
}

@InputType()
export class PostInputUpdate {
  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  text?: string

  @Field(() => [Int], { nullable: true })
  tags?: number[]
}