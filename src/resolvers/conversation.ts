import { ConversationCol, ConversationInFirestore, Inbox, InboxCol, Message } from '@collections'
import { s3 } from '@configs'
import { Conversation as ConversationEnt, User } from '@entities'
import { CreateConversationResponse, InboxResponse, MessageInput } from '@graphql-types'
import { isAuth } from '@middlewares'
import { Context } from '@types'
import { getExtensionFromFilename } from '@utils'
import { FileUpload } from 'graphql-upload'
import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { ArrayContains, In } from 'typeorm'
import { v4 } from 'uuid'

@Resolver(ConversationInFirestore)
export class ConversationResolver {

  @UseMiddleware(isAuth)
  @Query(() => [ConversationEnt])
  async conversations(
    @Ctx() { req }: Context
  ): Promise<ConversationEnt[]> {
    const { userId } = req.session
    return await ConversationEnt.find({
      where: {
        participants: ArrayContains([userId])
      }
    })
  }

  @UseMiddleware(isAuth)
  @Query(() => [User])
  async participants(
    @Arg('firestoreCollectionId', () => String) firestoreCollectionId: string,
    @Ctx() { req }: Context
  ): Promise<User[]> {
    const { userId } = req.session
    const convo = await ConversationEnt.findOneBy({ firestoreCollectionId })
    if (!convo) {
      return []
    }
    if (!convo.participants.includes(userId!)) {
      throw new Error('Not authorised!')
    }
    return User.findBy({ id: In(convo.participants) })
  }

  @UseMiddleware(isAuth)
  @Query(() => [InboxResponse])
  async inboxes(
    @Arg('firestoreCollectionIds', () => [String]) firestoreCollectionIds: string[],
    @Ctx() { req }: Context
  ): Promise<InboxResponse[]> {
    const { userId } = req.session
    const convos = await ConversationEnt.findBy({ firestoreCollectionId: In(firestoreCollectionIds) })
    return Promise.all(firestoreCollectionIds.map(async fci => {
      const convo = convos.find(c => c.firestoreCollectionId == fci)!
      const partnerId = convo.participants.find(id => id != userId)
      const partner = (await User.findOne({ where: { id: partnerId } }))!
      return {
        partner,
        firestoreCollectionId: fci
      }
    }))
  }


  @UseMiddleware(isAuth)
  @Mutation(() => CreateConversationResponse)
  async createConversation(
    @Arg('partnerUsername', () => String) partnerUsername: string,
    @Ctx() { req }: Context
  ): Promise<CreateConversationResponse> {
    const { userId } = req.session
    const partner = await User.findOne({ where: { username: partnerUsername } })
    if (!partner) {
      return {
        errors: [{
          field: 'partnerUsername',
          message: 'Invalid username.'
        }]
      }
    }
    const partnerId = partner.id
    const existingConvo = await ConversationEnt.findOne({
      where: {
        participants: ArrayContains([userId, partnerId])
      }
    })
    if (existingConvo) {
      return {
        errors: [{
          field: 'partnerUsername',
          message: 'Conversation already exists.'
        }]
      }
    }
    const convo = new ConversationInFirestore()
    const convoItem = await ConversationCol.create(convo)
    let inbox = await InboxCol.whereEqualTo('userId', userId!).findOne()
    let partnerInbox = await InboxCol.whereEqualTo('userId', partnerId!).findOne()
    if (!inbox) {
      inbox = new Inbox()
      inbox.userId = userId!
      inbox.conversationIds = []
      await InboxCol.create(inbox)
    }
    if (!partnerInbox) {
      partnerInbox = new Inbox()
      partnerInbox.userId = partnerId!
      partnerInbox.conversationIds = []
      await InboxCol.create(partnerInbox)
    }
    inbox.conversationIds.push(convoItem.id)
    partnerInbox.conversationIds.push(convoItem.id)
    await InboxCol.update(inbox)
    await InboxCol.update(partnerInbox)
    const convoEnt = new ConversationEnt()
    convoEnt.participants = [userId!, partnerId]
    convoEnt.firestoreCollectionId = convoItem.id
    await convoEnt.save()
    return { conversation: convoItem }
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteConversation(
    @Arg('firestoreCollectionId', () => String) firestoreCollectionId: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const convo = await ConversationEnt.findOneBy({ firestoreCollectionId })
    if (!convo) {
      throw new Error('Conversation not found.')
    }
    if (!convo.participants.includes(userId!)) {
      throw new Error('Not authorised!')
    }
    const partnerId = convo.participants.find(id => id != userId)
    const inbox = await InboxCol.whereEqualTo('userId', userId!).findOne()
    const partnerInbox = await InboxCol.whereEqualTo('userId', partnerId!).findOne()
    const firestoreConvo = await ConversationCol.findById(firestoreCollectionId)
    await ConversationCol.delete(firestoreConvo.id)
    inbox!.conversationIds = inbox!.conversationIds.filter(id => id != firestoreConvo.id)
    partnerInbox!.conversationIds = partnerInbox!.conversationIds.filter(id => id != firestoreConvo.id)
    await InboxCol.update(inbox!)
    await InboxCol.update(partnerInbox!)
    await convo.remove()
    return true
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Message)
  async createMessage(
    @Arg('firestoreCollectionId', () => String) firestoreCollectionId: string,
    @Arg('input', () => MessageInput) input: MessageInput,
    @Ctx() { req }: Context
  ): Promise<Message> {
    const { userId } = req.session
    const { type, upload, text } = input

    const convoEnt = await ConversationEnt.findOne({
      where: {
        firestoreCollectionId,
        participants: ArrayContains([userId])
      }
    })
    if (!convoEnt) {
      throw new Error('Not authorised!')
    }
    const message = new Message()
    message.senderId = userId!
    message.type = type

    if (type == 'text') {
      message.content = text!
    }
    else {
      const { createReadStream, filename } = await upload as FileUpload
      const stream = createReadStream()
      const ext = getExtensionFromFilename(filename)
      const uploaded = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Body: stream,
        Key: `conversations/${convoEnt.id}/media/${type}s/${v4()}.${ext}`,
      }).promise()
      message.content = uploaded.Key
    }
    const convo = await ConversationCol.findById(firestoreCollectionId)
    message.createdAt = new Date()
    message.updatedAt = new Date()
    return convo.messages.create(message)
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deleteMessage(
    @Arg('firestoreCollectionId', () => String) firestoreCollectionId: string,
    @Arg('messageDocumentId', () => String) messageDocumentId: string,
    @Ctx() { req }: Context
  ): Promise<boolean> {
    const { userId } = req.session
    const convo = await ConversationCol.findById(firestoreCollectionId)
    if (!convo) {
      throw new Error('Conversation not found.')
    }
    const message = await convo.messages.findById(messageDocumentId)
    if (!message) {
      throw new Error('Message not found.')
    }
    if (message.senderId != userId) {
      throw new Error('Not authorised!')
    }
    await convo.messages.delete(messageDocumentId)
    return true
  }
}