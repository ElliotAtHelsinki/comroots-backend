import { Query, Resolver } from 'type-graphql'
import { Tag } from '@entities'

@Resolver(Tag)
export class TagResolver {
  @Query(() => [Tag], { nullable: true })
  async tags(): Promise<Tag[] | null> {
    return await Tag.find()
  }
}