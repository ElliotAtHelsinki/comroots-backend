import { Tag } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createTagLoader = () =>

  new DataLoader<number, Tag[]>(async (postIds) => {
    const tagItems: { postId: number, tagId: number }[] = await orm.query(`
      SELECT * FROM post_tags_tag WHERE "postId" IN (${postIds.join(', ')});
    `)
    const tagIds = tagItems.map(ti => ti.tagId)
    if (tagIds.length > 0) {
      const tags: Tag[] = await orm.query(`
        SELECT * FROM tag WHERE id IN (${tagIds.join(', ')});
      `)

      return postIds.map(id => {
        const postTagItems = tagItems.filter(ti => ti.postId == id)
        const postTagIds = postTagItems.map(pti => pti.tagId)
        return tags.filter(t => postTagIds.includes(t.id))
      })
    }
    else {
      const newArr = postIds.map(id => [])
      return newArr
    }
  })