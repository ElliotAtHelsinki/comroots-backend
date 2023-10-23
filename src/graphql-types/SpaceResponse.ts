import { Space } from '@entities'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class SpaceResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Space, { nullable: true })
  space?: Space
}