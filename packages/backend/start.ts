import { doCommand } from '@boiling/utils'

async function main() {
  let cmd: string | undefined
  let target: string | undefined

  switch (process.env.NODE_ENV) {
    case 'production':
      if (await doCommand('yarn', [ 'build' ]) !== 0)
        return

      cmd = 'node'
      target = 'dist/index.js'
      break
    case 'development':
      cmd = 'nodemon'
      target = 'src/index.ts'
      break
  }
  cmd && target && await doCommand(cmd, [ target ])
}
main().then(undefined)
