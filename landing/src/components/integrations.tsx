import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Video,
  Calendar,
  Webhook,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeading, EASE } from '@/lib/motion';
import { STILL } from '@/lib/still';
import { cn } from '@/lib/cn';

interface Integration {
  name: string;
  tagline: string;
  icon: LucideIcon;
  grad: string;
}

const ITEMS: Integration[] = [
  { name: 'Gmail', tagline: 'Send & receive over Gmail', icon: Mail, grad: 'from-rose-400 to-red-500' },
  { name: 'Outlook', tagline: 'Microsoft 365 email', icon: Inbox, grad: 'from-sky-400 to-blue-500' },
  { name: 'Slack', tagline: 'Notify channels instantly', icon: MessageSquare, grad: 'from-violet-500 to-purple-600' },
  { name: 'Google Meet', tagline: 'Seamless video meetings', icon: Video, grad: 'from-emerald-400 to-teal-500' },
  { name: 'Calendar', tagline: 'Auto-schedule demos', icon: Calendar, grad: 'from-amber-400 to-orange-500' },
  { name: 'Webhooks', tagline: 'Connect anything else', icon: Webhook, grad: 'from-lime-400 to-lime-600' },
];

export function Integrations() {
  const [active, setActive] = useState(2);

  useEffect(() => {
    if (STILL) return;
    const id = setInterval(() => setActive((a) => (a + 1) % ITEMS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const current = ITEMS[active];

  return (
    <section id="integrations" className="relative py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-dotgrid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Integrations"
          title="Connect your tools in seconds"
          subtitle="BizFlow plugs into the channels and apps your team already uses — no engineering required."
        />

        <div className="mt-14 flex flex-wrap items-end justify-center gap-4 sm:gap-6">
          {ITEMS.map((item, i) => {
            const isActive = i === active;
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActive(i)}
                aria-label={item.name}
                className="outline-none"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.18 : 1,
                    y: isActive ? -8 : 0,
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white ring-4 ring-white sm:h-20 sm:w-20',
                    item.grad,
                    isActive ? 'shadow-glow' : 'opacity-60 shadow-tile saturate-[0.85]',
                  )}
                >
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.div>
              </button>
            );
          })}
        </div>

        {/* active label */}
        <div className="relative mt-8 h-16 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="text-xl font-bold tracking-tight text-ink">
                {current.name}
              </div>
              <div className="mt-1 text-sm text-ink-muted">{current.tagline}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* progress dots */}
        <div className="mt-2 flex justify-center gap-1.5">
          {ITEMS.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-6 bg-brand-600' : 'w-1.5 bg-ink/15',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
