import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Field, InputType, Int } from 'type-graphql'

@InputType()
export class OfferInputCreate {
  @Field(() => Int, { nullable: true })
  pageId?: number

  @Field({ nullable: true })
  spaceName?: string

  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  workplace?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  recruiting?: boolean

  @Field({ nullable: true })
  employmentType?: string

  @Field({ nullable: true })
  salaryRange?: string

  @Field({ nullable: true })
  department?: string

  @Field({ nullable: true })
  requirements?: string

  @Field({ nullable: true })
  benefits?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>
}

@InputType()
export class OfferInputUpdate {
  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  workplace?: string

  @Field({ nullable: true })
  address?: string

  @Field({ nullable: true })
  recruiting?: boolean

  @Field({ nullable: true })
  employmentType?: string

  @Field({ nullable: true })
  salaryRange?: string

  @Field({ nullable: true })
  department?: string

  @Field({ nullable: true })
  requirements?: string

  @Field({ nullable: true })
  benefits?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>
}