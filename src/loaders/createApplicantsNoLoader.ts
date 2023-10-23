import { OfferApplication } from '@entities'
import orm from '@src/type-orm.source'
import DataLoader from 'dataloader'

export const createApplicantsNoLoader = () =>
  new DataLoader<number, number>(async (offerIds) => {
    const result: { count: string, offerId: number }[] = await orm.createQueryBuilder()
      .select('COUNT(*), "offerId"')
      .from(OfferApplication, 'oa')
      .orWhere(offerIds.map(id => ({ offerId: id })))
      .groupBy('"offerId"')
      .execute()
    return offerIds.map(id => {
      const count = result.find(r => r.offerId == id)?.count
      if (count) {
        return parseInt(count)
      }
      return 0
    }) 
  })