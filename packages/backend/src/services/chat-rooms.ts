import { Messages } from '@boiling/core'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuid } from 'uuid'
import { MessageModel } from '../dao/message'
import { UsersService } from './users'

export namespace ChatRoomsService {
  export const Model = MessageModel
  export type M = Omit<Messages.Model, 'id' | 'sender'>
  /**
   * 获取聊天室数据
   */
  export async function get(id: string) {
    return (await MessageModel.find({ id }))
  }
  /**
   * 为聊天室创建一条消息
   *
   * 如果为聊天室的第一条消息，则在用户的聊天室列表中添加该聊天室
   */
  export async function pushMessage(
    senderId: number, msg: M, receiverIds: number[]
  ) {
    const user = await UsersService.getOrThrow(senderId)
    const dealIds = receiverIds.concat(senderId)
    try {
      for (let i = 0; i < dealIds.length; i++) {
        await UsersService.addChatRoom(dealIds[i], msg.chatRoomId)
      }
    } catch (e) {
      if (!(e instanceof HttpError && e.code === StatusCodes.CONFLICT)) {
        throw e
      }
    }
    return new MessageModel({
      ...msg,
      id: uuid(),
      sender: user
    }).save()
  }
  /**
   * 获取聊天室的消息列表
   */
  export function getMessages(id: string) {
    return MessageModel.find({ chatRoomId: id })
  }
}
