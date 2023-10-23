import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Space, User } from '@entities'

@ObjectType()
@Entity()
export class SpaceSubscription extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.spaceSubscriptions, { onDelete: 'CASCADE' })
  user?: User

  @Field(() => Int)
  @PrimaryColumn()
  spaceId!: number

  @Field(() => Space)
  @ManyToOne(() => Space, space => space.spaceSubscriptions, { onDelete: 'CASCADE' })
  space?: Space
}