import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Inbox as InboxIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageList } from '@/components/inbox/message-list';
import { MessageDetail } from '@/components/inbox/message-detail';
import { EmptyState } from '@/components/common/empty-state';
import { useMessages } from '@/hooks/use-messages';
import { INTENTS, type Channel, type Intent, type MessageStatus } from '@/types';

export function InboxPage() {
  const params = useParams<{ id: string }>();
  const [status, setStatus] = useState<MessageStatus | 'all'>('all');
  const [channel, setChannel] = useState<Channel | 'all'>('all');
  const [intent, setIntent] = useState<Intent | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(params.id);

  const { data: messages, isLoading } = useMessages({
    status,
    channel,
    intent,
    search,
  });

  // Keep a valid selection as the filtered list changes.
  useEffect(() => {
    if (!messages?.length) {
      setSelectedId(undefined);
      return;
    }
    if (!selectedId || !messages.some((m) => m.id === selectedId)) {
      setSelectedId(messages[0].id);
    }
  }, [messages, selectedId]);

  const selected = useMemo(
    () => messages?.find((m) => m.id === selectedId),
    [messages, selectedId],
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* List column */}
      <div className="flex w-full max-w-sm flex-col border-r">
        <div className="space-y-3 border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as MessageStatus | 'all')}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel | 'all')}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="contact_form">Contact form</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={intent} onValueChange={(v) => setIntent(v as Intent | 'all')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All intents</SelectItem>
              {INTENTS.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Detail column */}
      <div className="hidden min-w-0 flex-1 md:block">
        {selected ? (
          <MessageDetail key={selected.id} message={selected} />
        ) : (
          <EmptyState
            icon={InboxIcon}
            title="Select a message"
            description="Choose a conversation from the list to view its thread and AI analysis."
          />
        )}
      </div>
    </div>
  );
}
