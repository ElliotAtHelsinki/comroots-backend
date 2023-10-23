import DataLoader from 'dataloader'
import { In } from 'typeorm'
import { User } from '@entities'

export const createUserLoader = () =>

  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[]) })

    const map: Record<number, User> = {}
    users.forEach(u => {
      map[u.id] = u
    })
    return userIds.map(id => map[id])
  })