import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { configDotenv } from '@boiling/utils'

configDotenv()

export default defineConfig({
  base: './',
  server: {
    port: Number(process.env.VITE_PORT) || 3000,
    proxy: {
      '/api': {
        ws: true,
        target: `http://${ process.env.BACKEND_HOST }:${ process.env.BACKEND_PORT }`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [ vue() ]
})
