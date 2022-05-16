import { Schema, model } from 'mongoose'
import { Channels } from '@boiling/core'

export const channelSchema = new Schema<Channels.Model>({
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  members: [{
    id: { type: String, required: true },
    name: { type: String }
  }],
  chatrooms: [{
    id: { type: String, required: true },
    subTitle: { type: String }
  }],
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

channelSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

export const ChannelModel = model('Channel', channelSchema)
