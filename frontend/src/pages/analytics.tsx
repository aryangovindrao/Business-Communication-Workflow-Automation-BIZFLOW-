import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/common/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnalytics } from '@/hooks/use-analytics';
import { CHART_COLORS, SENTIMENT_COLORS } from '@/lib/chart';

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
} as const;

const axis = {
  tick: { fontSize: 11 },
  stroke: 'hsl(var(--muted-foreground))',
  tickLine: false,
  axisLine: false,
} as const;

export function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();
  const [range, setRange] = useState('14d');

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Performance across messaging, conversion, and automation."
        actions={
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
          {/* Message volume */}
          <ChartCard title="Message Volume" description="Received vs resolved">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.messagesOverTime}>
                <defs>
                  <linearGradient id="aMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" {...axis} />
                <YAxis {...axis} width={28} />
                <RTooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="messages" name="Received" stroke={CHART_COLORS[0]} fill="url(#aMsg)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS[3]} fillOpacity={0} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Response time */}
          <ChartCard title="Avg Response Time" description="Minutes to first response">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.messagesOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" {...axis} />
                <YAxis {...axis} width={28} />
                <RTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="responseMinutes" name="Minutes" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Sentiment */}
          <ChartCard title="Sentiment Breakdown" description="Across all channels">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentimentDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  label={(e) => `${e.name}: ${e.value}%`}
                  labelLine={false}
                >
                  {data.sentimentDistribution.map((s) => (
                    <Cell key={s.name} fill={SENTIMENT_COLORS[s.name] ?? CHART_COLORS[0]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Channel distribution */}
          <ChartCard title="Channel Distribution" description="Where messages arrive">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.channelDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis {...axis} width={28} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Share %" radius={[6, 6, 0, 0]}>
                  {data.channelDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Conversion funnel */}
          <ChartCard title="Lead Conversion Funnel" description="Pipeline stages">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.conversionFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="stage" {...axis} width={80} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]} fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Workflow success */}
          <ChartCard title="Workflow Executions" description="Success vs failed per day">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.workflowSuccessTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" {...axis} />
                <YAxis {...axis} width={28} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="success" name="Success" stackId="a" fill={CHART_COLORS[3]} radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" name="Failed" stackId="a" fill={CHART_COLORS[4]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">{children}</div>
      </CardContent>
    </Card>
  );
}
