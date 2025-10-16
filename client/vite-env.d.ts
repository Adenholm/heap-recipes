interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add other VITE_ variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
