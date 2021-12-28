import { Api, attachApi, Users } from '@boiling/core'

interface OfficialApi {
  users: {
    add(d: Users.Register): Promise<Users.Out>
  }
  user(id: string): {
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
