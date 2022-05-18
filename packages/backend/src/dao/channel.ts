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
    id: { type: Number, required: true },
    name: { type: String }
  }],
  subChannels: [{
    subTitle: { type: String },
    chatRooms: [{
      id: { type: String, required: true },
      desc: { type: String }
    }]
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
