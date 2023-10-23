import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { CommentVote, Post, User, Page } from '@entities'

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => String, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date

  @Field()
  @Column()
  text!: string

  @Field(() => String)
  @Column({ default: 'user' })
  creatorType?: 'page' | 'user'

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  creatorId?: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
  creator?: User

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  pageCreatorId?: number

  @Field(() => Page, { nullable: true })
  @ManyToOne(() => Page, page => page.posts, { onDelete: 'CASCADE' })
  pageCreator?: Page

  @Field(() => Int, { nullable: true })
  @Column({ nullable: false })
  postId?: number

  @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
  post?: Post

  @OneToMany(() => CommentVote, commentVote => commentVote.comment)
  votes?: CommentVote[]

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points!: number

  @Field(() => Int, { nullable: true })
  voteStatus?: number
}