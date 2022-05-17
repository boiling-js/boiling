import { ElMessage, ElMessageBox } from 'element-plus'
import { Store } from 'vuex'
import { State } from './store'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>
    $logger: Console
    $prompt: typeof ElMessageBox.prompt
    $message: typeof ElMessage
  }
}
