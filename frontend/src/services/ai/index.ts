import { MOCK_MODE } from '@/lib/api-client';
import { mockAiProvider } from './mock-provider';
import { huggingFaceProvider } from './huggingface-provider';
import { ollamaProvider } from './ollama-provider';
import type { AiProvider } from './types';

export type { AiProvider, IntentResult, SentimentResult, ReplyOptions } from './types';

const PROVIDER = (import.meta.env.VITE_AI_PROVIDER as string) ?? 'mock';

/**
 * Resolve the active AI provider.
 * - In MOCK_MODE the mock provider is always used so the app runs anywhere.
 * - Otherwise the configured provider is selected (huggingface | ollama),
 *   defaulting to mock when unset/unknown.
 */
function resolveProvider(): AiProvider {
  if (MOCK_MODE) return mockAiProvider;
  switch (PROVIDER) {
    case 'huggingface':
      return huggingFaceProvider;
    case 'ollama':
      return ollamaProvider;
    default:
      return mockAiProvider;
  }
}

/** The single AI entry point used by services/hooks/components. */
export const ai: AiProvider = resolveProvider();

export const aiProviderName = ai.name;
