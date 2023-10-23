import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class UploadedFileResponse {
  @Field()
  filename!: String

  @Field()
  mimetype!: String

  @Field()
  encoding!: String

  @Field()
  url!: String
}