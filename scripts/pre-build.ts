import * as fs from 'fs'
import { doCommand } from '@boiling/utils'

const cwd = process.cwd()

const pkg = JSON.parse(fs.readFileSync(`${cwd}/package.json`, 'utf8')) as {
  dependencies: Record<string, string>
}

Promise.all(Object.keys(pkg.dependencies)
  .filter(name => name.startsWith('@boiling/'))
  .map(async name => {
    const code = await doCommand('yarn', [ 'workspace', name, 'build' ])
    if (code !== 0)
      throw new Error(`${name} build failed`)
  }))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
