import { createApp } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import './assets/css-var.scss'
import './assets/element.scss'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
const appElement = document.querySelector<HTMLDivElement>('#app')

window.osMeta = {
  isDesktop: !!window?.desktop
}
if (window.osMeta.isDesktop) {
  window.osMeta.type = desktop?.type
  appElement?.classList.add('is-desktop')
  window.osMeta.type
    && appElement?.classList.add(window.osMeta.type)
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
