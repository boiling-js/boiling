import { Schema, model } from 'mongoose'
import { Message } from '@boiling/core'
import { UserModel } from './user'

const messageSchema = new Schema<Message.Model>({
  id: {
    type: String,
    unique: true,
    required: true
  },
  sender: {
    type: UserModel,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  chatRoomId: {
    type: String,
    required: true
  }
})

export const MessageModel = model('Message', messageSchema)
