import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class EducationItem extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  school?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  status?: string

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  startDate?: Date

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  endDate?: Date

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId?: number

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, user => user.educationItems, { onDelete: 'CASCADE' })
  user?: User

  @Field({ nullable: true })
  @Column({ nullable: true })
  photo?: string

  @Field({ nullable: true })
  photoUrl?: string
}