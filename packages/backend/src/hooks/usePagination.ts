import { Pagination, SearchQuery } from '@boiling/core'
import mongoose from 'mongoose'

interface SearchService {
  search(key: string): ReturnType<typeof mongoose.Model.find>
}

export default async function usePagination<T>(
  service: SearchService, searchQuery: SearchQuery
) {
  const { key, page = 0, num = 10 } = searchQuery
  const s = service.search(key)
  const [count, items] = await Promise.all([
    s.count(), s.skip((+page)*(+num)).limit(+num)
  ])
  return <Pagination<T>>{ count, items }
}
