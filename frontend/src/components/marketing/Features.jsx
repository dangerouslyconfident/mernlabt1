import { useRef } from 'react';
import { Cpu, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GlassCard from '../ui/GlassCard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Features Section with 3 concrete product value-prop glass cards
 * Animated via GSAP ScrollTrigger with calm staggered entrance.
 */
export default function Features() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.feature-card', {
          opacity: 0,
          y: 32,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  const features = [
    {
      icon: Cpu,
      eyebrow: 'Curated Catalog',
      title: 'Precision-tested desk gear',
      description:
        'Every mechanical keyboard, 4K display, and acoustic transducer is rigorously verified for build quality and ergonomic standard.',
      badge: 'Lab 03 Catalog',
      link: '/products',
    },
    {
      icon: Zap,
      eyebrow: 'Real-time Parity',
      title: 'Seamless cart & wishlist sync',
      description:
        'Zero-flicker inventory calculations, resilient persistent sessions, and immediate server-client data synchronicity across tabs.',
      badge: 'Labs 04 & 05',
      link: '/cart',
    },
    {
      icon: ShieldCheck,
      eyebrow: 'Session Architecture',
      title: 'Frictionless HttpOnly security',
      description:
        'Cryptographic session verification via secure cookies with complete MongoDB persistence and zero localStorage token leakage.',
      badge: 'Labs 01 & 02',
      link: '/home',
    },
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full py-24 md:py-36 px-4 sm:px-6 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass/[0.05] border border-glass-border/[0.08] text-xs font-medium text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Core Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-primary leading-tight">
            Engineered from silicon to state.
          </h2>

          <p className="text-sm sm:text-base text-muted leading-relaxed">
            A cohesive shopping experience designed around reliability, aesthetic restraint,
            and cryptographic session integrity.
          </p>
        </div>

        {/* 3 Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-card">
                <GlassCard
                  hoverLift
                  padding="lg"
                  className="h-full flex flex-col justify-between text-left group"
                >
                  <div className="space-y-6">
                    {/* Glass Icon Tile + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-glass/[0.08] border border-glass-border/[0.14] flex items-center justify-center text-accent shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-glass/[0.04] border border-glass-border/[0.06] text-muted">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-wider text-accent">
                        {feature.eyebrow}
                      </div>
                      <h3 className="text-xl font-semibold text-primary tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="pt-6 mt-6 border-t border-glass-border/[0.06]">
                    <Link
                      to={feature.link}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 group-hover:text-accent transition-colors"
                    >
                      <span>Explore feature</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
