import { ChannelModel } from '../dao/channel'
import { Channels } from '@boiling/core'

export namespace ChannelsService {
  export const Model = ChannelModel
  type M = Channels.Model
}
