import { OfferApplication } from '@entities'
import DataLoader from 'dataloader'
import { In } from 'typeorm'

export const createApplicationLoader = () =>
  new DataLoader<number, OfferApplication[]>(async (offerIds) => {
    const applications = await OfferApplication.find({ where: { offerId: In(offerIds as number[]) }, relations: { user: true } })
    return offerIds.map(offerId => {
      return applications.filter(application => application.offerId === offerId) 
    })
  })