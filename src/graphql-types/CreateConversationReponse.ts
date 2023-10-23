import { ConversationInFirestore } from '@collections'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class CreateConversationResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => ConversationInFirestore, { nullable: true })
  conversation?: ConversationInFirestore
}