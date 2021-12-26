import { spawn } from 'child_process'
import * as fs from 'fs'

const cwd = process.cwd()

const pkg = JSON.parse(fs.readFileSync(`${cwd}/package.json`, 'utf8')) as {
  dependencies: Record<string, string>
}
let cmd = 'yarn'
if (process.platform === 'win32') {
  cmd += '.cmd'
}

Promise.all(Object.keys(pkg.dependencies)
  .filter(name => name.startsWith('@boiling/'))
  .map(name => {
    const args = ['workspace', name, 'build']
    console.log(`> ${cmd} ${args.join(' ')}`)
    const execCmd = spawn(cmd, args, { stdio: 'inherit' })
    return new Promise<void>((resolve, reject) => {
      execCmd.on('close', code => {
        if (code === 0)
          resolve()
        else
          reject(new Error(`${cmd} ${args.join(' ')} failed`))
      })
    })
  }))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
