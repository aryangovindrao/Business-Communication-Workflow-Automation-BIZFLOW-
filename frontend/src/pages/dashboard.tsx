import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
} from 'recharts';
import {
  MessageSquare,
  Ticket,
  Timer,
  TrendingUp,
  Workflow as WorkflowIcon,
  Star,
  Users2,
  Sparkles,
  Plus,
  Bot,
  ArrowRight,
  ArrowUpRight,
  HelpCircle,
  Network,
  BookOpen,
  Lightbulb,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/use-analytics';
import { compactNumber, percent } from '@/utils/format';

const TABS = [
  { label: 'Overview', to: '/dashboard', active: true },
  { label: 'Messages', to: '/inbox' },
  { label: 'Workflows', to: '/workflows' },
  { label: 'Performance', to: '/analytics' },
  { label: 'Automations', to: '/workflows' },
  { label: 'Reports', to: '/analytics' },
  { label: 'Integrations', to: '/settings' },
];

const PASTELS = ['#a78bfa', '#818cf8', '#fcd34d', '#f9a8d4', '#bef264', '#67e8f9'];

const RESOURCES: { icon: LucideIcon; chip: string; title: string; desc: string }[] = [
  { icon: HelpCircle, chip: 'bg-violet-100 text-violet-600', title: 'Help Center', desc: 'Explore our detailed documentation and guides.' },
  { icon: Network, chip: 'bg-amber-100 text-amber-600', title: 'Partner Directory', desc: 'Find the perfect partner to support your growth.' },
  { icon: BookOpen, chip: 'bg-sky-100 text-sky-600', title: 'Blog', desc: 'Access popular guides & stories about automation.' },
  { icon: Lightbulb, chip: 'bg-lime-100 text-lime-700', title: 'Use Cases', desc: 'Get inspired by all the ways you can automate.' },
];

function HeaderTitle() {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      Managing
      <span className="inline-flex h-9 w-12 items-center justify-center rounded-full bg-muted text-foreground">
        <Users2 className="h-4 w-4" />
      </span>
      Your Team and
      <span className="inline-flex h-9 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
        <Sparkles className="h-4 w-4" />
      </span>
      Workflows
    </span>
  );
}

