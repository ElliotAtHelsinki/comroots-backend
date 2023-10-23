import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Field, InputType } from 'type-graphql'

@InputType()
export class MessageInput {
  @Field(() => String)
  type!: 'text' | 'image' | 'video' | 'audio' | 'file'

  @Field(() => GraphQLUpload, { nullable: true })
  upload?: Promise<FileUpload>

  @Field(() => String, { nullable: true })
  text?: string
}