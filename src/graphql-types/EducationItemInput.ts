import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Field, InputType } from 'type-graphql'

@InputType()
export class EducationItemInput {
  @Field({ nullable: true })
  school?: string

  @Field({ nullable: true })
  status?: string

  @Field(() => Date, { nullable: true })
  startDate?: Date

  @Field(() => Date, { nullable: true })
  endDate?: Date

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>
}