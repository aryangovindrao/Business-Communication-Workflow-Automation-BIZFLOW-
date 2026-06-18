import { apiRequest, MOCK_MODE } from '@/lib/api-client';
import { ai, aiProviderName as clientProviderName } from './ai';
import type { ReplyOptions } from './ai';

/**
 * AI service consumed by the UI. In production it calls the backend AI
 * endpoints (`/api/ai/*`), where inference runs server-side. In offline mock
 * mode it falls back to the in-browser provider.
 */
export const aiProviderLabel = MOCK_MODE ? clientProviderName : 'backend';

export const aiService = {
  async generateReply(context: string, options?: ReplyOptions): Promise<string> {
    if (MOCK_MODE) return ai.generateReply(context, options);
    const res = await apiRequest<{ result: string }>('/ai/reply', {
      method: 'POST',
      body: { text: context, tone: options?.tone ?? 'professional' },
    });
    return res.result;
  },

  async summarize(text: string): Promise<string> {
    if (MOCK_MODE) return ai.summarize(text);
    const res = await apiRequest<{ result: string }>('/ai/summarize', {
      method: 'POST',
      body: { text },
    });
    return res.result;
  },
};
