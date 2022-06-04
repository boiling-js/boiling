import { build, BuildOptions } from 'esbuild'
import { configDotenv } from '@boiling/utils'

configDotenv()

const options = {
  entryPoints: ['./src/runner.ts'],
  bundle: true,
  target: 'node14',
  platform: 'node',
  sourcemap: false,
  external: [ '@boiling/utils' ],
  define: {
    'process.env.PRODUCT_URL': JSON.stringify(process.env.PRODUCT_URL)
  }
} as BuildOptions

Promise.all([
  build({
    ...options,
    format: 'cjs',
    outfile: './dist/index.js'
  })
]).catch(error => {
  console.error(error)
  process.exit(1)
})
