import type { Intent, Sentiment } from '@/types';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  /** Full distribution over labels (zero-shot style), sorted desc. */
  scores: { label: Intent; score: number }[];
}

export interface SentimentResult {
  sentiment: Sentiment;
  score: number;
}

export interface ReplyOptions {
  tone?: 'professional' | 'friendly' | 'concise' | 'empathetic';
}

/**
 * Provider-agnostic AI contract. The mock provider ships today; the
 * Hugging Face and Ollama providers plug in behind the same interface
 * (see ./providers). In production these run server-side via FastAPI.
 */
export interface AiProvider {
  readonly name: 'mock' | 'huggingface' | 'ollama';
  classifyIntent(text: string): Promise<IntentResult>;
  analyzeSentiment(text: string): Promise<SentimentResult>;
  generateReply(context: string, options?: ReplyOptions): Promise<string>;
  summarize(text: string): Promise<string>;
}
