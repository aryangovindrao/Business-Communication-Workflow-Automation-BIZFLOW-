import { useMemo, useState } from 'react';
import { Search, Users, TrendingUp, DollarSign, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactDetailDialog } from '@/components/crm/contact-detail-dialog';
import { useContacts, useUpdateLeadStatus } from '@/hooks/use-contacts';
import { currency, initials, smartDate } from '@/utils/format';
import {
  LEAD_STATUSES,
  type Contact,
  type ContactType,
  type LeadStatus,
} from '@/types';

export function CrmPage() {
  const [tab, setTab] = useState<ContactType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const { data: contacts, isLoading } = useContacts({ type: tab, search });
  const { data: allContacts } = useContacts();
  const updateStatus = useUpdateLeadStatus();

  const stats = useMemo(() => {
    const list = allContacts ?? [];
    const leads = list.filter((c) => c.type === 'lead');
    const customers = list.filter((c) => c.type === 'customer');
    const won = list.filter((c) => c.status === 'won').length;
    const decided = list.filter(
      (c) => c.status === 'won' || c.status === 'lost',
    ).length;
    return {
      pipeline: leads.reduce((a, c) => a + c.value, 0),
      leads: leads.length,
      customers: customers.length,
      winRate: decided ? won / decided : 0,
    };
  }, [allContacts]);

  return (
    <>
      <PageHeader
        title="CRM"
        description="Leads, customers, and every interaction in one place."
      />

      <div className="space-y-6 p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard icon={DollarSign} label="Open pipeline" value={currency(stats.pipeline)} />
          <SummaryCard icon={Users} label="Active leads" value={String(stats.leads)} />
          <SummaryCard icon={TrendingUp} label="Customers" value={String(stats.customers)} />
          <SummaryCard
            icon={Trophy}
            label="Win rate"
            value={`${(stats.winRate * 100).toFixed(0)}%`}
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={tab} onValueChange={(v) => setTab(v as ContactType | 'all')}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="lead">Leads</TabsTrigger>
                  <TabsTrigger value="customer">Customers</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts…"
                  className="pl-9"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Value</TableHead>
                  <TableHead className="hidden lg:table-cell">Owner</TableHead>
                  <TableHead className="hidden sm:table-cell">Last contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : contacts?.map((c) => (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => setSelected(c)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {initials(c.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {c.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {c.company}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={c.status}
                            onValueChange={(v) =>
                              updateStatus.mutate({ id: c.id, status: v as LeadStatus })
                            }
                          >
                            <SelectTrigger className="h-8 w-[130px] capitalize">
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
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm font-medium">
                          {currency(c.value)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {c.ownerName ?? '—'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {smartDate(c.lastContactAt)}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ContactDetailDialog
        contact={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
