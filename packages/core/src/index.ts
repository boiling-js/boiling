import Schema from 'schemastery'
import './schemastery-ext'

export const Pagination = <Item extends Schema>(item: Item) => Schema.interface({
  count: Schema.number(),
  items: Schema.array(item)
})
export interface Pagination<Item> {
  count: number
  items: Item[]
}
export interface SearchQuery {
  key: string
  num?: number
  page?: number
}

export * from './users'
export * from './messages'
export * from './chat-rooms'
export * from './api'
export * from './router'
export { Utils } from './utils'
export { WsClient } from './ws-client'
