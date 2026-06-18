import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { SectionHeading, EASE } from '@/lib/motion';
import { STILL } from '@/lib/still';
import { cn } from '@/lib/cn';

const QUOTES = [
  {
    name: 'Sarah Mitchell',
    role: 'Head of Support, Nexis',
    initials: 'SM',
    quote:
      'BizFlow auto-classifies and routes every ticket before my team even logs in. Our first-response time dropped by 64% in the first month.',
  },
  {
    name: 'Diego Fernández',
    role: 'VP Sales, MercadoLite',
    initials: 'DF',
    quote:
      'Sales inquiries now land with the right rep, a drafted reply, and the CRM already updated. It feels like we hired a whole ops team overnight.',
  },
  {
    name: 'Priya Nair',
    role: 'COO, Frostbyte',
    initials: 'PN',
    quote:
      'The drag-and-drop workflow builder replaced three separate tools for us. Non-technical managers ship automations in minutes.',
  },
  {
    name: 'Tom Becker',
    role: 'Customer Success, Vertex',
    initials: 'TB',
    quote:
      'Sentiment analysis flags unhappy customers instantly, so we reach the ones who matter first. CSAT is up to 4.7 and climbing.',
  },
];

export function Testimonials() {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const active = ((index % QUOTES.length) + QUOTES.length) % QUOTES.length;

  const paginate = (d: number) => setState([index + d, d]);

  useEffect(() => {
    if (STILL) return;
    const id = setInterval(() => setState(([i]) => [i + 1, 1]), 5500);
    return () => clearInterval(id);
  }, []);

  const t = QUOTES[active];

  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-24 sm:py-28">
      <SectionHeading
        eyebrow="Customers"
        title="Loved by modern teams"
        subtitle="Thousands of businesses, from startups to enterprises, run their customer communication on BizFlow."
      />

      <div className="relative mx-auto mt-14 max-w-2xl">
        {/* side peek panels for depth */}
        <div className="absolute -left-6 top-6 hidden h-[80%] w-full rounded-3xl bg-white/60 ring-soft sm:block" />
        <div className="absolute -right-6 top-6 hidden h-[80%] w-full rounded-3xl bg-white/60 ring-soft sm:block" />

        <div className="relative h-[300px] sm:h-[260px]">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={active}
              custom={dir}
              initial={{ opacity: 0, x: dir >= 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir >= 0 ? -60 : 60 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute inset-0 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card ring-soft sm:p-10"
            >
              <Quote className="h-8 w-8 text-brand-200" />
              <p className="mt-4 text-pretty text-lg font-medium leading-relaxed text-ink sm:text-xl">
                “{t.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
                  {t.initials}
                </span>
                <div className="text-left">
                  <div className="text-sm font-bold text-ink">{t.name}</div>
                  <div className="text-xs text-ink-muted">{t.role}</div>
                </div>
                <div className="ml-2 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-soft shadow-tile transition-colors hover:bg-ink/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setState([i, i > active ? 1 : -1])}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-6 bg-brand-600' : 'w-1.5 bg-ink/15',
                )}
              />
            ))}
          </div>
          <button
            onClick={() => paginate(1)}
            aria-label="Next"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-soft shadow-tile transition-colors hover:bg-ink/5"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
