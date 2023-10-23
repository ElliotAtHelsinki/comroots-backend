import { Field, Int, ObjectType } from 'type-graphql'
import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Page } from './Page'
import { User } from './User'

@ObjectType()
@Entity()
export class PageFollow extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  userId!: number

  @Field(() => User)
  @ManyToOne(() => User, user => user.pageFollows, { onDelete: 'CASCADE' })
  user?: User

  @Field(() => Int)
  @PrimaryColumn()
  pageId!: number

  @Field(() => Page)
  @ManyToOne(() => Page, page => page.pageFollows, { onDelete: 'CASCADE' })
  page?: Page
}