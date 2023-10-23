import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { Page, User } from '@entities'

export const createPageLoader = () =>

  new DataLoader<number, User>(async (pageIds) => {
    const pages = await Page.findBy({ id: In(pageIds as number[]) })

    const map: Record<number, User> = {}
    pages.forEach(p => {
      map[p.id] = p
    })
    return pageIds.map(id => map[id])
  })