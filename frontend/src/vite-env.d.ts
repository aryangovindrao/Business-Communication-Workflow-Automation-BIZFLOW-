/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_HF_TOKEN?: string;
  readonly VITE_HF_MODEL_INTENT?: string;
  readonly VITE_HF_MODEL_SENTIMENT?: string;
  readonly VITE_HF_MODEL_SUMMARY?: string;
  readonly VITE_OLLAMA_BASE_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
