import { doCommand } from '@boiling/utils'

async function main() {
  let cmd: string | undefined
  let target: string | undefined

  switch (process.env.NODE_ENV) {
    case 'production':
      if (await doCommand('yarn', 'build'.split(' ')) !== 0)
        return

      cmd = 'node'
      target = 'dist/index.js'
      break
    case 'development':
      cmd = 'nodemon'
      target = 'src/index.ts'
      break
  }
  cmd && await doCommand(cmd, `-r dotenv/config ${ target }`.split(' '))
}
main().then(undefined)
