import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Field, InputType } from 'type-graphql'

@InputType()
export class ExperienceInput {
  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  workplace?: string

  @Field(() => Date, { nullable: true })
  startDate?: Date

  @Field(() => Date, { nullable: true })
  endDate?: Date

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>
}