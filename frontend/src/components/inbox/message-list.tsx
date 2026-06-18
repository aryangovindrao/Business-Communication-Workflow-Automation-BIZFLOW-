import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ChannelIcon, IntentBadge, SentimentBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { Inbox as InboxIcon, Star } from 'lucide-react';
import { initials, smartDate } from '@/utils/format';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[] | undefined;
  isLoading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function MessageList({
  messages,
  isLoading,
  selectedId,
  onSelect,
}: MessageListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No messages"
        description="Nothing matches your current filters."
      />
    );
  }

  return (
    <div className="divide-y">
      {messages.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={cn(
            'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
            selectedId === m.id && 'bg-accent',
          )}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs">{initials(m.fromName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate text-sm',
                  m.unread ? 'font-semibold' : 'font-medium',
                )}
              >
                {m.fromName}
              </span>
              {m.starred && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />}
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                {smartDate(m.createdAt)}
              </span>
            </div>
            <p className="truncate text-sm text-foreground/80">{m.subject}</p>
            <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <ChannelIcon channel={m.channel} />
              <IntentBadge intent={m.intent} />
              <SentimentBadge sentiment={m.sentiment} showLabel={false} />
              {m.unread && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
