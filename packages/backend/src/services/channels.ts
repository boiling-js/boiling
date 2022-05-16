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
    return Model.exists({ id })
  }
  /**
   * 判断频道是否存在，不存在抛出异常
   */
  export function existsOrThrow(id: string) {
    if (!exists(id))
      throw new HttpError(
        'NOT_FOUND',  `id 为 '${ id }' 的频道不存在`
      )
  }
  /**
   * 通过频道 id 获取频道
   */
  export async function get(id: string) {
    return Model.findOne({ id })
  }
  /**
   * 通过频道 id 获取频道，不存在抛出异常
   */
  export async function getOrThrow(id: string) {
    await existsOrThrow(id)
    return get(id)
  }
  /**
   * 通过频道名称或者简介搜索频道
   */
  export function search() {
  }
  /**
   * 删除解散频道
   */
  export function del() {
  }
  /**
   * 更新频道基础信息
   */
  export function update() {
  }
}
