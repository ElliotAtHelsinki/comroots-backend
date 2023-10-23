import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class Experience extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  title?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  workplace?: string

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
  @ManyToOne(() => User, user => user.experiences, { onDelete: 'CASCADE' })
  user?: User

  @Field({ nullable: true })
  @Column({ nullable: true  })
  photo?: string

  @Field({ nullable: true })
  photoUrl?: string
}