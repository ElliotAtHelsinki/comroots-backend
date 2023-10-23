import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Vote, User, Space, Comment, Tag, Page } from '@entities'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date

  @Field()
  @Column()
  title!: string

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
  @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
  creator?: User

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  pageCreatorId?: number

  @Field(() => Page, { nullable: true })
  @ManyToOne(() => Page, page => page.posts, { onDelete: 'CASCADE' })
  pageCreator?: Page

  @OneToMany(() => Vote, vote => vote.post)
  votes?: Vote[]

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  points!: number

  @Field(() => Int, { nullable: true })
  voteStatus?: number

  @Field(() => Int)
  @Column()
  spaceId!: number

  @Field(() => Space)
  @ManyToOne(() => Space, space => space.posts, { onDelete: 'CASCADE' })
  space!: Space

  @OneToMany(() => Comment, comment => comment.post)
  comments?: Comment[]

  @Field(() => [Tag], { nullable: true })
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable() // Put @JoinTable() on owner side of a MTM relationship
  tags: Tag[]
}