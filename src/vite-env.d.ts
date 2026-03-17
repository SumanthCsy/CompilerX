/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_HUGGINGFACE_API_KEY: string;
  readonly VITE_RAPIDAPI_KEY: string;
  readonly VITE_RAPIDAPI_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
