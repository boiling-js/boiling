import { HttpError as _HttpError } from './HttpError'

declare global {
  const HttpError: _HttpError
}

// @ts-ignore
global.HttpError = _HttpError
