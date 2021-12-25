import { HttpError as _HttpError } from './HttpError'

declare global {
  const HttpError: _HttpError
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
      HOST: string
    }
  }
}

// @ts-ignore
global.HttpError = _HttpError
