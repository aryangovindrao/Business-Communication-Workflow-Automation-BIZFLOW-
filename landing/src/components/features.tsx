import { motion } from 'framer-motion';
import { Zap, GitBranch, Play, Sparkles } from 'lucide-react';
import { fadeUp, staggerContainer, SectionHeading } from '@/lib/motion';
import { cn } from '@/lib/cn';

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'group flex flex-col overflow-hidden rounded-3xl bg-white p-6 ring-soft shadow-tile transition-shadow hover:shadow-card',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-5">
      <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

const MOCK = 'rounded-2xl bg-canvas p-4 ring-soft';

function InboxMock() {
  const rows = [
    { who: 'JB', sub: 'Enterprise plan for 50 seats', intent: 'Sales', tone: 'bg-emerald-400' },
    { who: 'DW', sub: 'API returning 500 errors', intent: 'Support', tone: 'bg-rose-400' },
    { who: 'EM', sub: 'Can we book a demo?', intent: 'Meeting', tone: 'bg-emerald-400' },
  ];
  return (
    <div className={cn(MOCK, 'flex-1 space-y-2.5')}>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-soft"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
            {r.who}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-ink">{r.sub}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                {r.intent}
              </span>
              <span className={cn('h-2 w-2 rounded-full', r.tone)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkflowMock() {
  const nodes = [
    { icon: Zap, label: 'Trigger', ring: 'ring-emerald-200 text-emerald-600' },
    { icon: GitBranch, label: 'Condition', ring: 'ring-amber-200 text-amber-600' },
    { icon: Play, label: 'Action', ring: 'ring-brand-200 text-brand-600' },
  ];
  return (
    <div className={cn(MOCK, 'flex flex-1 items-center justify-between')}>
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-2',
                n.ring,
              )}
            >
              <n.icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-semibold text-ink-muted">{n.label}</span>
          </div>
          {i < nodes.length - 1 && (
            <div className="mx-1 h-[2px] w-5 rounded bg-ink/15" />
          )}
        </div>
      ))}
    </div>
  );
}

function AnalyticsMock() {
  const bars = [40, 62, 48, 80, 58, 92];
  return (
    <div className={cn(MOCK, 'flex flex-1 items-end gap-2')}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-md bg-gradient-to-t from-brand-500 to-violet-400"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function SentimentMock() {
  return (
    <div className={cn(MOCK, 'flex flex-1 flex-col justify-center gap-2.5')}>
      <div className="h-3 overflow-hidden rounded-full bg-white ring-soft">
        <div className="flex h-full">
          <div className="w-[58%] bg-emerald-400" />
          <div className="w-[27%] bg-slate-300" />
          <div className="w-[15%] bg-rose-400" />
        </div>
      </div>
      <div className="flex justify-between text-[10px] font-semibold">
        <span className="text-emerald-600">Positive 58%</span>
        <span className="text-slate-500">Neutral 27%</span>
        <span className="text-rose-500">Negative 15%</span>
      </div>
    </div>
  );
}

function TeamMock() {
  const people = ['AR', 'PN', 'MC', 'SA'];
  return (
    <div className={cn(MOCK, 'flex flex-1 items-center justify-center')}>
      <div className="flex -space-x-3">
        {people.map((p, i) => (
          <span
            key={i}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-500 text-xs font-bold text-white ring-4 ring-white"
          >
            {p}
          </span>
        ))}
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-bold text-white ring-4 ring-white">
          +9
        </span>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
      <SectionHeading
        eyebrow="Built for every team"
        title={
          <>
            One platform for your
            <br className="hidden sm:block" /> whole customer conversation
          </>
        }
        subtitle="From the first inbound message to a closed deal — classify, route, reply, and report without lifting a finger."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-6"
      >
        <Card className="lg:col-span-4">
          <InboxMock />
          <CardText
            title="Unified AI inbox"
            body="Email, contact forms, and chat in one place — every message auto-classified by intent and sentiment the moment it lands."
          />
        </Card>

        <Card className="lg:col-span-2">
          <SentimentMock />
          <CardText
            title="Sentiment, instantly"
            body="Know how customers feel and escalate the unhappy ones first."
          />
        </Card>

        <Card className="lg:col-span-2">
          <WorkflowMock />
          <CardText
            title="Drag-and-drop workflows"
            body="Trigger → condition → action. Automate routing, replies, and approvals."
          />
        </Card>

        <Card className="lg:col-span-2">
          <AnalyticsMock />
          <CardText
            title="Real-time analytics"
            body="Response time, conversion, CSAT and workflow success — live."
          />
        </Card>

        <Card className="lg:col-span-2">
          <TeamMock />
          <CardText
            title="Your whole team"
            body="Role-based access for Admins, Managers, Agents and Viewers."
          />
        </Card>
      </motion.div>

      {/* highlight strip */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mt-5 flex items-center gap-4 rounded-3xl bg-ink p-6 text-white shadow-glow"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-400/20 text-brand-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium sm:text-base">
          <span className="font-bold">AI does the busywork.</span> Drafted
          replies, auto-assignment, and CRM updates happen before an agent even
          opens the message.
        </p>
      </motion.div>
    </section>
  );
}
