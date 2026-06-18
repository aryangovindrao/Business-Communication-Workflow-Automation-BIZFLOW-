import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/motion';

const LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'Pricing', href: '#cta' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <nav
        className={cn(
          'flex w-full max-w-5xl items-center gap-2 rounded-full px-3 py-2 transition-all duration-300',
          scrolled ? 'glass shadow-tile ring-soft' : 'bg-white/40',
        )}
      >
        <a href="#top" className="flex items-center gap-2 pl-1 pr-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-brand-400 shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">BizFlow</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5">
          <a
            href="http://localhost:5173/login"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </a>
          <a
            href="http://localhost:5173/signup"
            className="group relative inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Start free
          </a>
        </div>
      </nav>
    </motion.header>
  );
}
