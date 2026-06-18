import { motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Workflow,
  Calendar,
  Sparkles,
  ArrowRight,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react';
import { EASE } from '@/lib/motion';

interface Tile {
  icon: LucideIcon;
  grad: string;
  x: number; // % across the constellation
  y: number; // % down the constellation
}

const CENTER = { x: 50, y: 44 };

const TILES: Tile[] = [
  { icon: FileText, grad: 'from-amber-400 to-amber-500', x: 27, y: 15 },
  { icon: Mail, grad: 'from-sky-400 to-sky-500', x: 9, y: 40 },
  { icon: MessageSquare, grad: 'from-violet-500 to-violet-600', x: 22, y: 73 },
  { icon: Users, grad: 'from-brand-500 to-brand-600', x: 72, y: 14 },
  { icon: BarChart3, grad: 'from-cyan-400 to-cyan-500', x: 91, y: 40 },
  { icon: Workflow, grad: 'from-rose-400 to-rose-500', x: 79, y: 73 },
  { icon: Calendar, grad: 'from-emerald-400 to-emerald-500', x: 50, y: 86 },
];

const VBW = 1100;
const VBH = 400;
const HEADLINE = ['Put', 'your', 'customer', 'communication', 'on'];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 bg-dotgrid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-200/50 via-violet-400/20 to-cyan-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Constellation */}
        <div className="relative mx-auto h-[300px] w-full max-w-4xl sm:h-[360px]">
          {/* dotted connectors */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${VBW} ${VBH}`}
            preserveAspectRatio="none"
            fill="none"
          >
            {TILES.map((t, i) => (
              <motion.line
                key={i}
                x1={(CENTER.x / 100) * VBW}
                y1={(CENTER.y / 100) * VBH}
                x2={(t.x / 100) * VBW}
                y2={(t.y / 100) * VBH}
                stroke="#94a3b8"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="2 9"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.5 + i * 0.08 }}
              />
            ))}
          </svg>

          {/* central AI core */}
          <motion.div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            <div className="animate-floaty">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-ink text-brand-400 shadow-glow ring-4 ring-white sm:h-24 sm:w-24">
                <Sparkles className="h-9 w-9" />
              </div>
            </div>
          </motion.div>

          {/* orbiting tiles */}
          {TILES.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.35 + i * 0.08 }}
              >
                <div
                  className="animate-floaty"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.grad} text-white shadow-tile ring-4 ring-white sm:h-16 sm:w-16`}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Copy */}
        <div className="relative z-20 mx-auto -mt-4 max-w-3xl text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
            className="flex flex-wrap items-center justify-center gap-x-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl"
          >
            {HEADLINE.map((w, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: 'blur(0px)',
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              className="text-gradient"
            >
              autopilot
            </motion.span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.8 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-muted"
          >
            BizFlow classifies every email, form, and chat with AI, triggers the
            right workflow, drafts the reply, and keeps your CRM in sync —
            automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.95 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="http://localhost:5173/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink ring-soft transition-colors hover:bg-ink/5"
            >
              <PlayCircle className="h-4 w-4 text-brand-600" />
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="mt-4 text-xs font-medium text-ink-muted"
          >
            No credit card · Free 14-day trial · Cancel anytime
          </motion.p>
        </div>
      </div>
    </section>
  );
}
