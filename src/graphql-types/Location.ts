import { Field, Float, InputType } from 'type-graphql'

@InputType()
export class Location {
  @Field(() => Float, { nullable: true })
  latitude?: number

  @Field(() => Float, { nullable: true })
  longitude?: number
}