import { useMemo, useState } from 'react';
import {
  UserPlus,
  TicketCheck,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  CheckCheck,
  Mail,
  Slack,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/utils/format';
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/use-notifications';
import type { NotificationType } from '@/types';

const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; className: string; label: string }
> = {
  new_lead: { icon: UserPlus, className: 'bg-indigo-500/10 text-indigo-500', label: 'New Lead' },
  ticket_created: { icon: TicketCheck, className: 'bg-sky-500/10 text-sky-500', label: 'Ticket Created' },
  approval_required: { icon: ShieldAlert, className: 'bg-amber-500/10 text-amber-500', label: 'Approval Required' },
  workflow_failed: { icon: AlertTriangle, className: 'bg-rose-500/10 text-rose-500', label: 'Workflow Failed' },
  message_received: { icon: MessageSquare, className: 'bg-violet-500/10 text-violet-500', label: 'New Message' },
};

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [channels, setChannels] = useState({ in_app: true, email: true, slack: true });

  const filtered = useMemo(
    () =>
      filter === 'unread'
        ? notifications?.filter((n) => !n.read)
        : notifications,
    [notifications, filter],
  );
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Activity</CardTitle>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !filtered || filtered.length === 0 ? (
              <EmptyState icon={Bell} title="You're all caught up" />
            ) : (
              <ul className="divide-y">
                {filtered.map((n) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        'flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-accent',
                        !n.read && 'bg-primary/[0.04]',
                      )}
                      onClick={() => !n.read && markRead.mutate(n.id)}
                    >
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', meta.className)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn('truncate text-sm', !n.read && 'font-semibold')}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{n.body}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {meta.label} · via {n.channel.replace('_', '-')} · {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Channel prefs */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Delivery channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChannelToggle
              icon={Bell}
              label="In-app"
              description="Show in the notification center"
              checked={channels.in_app}
              onChange={(v) => setChannels((c) => ({ ...c, in_app: v }))}
            />
            <ChannelToggle
              icon={Mail}
              label="Email"
              description="Send to your inbox via Gmail SMTP"
              checked={channels.email}
              onChange={(v) => setChannels((c) => ({ ...c, email: v }))}
            />
            <ChannelToggle
              icon={Slack}
              label="Slack"
              description="Post to a channel via incoming webhook"
              checked={channels.slack}
              onChange={(v) => setChannels((c) => ({ ...c, slack: v }))}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ChannelToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <Label className="text-sm">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
