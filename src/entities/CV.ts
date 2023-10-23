import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class CV extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  filename?: string

  @Field()
  @Column()
  key?: string

  @Field({ nullable: true })
  url?: string

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId?: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.cvs, { onDelete: 'CASCADE' })
  user?: User
}