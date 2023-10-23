import { Offer } from '@entities'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class PaginatedOffers {
  @Field(() => [Offer])
  offers: Offer[]

  @Field(() => Boolean)
  hasMore: boolean
}