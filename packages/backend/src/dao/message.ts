import { Schema, model } from 'mongoose'
import { Messages, Users } from '@boiling/core'

const messageSchema = new Schema<Messages.Model>({
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
    type: Date,
    required: true
  },
  chatRoomId: {
    type: String,
    required: true
  }
})

messageSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

export const MessageModel = model('Message', messageSchema)
