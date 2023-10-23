import { SpaceSubscription } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createSubscriptionLoader = () =>
  new DataLoader<{ spaceId: number, userId: number }, boolean>(async (keys) => {
    const subscriptions: SpaceSubscription[] = await orm.createQueryBuilder()
      .select('*')
      .from(SpaceSubscription, 'ss')
      .orWhereInIds(keys)
      .execute()
    return keys.map(key => {
      const subscription = subscriptions.find(sub => sub.spaceId == key.spaceId && sub.userId == key.userId)
      return subscription ? true : false
    })
  })