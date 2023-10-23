import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Field, InputType } from 'type-graphql'

@InputType()
export class QualificationInput {
  @Field()
  name!: string

  @Field()
  issuingOrganisation!: string

  @Field(() => Date, { nullable: true })
  issuanceDate?: Date

  @Field()
  expire: boolean

  @Field(() => Date, { nullable: true })
  expirationDate?: Date

  @Field({ nullable: true })
  credentialID?: string

  @Field({ nullable: true })
  credentialURL?: string

  @Field(() => GraphQLUpload, { nullable: true })
  photo?: Promise<FileUpload>
}