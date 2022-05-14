import { createApp } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import './assets/css-var.scss'
import './assets/element.scss'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

window.osMeta = {
  isDesktop: !!window?.desktop
}
if (window.osMeta.isDesktop) {
  window.osMeta.type = desktop?.type
}

app.config.globalProperties = {
  $logger: new Proxy(console, {
    get(target, prop: string) {
      if (process.env.NODE_ENV === 'development') {
        if (['debug'].includes(prop))
          return () => {}
      }
      // @ts-ignore
      return target[prop]
    }
  }),
  $message: ElMessage,
  $prompt: ElMessageBox.prompt
}

app
  .use(router)
  .use(store)
  .mount('#app')
