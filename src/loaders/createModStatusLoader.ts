import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createModStatusLoader = () =>
  new DataLoader<{ spaceId: number, userId: number }, boolean>(async (keys) => {
    const modProofs: { spaceId: number, userId: number }[] = await orm.createQueryBuilder()
      .select('*')
      .from('space_mods_user', 'smu')
      .orWhereInIds(keys)
      .execute()
    
    return keys.map(key => {
      const proof = modProofs.find(mp => mp.spaceId == key.spaceId && mp.userId == key.userId)
      return proof ? true : false
    })
  })