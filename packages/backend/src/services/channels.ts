import { ChannelModel } from '../dao/channel'
import { Channels } from '@boiling/core'
import { UsersService } from './users'

export namespace ChannelsService {
  export const Model = ChannelModel
  type M = Channels.Model

  /**
   * 创建频道
   */
  export async function create(
    creatorId: number, m: Pick<M, 'name' | 'avatar' | 'description'>
  ) {
    await UsersService.existsOrThrow(creatorId)
    return new Model({
      ...m,
      members: [{
        id: creatorId,
        rules: ['owner']
      }]
    }).save()
  }
  /**
   * 判断频道是否存在
   */
  export function exists(id: string) {
    return Model.exists({ _id: id })
  }
  /**
   * 判断频道是否存在，不存在抛出异常
   */
  export async function existsOrThrow(id: string) {
    if (!await exists(id))
      throw new HttpError(
        'NOT_FOUND',  `id 为 '${ id }' 的频道不存在`
      )
  }
  /**
   * 通过频道 id 获取频道
   */
  export async function get(id: string) {
    return Model.findOne({ _id: id })
  }
  /**
   * 通过频道 id 获取频道，不存在抛出异常
   */
  export async function getOrThrow(id: string) {
    await existsOrThrow(id)
    return get(id) as Promise<Exclude<Awaited<ReturnType<typeof get>>, null>>
  }
  /**
   * 通过频道名称或者简介搜索频道
   * 为空时返回全部频道
   */
  export function search(key = '') {
    return Model.find({
      $or: [
        { name: { $regex: new RegExp(`.*${key}.*`) } },
        { description: { $regex: new RegExp(`.*${key}.*`) } }
      ]
    })
  }
  /**
   * 删除解散频道
   */
  export async function del(id: string) {
    await existsOrThrow(id)
    await Model.deleteOne({ _id: id })
  }
  /**
   * 更新频道基础信息
   */
  export async function update(id: string, options: Partial<Pick<M, 'name' | 'avatar' | 'members' | 'description'>>) {
    await existsOrThrow(id)
    await Model.updateOne({ _id: id }, options)
  }
  /**
   * 添加子频道
   */
  export async function addSubChannel(id: string, subTitle: string) {
    await existsOrThrow(id)
    await Model.updateOne({ _id: id }, { $push: { subChannel: { subTitle } } })
  }
  /**
   * 为子频道添加聊天室
   * */
  export async function addChatRoom(id: string, subTitle: string, chatRoomId: string) {
    await existsOrThrow(id)
    await Model.updateOne({ _id: id }, { $push: { chatRoom: chatRoomId } })
  }
  /**
   * 添加成员
   */
  export async function addMember(id: string, members: Channels.MemberMeta[]) {
    await existsOrThrow(id)
    await Model.updateOne({ _id: id }, { $push: { members: { $each: members } } })
  }
}
