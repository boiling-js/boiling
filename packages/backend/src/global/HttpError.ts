import { StatusCodes } from 'http-status-codes'

type Status = keyof typeof StatusCodes

export interface HttpError {
  new(key: number, msg: string): this
  new(key: Status, msg: string): this
}

export class HttpError extends Error {
  msg: string
  code: StatusCodes
  constructor(key: any, msg: string) {
    super()
    this.msg = msg
    switch (typeof key) {
      case 'string':
        this.code = StatusCodes[key as Status]
        break
      case 'number':
        this.code = key as StatusCodes
        break
      default:
        throw new Error('Not support type for key.')
    }
  }
}
