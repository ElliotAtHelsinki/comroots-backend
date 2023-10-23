import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Post, SpaceSubscription, User } from '@entities'

@ObjectType()
@Entity()
export class Space extends BaseEntity {
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
  @Column({ unique: true })
  spaceName!: string

  @OneToMany(() => Post, post => post.space)
  posts?: Post[]

  @OneToMany(() => SpaceSubscription, spaceSubscription => spaceSubscription.space)
  spaceSubscriptions?: SpaceSubscription[]

  @Field(() => Boolean, { nullable: true })
  subscriptionStatus?: boolean

  @Field(() => Int)
  subscriberNumber?: number

  @Field(() => Boolean)
  modStatus?: boolean

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  mods?: User[]

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  fullSpaceName?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  rules?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  headline?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  about?: string
}