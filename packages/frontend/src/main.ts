import { createApp } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import './assets/css-var.scss'
import './assets/element.scss'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.config.globalProperties = {
  $message: ElMessage,
  $prompt: ElMessageBox.prompt
}

app
  .use(router)
  .use(store)
  .mount('#app')
