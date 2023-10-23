import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from './User'

@ObjectType()
@Entity()
export class UserFollow extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  followingUserId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.userFollowings, { onDelete: 'CASCADE' })
  followingUser?: User

  @Field(() => Int)
  @PrimaryColumn()
  followedUserId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.userFolloweds, { onDelete: 'CASCADE' })
  followedUser?: User
}