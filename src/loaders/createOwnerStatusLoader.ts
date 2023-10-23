import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createOwnerStatusLoader = () =>
  new DataLoader<{ pageId: number, userId: number }, boolean>(async (keys) => {
    const ownerProofs: { pageId: number, userId: number }[] = await orm.createQueryBuilder()
      .select('*')
      .from('page_owners_user', 'pou')
      .orWhereInIds(keys)
      .execute()
    return keys.map(key => {
      const ownerProof = ownerProofs.find(o => o.pageId == key.pageId && o.userId == key.userId)
      return ownerProof ? true : false
    })
  })