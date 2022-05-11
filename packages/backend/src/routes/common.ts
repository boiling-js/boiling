import { Router } from '@boiling/core'
import { File } from 'formidable'
import { cp, pathExists } from 'fs-extra'
import * as path from 'path'
import { staticPath } from '../index'

export const router = new Router({
  prefix: '/common'
})
  .post('/upload', async ctx => {
    const files = Object.entries(ctx.request.files ?? {}).reduce((acc, [_, arg]) => {
      return acc.concat(Array.isArray(arg) ? arg : [ arg ])
    }, [] as File[])
    return await Promise.all(files.map(async file => {
      const ext = require('mime-types').extension(file.mimetype)
      const targetPath = path.resolve(staticPath, 'uploads', `${ file.hash }.${ ext }`)
      if (await pathExists(targetPath))
        return targetPath

      return new Promise<string>((resolve, reject) => {
        if (!file.hash)
          throw new Error('file.hash is not defined')
        cp(file.filepath, targetPath, err => err ? reject(err) : resolve(targetPath))
      })
    }))
  })
