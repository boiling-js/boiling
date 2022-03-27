import { Api, attachApi, ChatRooms, Messages, Pagination, QueryPromise, SearchQuery, Users } from '@boiling/core'
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
  user(id: number | '@me'): {
    status: {
      /** 登录用户并设置用户状态 */
      add(d: Users.Login): Promise<Users.Out>
      /** 更改用户状态 */
      upd(d: { status: Users.Status }): Promise<void>
    }
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
  'chat-rooms': QueryPromise<ChatRooms.Model, any> & {
    /** 创建聊天室 */
    add(d: Pick<ChatRooms.Model, 'members' | 'name' |'avatar'>): Promise<ChatRooms.Model>
  }
  /** 聊天室 */
  'chat-room'(chatRoomId: string): {
    message(senderId: number): & {
      /** 发送消息 */
      add(d: { content: string }): Promise<Messages.Model>
    }
    messages: Promise<Messages.Model[]>
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

  if (msg === undefined)
    // TODO 处理全局异常
    switch (response?.status) {
      case 401:
        msg = '登陆过期'
        break
      case 403:
        msg = '没有权限'
        break
      case 404:
        msg = '资源不存在'
        break
      case 500:
        msg = '服务器错误'
        break
      default:
        msg = '未知错误'
    }
  ElMessage.error(msg)
  const config = response?.config
  throw new Error(`[${ config?.method }]${ config?.url }("${ msg }")`)
})
