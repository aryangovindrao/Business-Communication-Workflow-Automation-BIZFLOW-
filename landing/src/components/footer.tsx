import { Sparkles, Twitter, Github, Linkedin } from 'lucide-react';

const COLS = [
  { title: 'Product', links: ['Inbox', 'Workflows', 'CRM', 'Analytics'] },
  { title: 'Channels', links: ['Email', 'Contact forms', 'Live chat', 'Slack'] },
  { title: 'Company', links: ['About', 'Customers', 'Careers', 'Blog'] },
  { title: 'Resources', links: ['Docs', 'API', 'Status', 'Pricing'] },
];

export function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-t-[2rem] bg-white px-6 pb-0 pt-12 ring-soft sm:px-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {/* brand + tagline */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-brand-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-[15px] font-extrabold tracking-tight">BizFlow</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
                The AI platform that runs your business communication — all in
                one place.
              </p>
              <div className="mt-5 flex gap-2">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-ink-soft ring-soft transition-colors hover:bg-ink hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {COLS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  {col.title}
                </h4>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-ink-soft transition-colors hover:text-brand-600"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t py-6 text-xs text-ink-muted sm:flex-row">
            <span>© {new Date().getFullYear()} BizFlow. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-ink">Privacy</a>
              <a href="#" className="hover:text-ink">Terms</a>
              <a href="#" className="hover:text-ink">Security</a>
            </div>
          </div>

          {/* giant wordmark */}
          <div
            aria-hidden
            className="pointer-events-none select-none pt-6 text-center"
          >
            <span className="block bg-gradient-to-r from-ink via-ink to-brand-500 bg-clip-text text-[22vw] font-black leading-[0.8] tracking-tighter text-transparent [mask-image:linear-gradient(to_bottom,black_40%,transparent)]">
              BizFlow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
