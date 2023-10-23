import { PageFollow } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createFollowLoader = () =>
  new DataLoader<{ pageId: number, userId: number }, boolean>(async (keys) => {
    const follows: PageFollow[] = await orm.createQueryBuilder()
      .select('*')
      .from(PageFollow, 'pf')
      .orWhereInIds(keys)
      .execute()
    return keys.map(key => {
      const follow = follows.find(fol => fol.pageId == key.pageId && fol.userId == key.userId)
      return follow ? true : false
    })
  })