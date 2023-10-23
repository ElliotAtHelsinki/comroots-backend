import { Comment, User } from '@entities'
import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@ObjectType()
@Entity()
export class CommentVote extends BaseEntity {
  @Field(() => Int)
  @Column({ type: 'int' })
  value!: number

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.commentVotes, { onDelete: 'CASCADE' })
  user?: User

  @Field(() => Int)
  @PrimaryColumn()
  commentId!: number

  @Field(() => Comment)
  @ManyToOne(() => Comment, comment => comment.votes, { onDelete: 'CASCADE' })
  comment?: Comment
}