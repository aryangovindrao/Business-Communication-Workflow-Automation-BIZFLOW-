import { Sparkles, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IntentBadge, SentimentBadge } from '@/components/common/badges';
import { useReclassify } from '@/hooks/use-messages';
import { useSummarize, aiProviderName } from '@/hooks/use-ai';
import { percent } from '@/utils/format';
import type { Message } from '@/types';

export function AiAssistant({ message }: { message: Message }) {
  const reclassify = useReclassify();
  const summarize = useSummarize();

  const threadText = message.thread.map((t) => t.body).join('\n');

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Assistant
        </CardTitle>
        <Badge variant="secondary" className="text-[10px]">
          {aiProviderName}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Intent */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Detected intent</span>
            <IntentBadge intent={message.intent} />
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: percent(message.intentConfidence) }}
            />
          </div>
          <p className="text-right text-[11px] text-muted-foreground">
            {percent(message.intentConfidence, 1)} confidence
          </p>
        </div>

        {/* Sentiment */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Sentiment</span>
          <SentimentBadge sentiment={message.sentiment} />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => reclassify.mutate(message.id)}
          disabled={reclassify.isPending}
        >
          {reclassify.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Re-run classification
        </Button>

        {/* Summary */}
        <div className="space-y-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => summarize.mutate(threadText)}
            disabled={summarize.isPending}
          >
            {summarize.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Summarize thread
          </Button>
          {summarize.data && (
            <p className="animate-fade-in rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
              {summarize.data}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
