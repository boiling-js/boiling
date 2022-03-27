import { Paginate, Pagination } from '@boiling/core'
import mongoose from 'mongoose'

export interface SearchService<M extends mongoose.Model<any>> {
  Model: M
  search(...args: any[]): ReturnType<M['find']>
}

export default function usePagination<
  M extends mongoose.Model<any>, S extends SearchService<M>
>(searchService: S, paginate: Paginate) {
  const { page = 0, num = 10 } = paginate
  return <T>(...args: Parameters<S['search']>) => {
    const s = searchService.search(...args)
    return Promise.all([
      s.clone().count(), s.limit(num).skip(page*num)
    ]).then(([count, items]) => <Pagination<T>>{ count, items })
  }
}
