import { SpaceSubscription } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createSubscriberNumberLoader = () =>
  new DataLoader<number, number>(async (spaceIds) => {
    const result: { count: string, spaceId: number }[] = await orm.createQueryBuilder()
      .select('COUNT(*), "spaceId"')
      .from(SpaceSubscription, 'ss')
      .orWhere(spaceIds.map(id => ({ spaceId: id })))
      .groupBy('"spaceId"')
      .execute()
    return spaceIds.map(id => {
      const count = result.find(r => r.spaceId == id)?.count
      if (count) {
        return parseInt(count)
      }
      return 0
    }) 
  })