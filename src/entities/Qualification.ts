import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class Qualification extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  name!: string

  @Field()
  @Column()
  issuingOrganisation!: string

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  issuanceDate?: Date

  @Field()
  @Column()
  expire!: boolean

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  expirationDate?: Date

  @Field({ nullable: true })
  @Column({ nullable: true })
  credentialID?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  credentialURL?: string

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId?: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.qualifications, { onDelete: 'CASCADE' })
  user?: User

  @Field({ nullable: true })
  @Column({ nullable: true })
  photo?: string

  @Field({ nullable: true })
  photoUrl?: string
}