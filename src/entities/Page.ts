import { Comment, Offer, Post, User, PageFollow } from '@entities'
import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Page extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String, { nullable: true })
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => String, { nullable: true })
  @UpdateDateColumn()
  updatedAt?: Date

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  owners?: User[]

  @Field(() => Boolean, { nullable: true })
  ownerStatus?: boolean

  @OneToMany(() => PageFollow, pageFollow => pageFollow.page)
  pageFollows?: PageFollow[]

  @Field(() => Boolean, { nullable: true })
  followStatus?: boolean

  @Field(() => Int)
  followerNumber?: number

  @Field()
  @Column({ unique: true, nullable: false })
  pageName?: string

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  email?: string

  @OneToMany(() => Post, post => post.pageCreator)
  posts?: Post[]

  @OneToMany(() => Offer, offer => offer.pageCreator)
  offers?: Offer[]

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, comment => comment.creator)
  comments?: Comment[]

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string

  @Field({ nullable: true })
  avatarUrl?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  coverPhoto?: string

  @Field({ nullable: true })
  coverPhotoUrl?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  fullPageName?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  about?: string
}