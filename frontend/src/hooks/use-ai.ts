import { useMutation } from '@tanstack/react-query';
import { aiService, aiProviderLabel } from '@/services/ai-service';
import type { ReplyOptions } from '@/services/ai';

/** Label for the active AI backend (e.g. 'backend' in production, 'mock' offline). */
export const aiProviderName = aiProviderLabel;

export function useGenerateReply() {
  return useMutation({
    mutationFn: ({ context, options }: { context: string; options?: ReplyOptions }) =>
      aiService.generateReply(context, options),
  });
}

export function useSummarize() {
  return useMutation({
    mutationFn: (text: string) => aiService.summarize(text),
  });
}
