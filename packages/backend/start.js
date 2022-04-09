const { spawn } = require('child_process')

const doCommand = (cmd, args, options) => new Promise(resolve => {
  if (process.platform === 'win32') {
    cmd += '.cmd'
  }
  const execCmd = spawn(cmd, args, Object.assign({}, { encoding: 'utf-8' }, options))
  execCmd.stdout.pipe(process.stdout)
  execCmd.stderr.pipe(process.stderr)
  execCmd.on('exit', code => {
    resolve(code)
  })
})

async function main() {
  switch (process.env.NODE_ENV) {
    case 'production':
      await doCommand('yarn', 'build'.split(' '))
      await doCommand('node', '-r dotenv/config dist/index.js'.split(' '))
      break
    case 'development':
      await doCommand('nodemon', '-r dotenv/config src/index.ts'.split(' '))
      break
  }
}
main().then(undefined)
