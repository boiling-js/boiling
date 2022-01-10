import { Api, attachApi, Pagination, QueryPromise, SearchQuery, Users } from '@boiling/core'

interface OfficialApi {
  users: QueryPromise<Pagination<Users.Out>, SearchQuery> & {
    add(d: Users.Register): Promise<Users.Out>
  }
  user(id: number | '@me'): {
    status: {
      add(d: Users.Status): Promise<Users.Out>
    }
    friend(fUid: Pick<Users.Friend, 'id'>['id']): {
      add(d: Omit<Users.Friend, 'id'>): Promise<void>
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
