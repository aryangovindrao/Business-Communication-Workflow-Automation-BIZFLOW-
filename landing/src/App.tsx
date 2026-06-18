import { MotionConfig } from 'framer-motion';
import { Nav } from '@/components/nav';
import { Hero } from '@/components/hero';
import { LogoCloud } from '@/components/logo-cloud';
import { Features } from '@/components/features';
import { Integrations } from '@/components/integrations';
import { Testimonials } from '@/components/testimonials';
import { CTA } from '@/components/cta';
import { Footer } from '@/components/footer';
import { STILL } from '@/lib/still';

export default function App() {
  return (
    <MotionConfig reducedMotion={STILL ? 'always' : 'never'}>
      <div className={`relative overflow-x-clip ${STILL ? 'motion-still' : ''}`}>
        <Nav />
        <main>
          <Hero />
          <LogoCloud />
          <Features />
          <Integrations />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
