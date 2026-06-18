import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal, EASE } from '@/lib/motion';

const STATS = [
  ['64%', 'faster first response'],
  ['96%', 'workflow success'],
  ['4.7', 'average CSAT'],
];

export function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-6xl px-4 pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white shadow-glow sm:px-12">
          {/* decorative glow + floating sparkle */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-400/25 blur-3xl" />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>

          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Put your customer communication on autopilot
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base text-white/80">
            Spin up your workspace in seconds. Your first AI-handled message is
            minutes away.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="http://localhost:5173/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="http://localhost:5173/login"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/20"
            >
              Book a demo
            </a>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-8">
            {STATS.map(([n, l]) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <div className="text-3xl font-extrabold">{n}</div>
                <div className="mt-1 text-xs text-white/70">{l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
