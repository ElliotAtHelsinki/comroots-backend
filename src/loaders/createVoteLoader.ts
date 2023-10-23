import DataLoader from 'dataloader'
import { Vote } from '@entities'
import orm from '@src/type-orm.source'

export const createVoteLoader = () =>

  new DataLoader<{ postId: number, userId: number }, Vote | null>(async (keys) => {
    const votes: Vote[] = await orm.createQueryBuilder()
      .select('*')
      .from(Vote, 'v')
      .orWhereInIds(keys)
      .execute()
    const map: Record<string, Vote> = {}
    votes.forEach(v => {
      map[`${v.userId}-${v.postId}`] = v
    })
    return keys.map(key => map[`${key.userId}-${key.postId}`])
  })