export function DashboardPage() {
  const { data: analytics, isLoading } = useAnalytics();
  const k = analytics?.kpis;

  const series = (analytics?.messagesOverTime ?? []).slice(-12);
  const norm = (key: 'messages' | 'resolved' | 'responseMinutes') => {
    const max = Math.max(...series.map((p) => p[key]), 1);
    return series.map((p) => p[key] / max);
  };

  const intent = analytics?.intentDistribution ?? [];
  const intentTotal = intent.reduce((a, p) => a + p.value, 0) || 1;

  const volume = series.map((p) => ({
    date: p.date,
    resolved: p.resolved,
    pending: Math.max(p.messages - p.resolved, 0),
  }));

  return (
    <>
      <PageHeader
        title={<HeaderTitle />}
        actions={
          <Button asChild>
            <Link to="/workflows/new">
              <Plus className="h-4 w-4" /> Create a New Workflow
            </Link>
          </Button>
        }
      />

      <div className="px-6 pb-10">
        {/* Tab row */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                t.active
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main column */}
          <div className="space-y-4">
            {/* KPI row 1 + promo */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading || !k ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[168px] rounded-3xl" />
                ))
              ) : (
                <>
                  <StatCard
                    label="Total Messages"
                    value={compactNumber(k.totalMessages)}
                    icon={MessageSquare}
                    delta={k.totalMessagesDelta}
                    visual={{ type: 'bars', data: norm('messages') }}
                  />
                  <StatCard
                    label="Open Tickets"
                    value={String(k.openTickets)}
                    icon={Ticket}
                    delta={k.openTicketsDelta}
                    invertDelta
                    visual={{ type: 'bars', data: norm('resolved') }}
                  />
                  <StatCard
                    label="Avg Response Time"
                    value={`${k.avgResponseMinutes}m`}
                    icon={Timer}
                    delta={k.avgResponseDelta}
                    invertDelta
                    visual={{ type: 'bars', data: norm('responseMinutes') }}
                  />
                  <PromoCard />
                </>
              )}
            </div>

            {/* KPI row 2 (dots) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {isLoading || !k ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[150px] rounded-3xl" />
                ))
              ) : (
                <>
                  <StatCard
                    label="Lead Conversion"
                    value={percent(k.leadConversionRate)}
                    icon={TrendingUp}
                    delta={k.leadConversionDelta}
                    visual={{ type: 'dots', filled: Math.round(k.leadConversionRate * 10), total: 10 }}
                  />
                  <StatCard
                    label="Workflow Success"
                    value={percent(k.workflowSuccessRate, 1)}
                    icon={WorkflowIcon}
                    delta={k.workflowSuccessDelta}
                    visual={{ type: 'dots', filled: Math.round(k.workflowSuccessRate * 10), total: 10 }}
                  />
                  <StatCard
                    label="CSAT"
                    value={`${k.csat.toFixed(1)} / 5`}
                    icon={Star}
                    delta={k.csatDelta}
                    visual={{ type: 'dots', filled: Math.round((k.csat / 5) * 10), total: 10 }}
                  />
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold tracking-tight">Message Volume</h3>
                      <p className="text-xs text-muted-foreground">
                        Received vs resolved, last 14 days
                      </p>
                    </div>
                    <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                      Last 14 Days
                    </span>
                  </div>
                  <div className="mt-4 h-[230px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volume} barCategoryGap="28%">
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={false}
                          axisLine={false}
                        />
                        <RTooltip
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="resolved" stackId="a" fill="hsl(var(--brand))" />
                        <Bar
                          dataKey="pending"
                          stackId="a"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <Legend color="hsl(var(--primary))" label="Received" />
                    <Legend color="hsl(var(--brand))" label="Resolved" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold tracking-tight">Intent Distribution</h3>
                  <p className="text-xs text-muted-foreground">Classified by AI</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-[150px] w-[150px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={intent}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={42}
                            outerRadius={70}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {intent.map((_, i) => (
                              <Cell key={i} fill={PASTELS[i % PASTELS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="flex-1 space-y-1.5">
                      {intent.map((p, i) => (
                        <li key={p.name} className="flex items-center gap-2 text-xs">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: PASTELS[i % PASTELS.length] }}
                          />
                          <span className="flex-1 truncate text-muted-foreground">
                            {p.name.replace(' Inquiry', '').replace(' Request', '').replace(' Issue', '')}
                          </span>
                          <span className="font-semibold">
                            {Math.round((p.value / intentTotal) * 100)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <RailTile icon={Users2} label="Community" chip="bg-violet-100 text-violet-600" />
              <RailTile icon={GraduationCap} label="Academy" chip="bg-lime-100 text-lime-700" />
            </div>
            {RESOURCES.map((r) => (
              <ResourceCard key={r.title} {...r} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function PromoCard() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand/25 blur-2xl" />
      <div className="relative">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand">
          <Bot className="h-5 w-5" />
        </span>
        <h3 className="mt-3 text-[17px] font-bold leading-snug">
          Take Your Automation to the Next Level
        </h3>
      </div>
      <Button asChild variant="brand" size="sm" className="relative mt-4 w-full justify-center">
        <Link to="/settings">
          Upgrade Now <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function RailTile({
  icon: Icon,
  label,
  chip,
}: {
  icon: LucideIcon;
  label: string;
  chip: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-5">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', chip)}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </CardContent>
    </Card>
  );
}

function ResourceCard({
  icon: Icon,
  chip,
  title,
  desc,
}: {
  icon: LucideIcon;
  chip: string;
  title: string;
  desc: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-3 p-4">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', chip)}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
