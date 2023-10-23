import { User } from '../entities'
import { ObjectType, Field } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType() // ObjectType is for return values
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}