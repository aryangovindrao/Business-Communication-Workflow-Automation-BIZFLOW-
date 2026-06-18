import { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Archive,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChannelIcon, StatusBadge } from '@/components/common/badges';
import { AiAssistant } from '@/components/inbox/ai-assistant';
import { useSendReply, useUpdateMessageStatus } from '@/hooks/use-messages';
import { useGenerateReply } from '@/hooks/use-ai';
import { cn } from '@/lib/utils';
import { fullDate, initials } from '@/utils/format';
import type { Message } from '@/types';
import type { ReplyOptions } from '@/services/ai';

type Tone = NonNullable<ReplyOptions['tone']>;

export function MessageDetail({ message }: { message: Message }) {
  const [reply, setReply] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const generate = useGenerateReply();
  const send = useSendReply();
  const updateStatus = useUpdateMessageStatus();

  const handleGenerate = async () => {
    const text = await generate.mutateAsync({
      context: message.body,
      options: { tone },
    });
    setReply(text);
  };

  const handleSend = async () => {
    if (!reply.trim()) return;
    await send.mutateAsync({ id: message.id, body: reply });
    setReply('');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials(message.fromName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold">{message.subject}</h2>
            <StatusBadge status={message.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {message.fromName} &lt;{message.fromEmail}&gt;
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <ChannelIcon channel={message.channel} withLabel />
            {message.assigneeName && <span>· Assigned to {message.assigneeName}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Star"
            className={cn(message.starred && 'text-amber-500')}
          >
            <Star className={cn('h-4 w-4', message.starred && 'fill-amber-400')} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateStatus.mutate({ id: message.id, status: 'resolved' })
            }
            disabled={message.status === 'resolved'}
          >
            <CheckCircle2 className="h-4 w-4" /> Resolve
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => updateStatus.mutate({ id: message.id, status: 'closed' })}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body: thread + AI rail */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 scrollbar-thin lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {message.thread.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                'flex gap-3',
                entry.authorRole === 'agent' && 'flex-row-reverse',
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={cn(
                    'text-xs',
                    entry.authorRole === 'agent' && 'bg-primary/15 text-primary',
                  )}
                >
                  {initials(entry.authorName)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                  entry.authorRole === 'agent'
                    ? 'rounded-tr-sm bg-primary text-primary-foreground'
                    : 'rounded-tl-sm bg-muted',
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{entry.body}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    entry.authorRole === 'agent'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground',
                  )}
                >
                  {entry.authorName} · {fullDate(entry.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {/* full original body for context */}
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Original message
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.body}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <AiAssistant message={message} />
        </div>
      </div>

      {/* Reply composer */}
      <Separator />
      <div className="space-y-3 border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reply</span>
          <div className="flex items-center gap-2">
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={generate.isPending}
            >
              {generate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate AI reply
            </Button>
          </div>
        </div>
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply, or generate one with AI…"
          className="min-h-[110px] resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={!reply.trim() || send.isPending}>
            {send.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send reply
          </Button>
        </div>
      </div>
    </div>
  );
}
