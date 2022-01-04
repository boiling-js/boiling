import { Api, attachApi, QueryPromise, SearchQuery, Users } from '@boiling/core'

interface OfficialApi {
  users: QueryPromise<Users.Out[], SearchQuery> & {
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
