/// <reference types="vite/client" />

interface Desktop {
  min?: () => void
  max?: () => void
}

declare global {
  export declare const desktop: Desktop | undefined
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  declare global {
    export declare const desktop: Desktop | undefined
  }
  const component: DefineComponent<{}, {}, any>
  export default component
}
