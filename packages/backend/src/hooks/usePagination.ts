import { Pagination, SearchQuery } from '@boiling/core'
import mongoose from 'mongoose'

interface SearchService<M extends mongoose.Model<any>> {
  Model: M
  search(key: string): ReturnType<M['find']>
}

export default function usePagination<
  M extends mongoose.Model<any>, S extends SearchService<M>
>(searchService: S, searchQuery: SearchQuery) {
  const { key, page = 0, num = 10 } = searchQuery
  const s = searchService.search(key)
  return async <T>() => Promise.all([
    s.clone().count(), s.limit(num).skip(page*num)
  ]).then(([count, items]) => <Pagination<T>>{ count, items })
}
