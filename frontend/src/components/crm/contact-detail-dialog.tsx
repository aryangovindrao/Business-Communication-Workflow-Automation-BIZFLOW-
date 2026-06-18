import {
  Mail,
  Phone,
  Building2,
  Calendar,
  PhoneCall,
  StickyNote,
  MessageSquare,
  CircleDot,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeadStatusBadge } from '@/components/common/badges';
import { useUpdateLeadStatus } from '@/hooks/use-contacts';
import { currency, fullDate, initials, timeAgo } from '@/utils/format';
import {
  LEAD_STATUSES,
  type Contact,
  type InteractionType,
  type LeadStatus,
} from '@/types';
import type { LucideIcon } from 'lucide-react';

const INTERACTION_ICON: Record<InteractionType, LucideIcon> = {
  email: Mail,
  call: PhoneCall,
  meeting: Calendar,
  note: StickyNote,
  chat: MessageSquare,
};

export function ContactDetailDialog({
  contact,
  onOpenChange,
}: {
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
}) {
  const updateStatus = useUpdateLeadStatus();

  return (
    <Dialog open={!!contact} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {contact && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{initials(contact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    {contact.name}
                    <LeadStatusBadge status={contact.status} />
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">
                    {contact.company}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {contact.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {contact.company}
              </div>
              <div className="flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-muted-foreground" />
                Value: <span className="font-medium">{currency(contact.value)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Lead status</p>
                <p className="text-xs text-muted-foreground">
                  Owner: {contact.ownerName ?? 'Unassigned'} · Added{' '}
                  {timeAgo(contact.createdAt)}
                </p>
              </div>
              <Select
                value={contact.status}
                onValueChange={(v) =>
                  updateStatus.mutate({ id: contact.id, status: v as LeadStatus })
                }
              >
                <SelectTrigger className="w-[140px] capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Activity timeline</p>
              {contact.interactions.length === 0 && contact.meetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="max-h-56 space-y-3 overflow-y-auto scrollbar-thin pr-1">
                  {contact.interactions.map((it) => {
                    const Icon = INTERACTION_ICON[it.type];
                    return (
                      <div key={it.id} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{it.summary}</p>
                          <p className="text-xs text-muted-foreground">
                            {fullDate(it.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {contact.meetings.map((mt) => (
                    <div key={mt.id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10">
                        <Calendar className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{mt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {fullDate(mt.date)} · {mt.attendees.join(', ')}
                        </p>
                        {mt.notes && (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            “{mt.notes}”
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
