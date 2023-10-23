import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { Space } from '@entities'

export const createSpaceLoader = () =>

  new DataLoader<number, Space>(async (spaceIds) => {
    const spaces = await Space.findBy({ id: In(spaceIds as number[]) })

    const map: Record<number, Space> = {}
    spaces.forEach(s => {
      map[s.id] = s
    })
    return spaceIds.map(id => map[id])
  })