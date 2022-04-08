import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  process.env = Object.assign({}, process.env, loadEnv(mode, process.cwd()))

  return {
    server: {
      port: Number(process.env.VITE_PORT) || 3000,
      proxy: {
        '/api': {
          ws: true,
          target: process.env.VITE_API_TARGET,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    plugins: [ vue() ]
  }
})
