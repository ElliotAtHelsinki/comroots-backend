import { OfferApplication, Page, Space, User } from '@entities'
import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => String)
  @CreateDateColumn()
  createdAt?: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt?: Date

  @Field(() => String, { nullable: true })
  @Column({ default: 'user' })
  creatorType?: 'page' | 'user'

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  creatorId!: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.offers, { onDelete: 'CASCADE' })
  creator?: User

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  pageCreatorId?: number

  @Field(() => Page, { nullable: true })
  @ManyToOne(() => Page, page => page.offers, { onDelete: 'CASCADE' })
  pageCreator?: Page

  @Field(() => Int)
  @Column()
  spaceId!: number

  @Field(() => Space, { nullable: true })
  @ManyToOne(() => Space, space => space.posts, { onDelete: 'CASCADE' })
  space?: Space

  @Field()
  @Column()
  title: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  workplace?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string

  @Field({ nullable: true })
  @Column({ nullable: false, default: false })
  recruiting?: boolean

  @Field(() => [OfferApplication], { nullable: true })
  @OneToMany(() => OfferApplication, offerApplication => offerApplication.offer)
  applications: OfferApplication[]

  @Field({ nullable: true })
  @Column({ nullable: true })
  employmentType?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  salaryRange?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  department?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  requirements?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  benefits?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  photo?: string

  @Field({ nullable: true })
  photoUrl?: string

  @Field(() => Int, { nullable: true })
  applicationsNo?: number

  @Field(() => String, { nullable: true })
  applicationStatus?: 'applied' | 'accepted' | 'rejected'
}