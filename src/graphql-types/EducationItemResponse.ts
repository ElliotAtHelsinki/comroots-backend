import { EducationItem } from '@entities'
import { Field, ObjectType } from 'type-graphql'
import { FieldError } from './FieldError'

@ObjectType()
export class EducationItemResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => EducationItem, { nullable: true })
  educationItem?: EducationItem
}