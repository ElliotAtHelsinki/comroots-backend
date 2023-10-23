import { CommentVote } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createCommentVoteLoader = () =>

  new DataLoader<{ commentId: number, userId: number }, CommentVote | null>(async (keys) => {
    const commentVotes: CommentVote[] = await orm.createQueryBuilder()
      .select('*')
      .from(CommentVote, 'cv')
      .orWhereInIds(keys)
      .execute()
    const map: Record<string, CommentVote> = {}
    commentVotes.forEach(cv => {
      map[`${cv.userId}-${cv.commentId}`] = cv
    })
    return keys.map(key => map[`${key.userId}-${key.commentId}`])
  })