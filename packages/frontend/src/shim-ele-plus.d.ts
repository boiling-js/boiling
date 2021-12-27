import { ElMessage, ElMessageBox } from 'element-plus'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $prompt: typeof ElMessageBox.prompt
    $message: typeof ElMessage
  }
}

