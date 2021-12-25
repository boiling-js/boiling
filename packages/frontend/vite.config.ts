import { defineConfig } from 'vite'
import ElementPlus from 'unplugin-element-plus/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  server: {
    port: 17980
  },
  plugins: [vue(), ElementPlus()]
})
