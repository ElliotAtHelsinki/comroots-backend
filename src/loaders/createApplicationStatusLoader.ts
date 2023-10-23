import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createApplicationStatusLoader = () =>
  new DataLoader<{ offerId: number, userId: number }, String | null>(async (keys) => {
    const applications: { id: number, offerId: number, userId: number, status: string }[] = await orm.createQueryBuilder()
      .select('*')
      .from('offer_application', 'oa')
      .orWhere(keys)
      .execute()
    return keys.map(key => {
      const application = applications.find(a => a.offerId == key.offerId && a.userId == key.userId)
      return application ? application.status : null
    })
  })