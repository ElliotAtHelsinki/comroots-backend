import { Comment, CommentVote, CV, EducationItem, Experience, Offer, OfferApplication, PageFollow, Post, Qualification, SpaceSubscription, UserFollow, Vote } from '@entities'
import { Field, Float, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
  @Column({ unique: true, nullable: false })
  username?: string

  @Field({ nullable: true })
  @Column({ unique: true, nullable: false })
  email?: string

  @Column({ nullable: false })
  password?: string

  @OneToMany(() => Post, post => post.creator)
  posts?: Post[]

  @OneToMany(() => Offer, offer => offer.creator)
  offers?: Offer[]

  @OneToMany(() => EducationItem, educationItem => educationItem.user, { cascade: true })
  educationItems?: EducationItem[]

  @OneToMany(() => Experience, experience => experience.user, { cascade: true })
  experiences?: Experience[]

  @OneToMany(() => Qualification, qualification => qualification.user, { cascade: true })
  qualifications?: Qualification[]

  @Field(() => [String], { nullable: true })
  @Column(`simple-array`, { nullable: true })
  skills?: string[]

  @OneToMany(() => CV, cv => cv.user)
  cvs?: CV[]

  @OneToMany(() => Vote, vote => vote.user)
  votes?: Vote[]

  @OneToMany(() => SpaceSubscription, spaceSubscription => spaceSubscription.user)
  spaceSubscriptions?: SpaceSubscription[]

  @OneToMany(() => PageFollow, pageFollow => pageFollow.user)
  pageFollows?: PageFollow[]

  // One user can follow many
  @OneToMany(() => UserFollow, userFollow => userFollow.followingUser)
  userFollowings?: UserFollow[]

  // One user can be followed by many
  @OneToMany(() => UserFollow, userFollow => userFollow.followedUser)
  userFolloweds?: PageFollow[]

  @Field(() => [Comment], { nullable: true })
  @OneToMany(() => Comment, comment => comment.creator)
  comments?: Comment[]

  @OneToMany(() => CommentVote, commentVote => commentVote.user)
  commentVotes?: CommentVote[]

  @Field(() => [OfferApplication], { nullable: true })
  @OneToMany(() => OfferApplication, offerApplication => offerApplication.user)
  applications?: OfferApplication[]

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string // S3 Key (Location) to image

  @Field({ nullable: true })
  avatarUrl?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  coverPhoto?: string

  @Field({ nullable: true })
  coverPhotoUrl?: string

  @Field(() => Int)
  followerNumber?: number

  @Field(() => Int)
  followingNumber?: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  fullName?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  about?: string

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  mostRecentLatitude?: number

  @Field(() => Float, { nullable: true })
  @Column({ type:'float', nullable: true })
  mostRecentLongitude?: number
}