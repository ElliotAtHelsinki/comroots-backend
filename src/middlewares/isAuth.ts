import { Context } from '@types'
import { MiddlewareFn } from 'type-graphql'
import { User } from '@entities'

export const isAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.req.session.userId ||
    !(await User.findOne({ where: { id: context.req.session.userId } }))
  ) {
    throw new Error('Not authenticated.')
  }
  await next()
}