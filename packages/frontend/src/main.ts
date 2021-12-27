import { createApp } from 'vue'

import './assets/css-var.scss'
import './assets/element.scss'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')
