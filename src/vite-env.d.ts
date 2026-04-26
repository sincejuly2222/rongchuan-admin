/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEV_ENABLE_SESSION_RESTORE?: string;
  readonly VITE_DEV_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
