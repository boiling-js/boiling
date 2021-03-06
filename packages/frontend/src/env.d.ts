/// <reference types="vite/client.d.ts" />

type OSType = 'Linux' | 'Darwin' | 'Windows_NT';

interface Desktop {
  min?: () => void
  max?: () => void
  type?: OSType
}

interface OSMeta {
  isDesktop?: boolean
  type?: OSType
}

export declare global {
  declare const API_HOST: string
  export declare const desktop: Desktop | undefined
  export declare const osMeta: OSMeta | undefined
  interface Window {
    desktop: Desktop | undefined
    osMeta: OSMeta | undefined
  }
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_LOGIN_UID: string
  readonly VITE_LOGIN_PWD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
