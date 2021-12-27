import { Api, attachApi, Users } from '@boiling/core'

interface OfficialApi {
  users: {
    add(d: Users.Register): Promise<Users.Model>
  }
}

class OfficialApi extends Api {
  constructor() {
    super('/apis/')
    return attachApi(this)
  }
}

export const api = new OfficialApi()
