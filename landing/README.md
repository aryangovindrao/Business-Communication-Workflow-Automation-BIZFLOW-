# BizFlow — Landing Page

A standalone, animated marketing site for BizFlow. Separate from the app
(`../frontend`) and the API (`../backend`).

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS · **Framer Motion** · lucide-react.

The design + motion language is adapted from a reference reel: a light theme
with a floating "constellation" hero, a bento feature grid, an auto-rotating
integrations carousel, a testimonial carousel, and a giant gradient brand
wordmark — themed in BizFlow's indigo / violet / cyan palette.

## Run

```bash
cd landing
npm install
npm run dev          # http://localhost:5174
```

```bash
npm run build        # type-check + production build to dist/
```

## Structure

```
landing/
├── index.html
└── src/
    ├── main.tsx · App.tsx · index.css
    ├── lib/            # cn(), Framer Motion variants + Reveal/SectionHeading
    └── components/
        ├── nav.tsx           # frosted floating pill nav
        ├── hero.tsx          # constellation + dotted connectors + word reveal
        ├── logo-cloud.tsx    # marquee
        ├── features.tsx      # bento grid with mini UI mocks
        ├── integrations.tsx  # auto-rotating carousel (centered emphasis)
        ├── testimonials.tsx  # carousel
        ├── cta.tsx           # gradient CTA band + stats
        └── footer.tsx        # columns + giant gradient wordmark
```

The CTA / nav buttons link to the app's sign-up and login
(`http://localhost:5173`); change those hrefs to your deployed app URL.
