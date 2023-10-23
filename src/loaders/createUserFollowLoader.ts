import { UserFollow } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createUserFollowLoader = () =>
  new DataLoader<{ followedUserId: number, followingUserId: number }, boolean>(async (keys) => {
    const follows: UserFollow[] = await orm.createQueryBuilder()
      .select('*')
      .from(UserFollow, 'uf')
      .orWhereInIds(keys)
      .execute()
    return keys.map(key => {
      const follow = follows.find(fol => fol.followedUserId == key.followedUserId && fol.followingUserId == key.followingUserId)
      return follow ? true : false
    })
  })