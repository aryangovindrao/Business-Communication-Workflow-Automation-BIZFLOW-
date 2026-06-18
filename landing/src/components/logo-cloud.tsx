const COMPANIES = [
  'Globex',
  'Frostbyte',
  'MercadoLite',
  'Nimbus',
  'Quantix',
  'Vertex',
  'DataForge',
  'Coastal Trust',
];

export function LogoCloud() {
  return (
    <section className="mt-20 sm:mt-24">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        Trusted by fast-moving teams everywhere
      </p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14 pr-14">
          {[...COMPANIES, ...COMPANIES].map((name, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-xl font-bold tracking-tight text-ink/30"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
