import { UserFollow } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createUserFollowingNumberLoader = () =>
  new DataLoader<number, number>(async (userIds) => {
    const result: { count: string, followingUserId: number }[] = await orm.createQueryBuilder()
      .select('COUNT(*), "followingUserId"')
      .from(UserFollow, 'uf')
      .orWhere(userIds.map(id => ({ followingUserId: id })))
      .groupBy('"followingUserId"')
      .execute()
    return userIds.map(id => {
      const count = result.find(r => r.followingUserId == id)?.count
      if (count) {
        return parseInt(count)
      }
      return 0
    })
  })