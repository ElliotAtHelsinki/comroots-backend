import { User } from '@entities'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class InboxResponse {
  @Field(() => String)
  firestoreCollectionId: string

  @Field(() => User)
  partner: User
}