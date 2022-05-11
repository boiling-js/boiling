import { Router } from '@boiling/core'
import { File } from 'formidable'

export const router = new Router({
  prefix: '/common'
})
  .post('/upload', async ctx => {
    const files = Object.entries(ctx.request.files ?? {}).reduce((acc, [_, arg]) => {
      return acc.concat(Array.isArray(arg) ? arg : [ arg ])
    }, [] as File[])
    console.log('upload files:', files)
  })
