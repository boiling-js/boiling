import { Schema, model } from 'mongoose'
import { Messages, Users } from '@boiling/core'

const messageSchema = new Schema<Messages.Model>({
  id: {
    type: String,
    unique: true,
    required: true
  },
  sender: {
    type: new Schema<Users.BaseOut>({
      id: {
        type: Number,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      avatar: {
        type: String,
        required: true
      },
      status: {
        type: String,
        default: 'offline'
      }
    }),
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
