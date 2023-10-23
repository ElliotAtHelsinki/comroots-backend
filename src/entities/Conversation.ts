import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Conversation extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number

  @Field(() => [Int])
  @Column('int', { array: true })
  participants: number[]

  @Field()
  @Column()
  firestoreCollectionId: string
}