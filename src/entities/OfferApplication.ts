import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm'
import { User, Offer } from '@entities'

@ObjectType()
@Entity()
export class OfferApplication extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number

  @Field(() => Int)
  @Column()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.applications, { onDelete: 'CASCADE', cascade: true  })
  user?: User

  @Field(() => Int)
  @Column()
  offerId!: number

  @Field(() => Offer)
  @ManyToOne(() => Offer, offer => offer.applications, { onDelete: 'CASCADE', cascade: true })
  offer?: Offer

  @Field()
  @Column({ default: 'applied' })
  status!: 'applied' | 'accepted' | 'rejected'
}