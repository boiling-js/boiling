import { Users } from '@boiling/core'
import { UserModel } from '../dao/user'
import { Seq } from '../utils'
import fs from 'fs-extra'
import { ChatRoomsService } from './chat-rooms'

export namespace UsersService {
  export const Model = UserModel
  export type U = Omit<Users.Base, 'id'>
  export async function add(u: U) {
    if (await exists(u.username))
      throw new HttpError('CONFLICT', `User with the name "${ u.username }" already exists`)
    return new UserModel(Object.assign({
      id: await Seq.auto('users', 1000)
    }, u)).save()
  }
  export async function del(id: number) {
    Model.findOneAndDelete({ id })
  }
  export async function addTag(id: number, tag: string) {
    const user = await UsersService.getOrThrow(id)
    if (user.tags.includes(tag))
      throw new HttpError('CONFLICT', `${ tag }标签已存在`)
    user.tags.push(tag)
    await user.save()
  }
  export async function delTag(id: number, tag: string) {
    const user = await UsersService.getOrThrow(id)
    const index = user.tags.indexOf(tag)
    if (index === -1)
      throw new HttpError('NOT_FOUND', `${ tag }标签不存在`)
    user.tags.splice(index, 1)
    await user.save()
  }
  type GetReturnType = ReturnType<typeof Model.findOne>
  export function get(id: number): GetReturnType
  export function get(username: string): GetReturnType
  export function get(val: number | string): GetReturnType
  export function get(val: number | string) {
    switch (typeof val) {
      case 'number':
        return Model.findOne({ id: val })
      case 'string':
        return Model.findOne({ username: val })
      default:
        throw new Error('Not support type.')
    }
  }
  export async function getOrThrow(val: number | string, callback?: (user: GetReturnType) => void) {
    const t = get(val)
    const m = await (callback ? callback(t) : t)
    if (!m)
      throw new HttpError('NOT_FOUND', `id 为 '${ val }' 的用户不存在`)
    return m
  }
  export function search(key: string) {
    return Model.find({ username: new RegExp(`${key}.*`) })
  }
  export async function exists(id: number): Promise<boolean>
  export async function exists(uname: string): Promise<boolean>
  export async function exists(arg0: string | number) {
    if (typeof arg0 === 'number')
      return Model.exists({ id: arg0 })
    else
      return Model.exists({ username: arg0 })
  }
  export async function getAvatars() {
    return (await fs.readdir('./static/img/avatar'))
      .map(f => `/img/avatar/${f}`)
  }
  export async function update(id: number, base: Partial<Users.Base>) {
    const user = await UsersService.getOrThrow(id)
    Object.assign(user, base)
    await user.save()
  }
  export namespace Friends {
    export interface Opts {
      tags?: string[]
      remark?: string
    }
    /**
     * 给目标用户添加好友
     *
     * @param uid  - 目标用户
     * @param fUid - 待被添加的用户
     * @param opts - 好友配置信息
     */
    export async function add(uid: number, fUid: number, opts?: Opts) {
      const [ user, friend ] = await Promise.all([UsersService.getOrThrow(uid), UsersService.getOrThrow(fUid)])
      if (user.friends.findIndex((item) => item.id === fUid) !== -1)
        throw new HttpError('CONFLICT', `${ friend.username }已经是你的好友`)
      user.friends.push({ id: fUid, ...Object.assign(<Required<Opts>>{
        tags: [],
        remark: ''
      }, opts) })
      await Promise.all([user.save(), ChatRoomsService.create([user.id, fUid])])
    }
    export async function del(uid: number, fUid: number) {
      const [ user, friend ] = await Promise.all([UsersService.getOrThrow(uid), UsersService.getOrThrow(fUid)])
      const index = user.friends.findIndex((item) => item.id === fUid)
      if (index === -1)
        throw new HttpError('NOT_FOUND', `${ friend.username }不是你的好友`)
      const chatRoom = await ChatRoomsService.get([user.id, fUid])
      await ChatRoomsService.del(chatRoom!.id)
      user.friends.splice(index, 1)
      await user.save()
    }
    export async function get(uid: number) {
      const target = await UsersService.getOrThrow(uid)
      return Promise.all(target.friends.map(
        async friend => Object.assign((
          (await UsersService.getOrThrow(friend.id, m => m.select({ friends: 0 })))
        )?.toJSON(), {
          tags: friend.tags,
          remark: friend.remark
        }))
      )
    }
    export async function update(uid: number, fUid: number, opts: Opts) {
      const [ user, friend ] = await Promise.all([UsersService.getOrThrow(uid), UsersService.getOrThrow(fUid)])
      const index = user.friends.findIndex((item) => item.id === fUid)
      if (index === -1)
        throw new HttpError('NOT_FOUND', `${ friend.username }不是你的好友`)
      user.friends[index] = { ...user.toJSON().friends[index], ...opts }
      await user.save()
    }
  }
}
