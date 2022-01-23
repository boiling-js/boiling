import { Messages } from '@boiling/core'
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
    senderId: number, msg: M, isFirst = false
  ) {
    const message = await MessageModel.create({
      ...msg,
      sender: { id: senderId }
    })
    if (isFirst) {
      await UsersService.addChatRoom(senderId, message.id)
    }
    return message
  }
  /**
   * 获取聊天室的消息列表
   */
  export function getMessages(id: string) {
    return MessageModel.find({ chatRoomId: id })
  }
}
