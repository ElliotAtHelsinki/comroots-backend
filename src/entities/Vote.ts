import { Post, User } from '@entities'
import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
  @Field(() => Int)
  @Column({ type: 'int' })
  value!: number

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.votes, { onDelete: 'CASCADE' })
  user?: User

  @Field(() => Int)
  @PrimaryColumn()
  postId!: number

  @Field(() => Post)
  @ManyToOne(() => Post, post => post.votes, { onDelete: 'CASCADE' })
  post?: Post
}