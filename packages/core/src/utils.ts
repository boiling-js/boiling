import { createHash } from 'crypto'

export namespace Utils {
  export namespace Security {
    export function encrypt(plaintext: string) {
      return createHash('md5')
        .update(plaintext).digest('hex')
    }
    export function match(waitMatch: string, origin: string) {
      return encrypt(waitMatch) === origin
    }
  }
  export namespace String {
    export function pluralize(word: string) {
      return word + 's'
    }
  }
}
