import { Offer } from '@entities'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class OfferResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Offer, { nullable: true })
  offer?: Offer
}