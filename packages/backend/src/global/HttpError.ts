import { StatusCodes } from 'http-status-codes'

type Status = keyof typeof StatusCodes

export interface HttpError {
  new(key: number, msg: string): this
  new(key: Status, msg: string): this
}

function genCode(key: any) {
  switch (typeof key) {
    case 'string':
      return StatusCodes[key as Status]
    case 'number':
      return key as StatusCodes
    default:
      throw new Error('Not support type for key.')
  }
}

export class HttpError extends Error {
  msg: string
  code: StatusCodes
  constructor(key: any, msg: string) {
    super(`[${ genCode(key) }] ${ msg }`)
    this.msg = msg
    this.code = genCode(key)
  }
}
