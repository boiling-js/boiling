import { ElMessage, ElMessageBox } from 'element-plus'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $logger: Console
    $prompt: typeof ElMessageBox.prompt
    $message: typeof ElMessage
  }
}
