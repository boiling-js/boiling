import { defineConfig } from 'vite'
import ElementPlus from 'unplugin-element-plus/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    port: 17980,
    proxy: {
      // 选项写法
      '/api': {
        // http://localhost:17980/api/users/123
        // http://localhost:6532/users/123
        target: 'http://localhost:6532',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [vue(), ElementPlus()]
})
