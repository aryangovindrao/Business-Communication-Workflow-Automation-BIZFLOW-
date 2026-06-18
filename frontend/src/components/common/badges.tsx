import {
  Mail,
  MessageSquare,
  FileText,
  Smile,
  Meh,
  Frown,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  Channel,
  Intent,
  LeadStatus,
  MessageStatus,
  Sentiment,
} from '@/types';

const INTENT_STYLES: Record<Intent, string> = {
  'Sales Inquiry': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  'Technical Support': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'Refund Request': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'Billing Issue': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'Meeting Request': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  'General Inquiry': 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
};

export function IntentBadge({ intent }: { intent: Intent }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        INTENT_STYLES[intent],
      )}
    >
      {intent}
    </span>
  );
}

const SENTIMENT_META: Record<
  Sentiment,
  { icon: LucideIcon; className: string }
> = {
  Positive: { icon: Smile, className: 'text-emerald-600 dark:text-emerald-400' },
  Neutral: { icon: Meh, className: 'text-slate-500 dark:text-slate-400' },
  Negative: { icon: Frown, className: 'text-rose-600 dark:text-rose-400' },
};

export function SentimentBadge({
  sentiment,
  showLabel = true,
}: {
  sentiment: Sentiment;
  showLabel?: boolean;
}) {
  const { icon: Icon, className } = SENTIMENT_META[sentiment];
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', className)}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel && sentiment}
    </span>
  );
}

const STATUS_VARIANT: Record<
  MessageStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'outline'
> = {
  open: 'warning',
  pending: 'secondary',
  resolved: 'success',
  closed: 'outline',
};

export function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}

const CHANNEL_META: Record<Channel, { icon: LucideIcon; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  contact_form: { icon: FileText, label: 'Contact Form' },
  chat: { icon: MessageSquare, label: 'Chat' },
};

export function ChannelIcon({
  channel,
  withLabel = false,
}: {
  channel: Channel;
  withLabel?: boolean;
}) {
  const { icon: Icon, label } = CHANNEL_META[channel];
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-4 w-4" />
      {withLabel && <span className="text-xs">{label}</span>}
    </span>
  );
}

const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  contacted: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  qualified: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  proposal: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  won: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  lost: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
        LEAD_STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
