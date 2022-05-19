import {
  Api,
  attachApi,
  Channels,
  ChatRooms,
  Messages,
  Pagination,
  QueryPromise,
  SearchQuery,
  Users
} from '@boiling/core'
import { ElMessage } from 'element-plus'

interface OfficialApi {
  /** 搜索用户 */
  users: QueryPromise<Pagination<Users.BaseOut>, SearchQuery> & {
    /** 注册新用户 */
    add(d: Users.Register): Promise<Users.Out>
    /** 获取头像*/
    avatars: Promise<string[]>
  }
  /** 获取指定用户 */
  user(id: number | '@me'): Promise<Users.BaseOut> & {
    upd(d: Users.UpdateOut): Promise<void>
    password: {
      upd(d: { oldPwd: string, newPwd: string }): Promise<void>
    }
    status: {
      /** 登录用户并设置用户状态 */
      add(d: Users.Login): Promise<Users.Out>
      /** 更改用户状态 */
      upd(d: { status: Users.Status }): Promise<void>

    }
    /** 获取讨论组 */
    groups: Promise<ChatRooms.Model[]>
    /** 获取好友列表 */
    friends: Promise<Users.FriendOut[]> & {
      /** 添加好友 */
      add(d: Users.Friend): Promise<void>
    }
    tag: {
      /** 创建好友标签 */
      add(d: { tag: string }): Promise<void>
    }
    friend(fUid: Pick<Users.Friend, 'id'>['id']): {
      del(): Promise<void>
      upd(d: Omit<Users.Friend, 'id'>): Promise<void>
    }
    avatar: {
      upd(d: { avatar: string }): Promise<void>
    }
  }
  'chat-rooms': QueryPromise<Pagination<ChatRooms.Model>, SearchQuery & {
    disableToast?: boolean
  }> & {
    /** 创建聊天室 */
    add(d: Pick<ChatRooms.Model, 'members' | 'name' | 'avatar' | 'channelId'>): Promise<ChatRooms.Model>
  }
  /** 聊天室 */
  'chat-room'(chatRoomId: string): {
    upd(d: {
      name?: string
      avatar?: string
      members?: string[]
    }): Promise<void>
    messages: QueryPromise<Pagination<Messages.Model>, SearchQuery> & {
      /** 发送消息 */
      add(d: { content: string }): Promise<Messages.Model>
    }
    members: Promise<Users.FriendOut[]>
    files: Promise<void>
  }
  /** 频道 */
  channels:  QueryPromise<Pagination<Channels.Model>, SearchQuery> & {
    add(d: Pick<Channels.Model, 'name' | 'avatar' | 'description'>): Promise<Channels.Model>
  }
  channel(channelId: string): Promise<Channels.Model> & {
    /** 更新频道 */
    upd(d: {
      name?: string
      avatar?: string
      description?: string
      members?: Channels.MemberMeta[]
    }): Promise<void>
    /** 删除频道 */
    del(): Promise<void>
    /** 子频道 */
    subChannels: {
      /** 创建子频道 */
      add(d: {title: string}): Promise<void>
    }
    /** 聊天室 */
    chatRooms(chatRoomId: string): {
      /** 创建聊天室 */
      add(d: {title: string, chatRoomTitle?: string, description?: string}): Promise<void>
    }
    members: {
      /** 添加成员 */
      add(d: { members: Channels.MemberMeta[] }): Promise<void>
    }
  }
}

class OfficialApi extends Api {
  constructor() {
    super('/api')
    return attachApi(this)
  }
}

export const api = new OfficialApi()

api.on('resp.rejected', async error => {
  const response = error?.response
  let msg = response?.data as string | undefined
  // TODO 处理全局异常
  switch (response?.status) {
    case 401:
      msg = msg || '登陆过期'
      location.href = '/login'
      break
    case 403:
      msg = msg || '没有权限'
      break
    case 404:
      msg = msg || '资源不存在'
      break
    case 500:
      msg = msg || '服务器错误'
      break
    default:
      msg = msg || '未知错误'
  }
  if (!/disableToast=true/.test(response?.request.responseURL))
    ElMessage.error(msg)
  const config = response?.config
  throw new Error(`[${ response?.status }-${ config?.method }]${ config?.url }("${ msg }")`)
})
