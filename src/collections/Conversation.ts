import { Collection, getRepository, ISubCollection, SubCollection } from 'fireorm'
import { Field, Int, ObjectType } from 'type-graphql'

@ObjectType()
export class Message {
  @Field()
  id: string

  @Field(() => String)
  createdAt: Date

  @Field(() => String)
  updatedAt: Date

  @Field(() => String)
  type: 'text' | 'image' | 'video' | 'audio' | 'file'

  @Field(() => String)
  content: string

  @Field(() => Int)
  senderId: number
}

@ObjectType()
@Collection('conversations')
export class ConversationInFirestore {
  @Field()
  id: string

  @SubCollection(Message, 'messages')
  messages: ISubCollection<Message>
}

export const ConversationCol = getRepository(ConversationInFirestore)