import { PageFollow } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createFollowerNumberLoader = () =>
  new DataLoader<number, number>(async (pageIds) => {
    const result: { count: string, pageId: number }[] = await orm.createQueryBuilder()
      .select('COUNT(*), "pageId"')
      .from(PageFollow, 'pf')
      .orWhere(pageIds.map(id => ({ pageId: id })))
      .groupBy('"pageId"')
      .execute()
    return pageIds.map(id => {
      const count = result.find(r => r.pageId == id)?.count
      if (count) {
        return parseInt(count)
      }
      return 0
    }) 
  })