import { Api, attachApi, Pagination, QueryPromise, SearchQuery, Users } from '@boiling/core'
import { ElMessage } from 'element-plus'

interface OfficialApi {
  users: QueryPromise<Pagination<Users.Out>, SearchQuery> & {
    add(d: Users.Register): Promise<Users.Out>
  }
  user(id: number): {
    status: {
      add(d: Users.Status): Promise<Users.Out>
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

  if (msg === undefined)
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
