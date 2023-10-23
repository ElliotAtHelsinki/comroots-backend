import { ObjectType, Field } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class ForgotPasswordResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => Boolean)
  success: boolean
}