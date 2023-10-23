import { UserFollow } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createUserFollowerNumberLoader = () =>
  new DataLoader<number, number>(async (userIds) => {
    const result: { count: string, followedUserId: number }[] = await orm.createQueryBuilder()
      .select('COUNT(*), "followedUserId"')
      .from(UserFollow, 'uf')
      .orWhere(userIds.map(id => ({ followedUserId: id })))
      .groupBy('"followedUserId"')
      .execute()
    return userIds.map(id => {
      const count = result.find(r => r.followedUserId == id)?.count
      if (count) {
        return parseInt(count)
      }
      return 0
    })
  })