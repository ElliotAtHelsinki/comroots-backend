import { Collection, getRepository } from 'fireorm'
import { ObjectType, Field, Int } from 'type-graphql'

@ObjectType()
@Collection('inboxes')
export class Inbox {
  @Field()
  id: string

  @Field(() => Int)
  userId: number

  @Field(() => [String])
  conversationIds: string[]
}

export const InboxCol = getRepository(Inbox)