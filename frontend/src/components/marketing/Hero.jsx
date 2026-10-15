import { useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import GlassButton from '../ui/GlassButton';
import GlassCard from '../ui/GlassCard';

gsap.registerPlugin(ScrollTrigger);

/**
 * Isolated, Memoized Dashboard Mock UI Component
 * Separated from parent state to eliminate unnecessary re-renders.
 * Eliminates nested backdrop-filter blur layers that cause Chromium repaint jitter.
 */
const DashboardMockUI = memo(function DashboardMockUI() {
  return (
    <GlassCard
      variant="elevated"
      padding="none"
      className="w-full text-left shadow-[0_24px_64px_rgba(0,0,0,0.6)] border-glass-border/[0.14]"
    >
      {/* Mock Window Top Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-glass-border/[0.08] bg-glass/[0.02]">
        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-glass/[0.15]" />
          <span className="w-3 h-3 rounded-full bg-glass/[0.15]" />
          <span className="w-3 h-3 rounded-full bg-glass/[0.15]" />
        </div>

        {/* Centered Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass/[0.05] border border-glass-border/[0.08] text-[11px] text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="font-mono text-primary/80">shopkart.app/dashboard</span>
        </div>

        {/* Status Indicator (Visibility controlled without DOM unmounts) */}
        <div className="flex items-center gap-2 text-[11px] text-muted font-medium">
          <span className="hidden sm:inline">Encrypted Session</span>
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
        </div>
      </div>

      {/* Dashboard Mock Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Top Stats Tiles - Clean translucent glass without nested blur shaders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-glass/[0.04] border border-glass-border/[0.06] gpu-layer">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Curated Inventory</span>
              <Layers className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-primary">
              24 Products
            </div>
            <div className="text-[11px] text-success flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Real-time DB synced</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-glass/[0.04] border border-glass-border/[0.06] gpu-layer">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Cart Calculations</span>
              <ShoppingBag className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-primary">
              Zero-Flicker
            </div>
            <div className="text-[11px] text-muted mt-1">
              Derived client + server parity
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-glass/[0.04] border border-glass-border/[0.06] gpu-layer">
            <div className="flex items-center justify-between text-muted text-xs mb-1">
              <span>Security Protocol</span>
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="text-xl sm:text-2xl font-semibold text-primary">
              HttpOnly JWT
            </div>
            <div className="text-[11px] text-muted mt-1">
              No localStorage leakage
            </div>
          </div>
        </div>

        {/* Mock Product Rows */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted px-1">
            <span>Featured Hardware</span>
            <span>Live Catalog</span>
          </div>

          {/* Row 1 */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-glass/[0.03] border border-glass-border/[0.06] hover:bg-glass/[0.06] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                K1
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary">
                  Keychron Q1 Pro Wireless Mechanical Keyboard
                </div>
                <div className="text-[11px] text-muted">
                  CNC Aluminum • Gateron Jupiter Red • Hot-swappable
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-primary">$199.00</div>
              <div className="text-[10px] text-success">In Stock</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-glass/[0.03] border border-glass-border/[0.06] hover:bg-glass/[0.06] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-to/15 border border-accent-to/20 flex items-center justify-center text-accent-to text-xs font-semibold">
                DS
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary">
                  Dell UltraSharp 32&quot; 4K Video Conferencing Monitor
                </div>
                <div className="text-[11px] text-muted">
                  IPS Black • HDR400 • Thunderbolt 4 Hub
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-primary">$749.00</div>
              <div className="text-[10px] text-muted">Low Stock</div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-glass/[0.03] border border-glass-border/[0.06] hover:bg-glass/[0.06] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/15 border border-success/20 flex items-center justify-center text-success text-xs font-semibold">
                SN
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-primary">
                  Sony WH-1000XM5 Wireless Noise-Canceling Headphones
                </div>
                <div className="text-[11px] text-muted">
                  Dual Processors • 8 Mics • LDAC Hi-Res Audio
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-primary">$399.00</div>
              <div className="text-[10px] text-success">In Stock</div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
});

/**
 * Apple-style Marketing Hero Section
 * 
 * Performance & Anti-Flicker Architecture:
 * 1. Decoupled Animation Hierarchy:
 *    - `previewEntranceRef`: Entrance timeline (opacity & initial rise)
 *    - `previewParallaxRef`: ScrollTrigger scrub parallax
 *    - `previewFloatRef`: Continuous smooth sine idle oscillation
 *    * Eliminates tween overwrite conflicts where multiple tweens mutated the same target property *
 * 2. Hardware Acceleration:
 *    - Forces GPU rasterization with `force3D: true`, `gpu-layer`, and `translateZ(0)`.
 * 3. Isolated Compositing:
 *    - Separated ambient radial glows and backdrop filters onto independent stacking contexts.
 */
export default function Hero() {
  const heroRef = useRef(null);
  const previewEntranceRef = useRef(null);
  const previewParallaxRef = useRef(null);
  const previewFloatRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. Hero text and controls entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-anim-text', {
          opacity: 0,
          y: 24,
          duration: 0.85,
          stagger: 0.12,
          force3D: true,
        });

        // Entrance for preview card on dedicated entrance wrapper
        if (previewEntranceRef.current) {
          tl.from(
            previewEntranceRef.current,
            {
              opacity: 0,
              y: 28,
              duration: 1.0,
              ease: 'power3.out',
              force3D: true,
            },
            '-=0.4'
          );
        }

        // 2. Gentle idle floating oscillation on dedicated inner float wrapper
        if (previewFloatRef.current) {
          gsap.to(previewFloatRef.current, {
            y: -8,
            duration: 6.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            force3D: true,
          });
        }

        // 3. Subtle scroll parallax shift on dedicated middle parallax wrapper
        if (previewParallaxRef.current && heroRef.current) {
          gsap.to(previewParallaxRef.current, {
            y: 45,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1.2,
            },
          });
        }
      });
    },
    { scope: heroRef, dependencies: [] }
  );

  return (
    <section
      ref={heroRef}
      className="relative w-full pt-16 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 overflow-hidden text-center blur-isolation"
    >
      {/* Background ambient radial glow - Isolated GPU layer */}
      <div
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/14 blur-[130px] rounded-full gpu-layer"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-36 left-1/3 -translate-x-1/2 w-[420px] h-[250px] bg-accent-to/10 blur-[100px] rounded-full gpu-layer"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* 1. Eyebrow Badge */}
        <div className="hero-anim-text flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-glass/[0.06] border border-glass-border/[0.12] backdrop-blur-xl text-xs font-medium text-muted hover:border-glass-border/[0.2] transition-colors gpu-layer">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-primary">ShopKart 2.0</span>
            <span className="text-muted/60">•</span>
            <span>Curated Workspace Hardware</span>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
        </div>

        {/* 2. Large Headline */}
        <h1 className="hero-anim-text text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05] text-primary max-w-4xl mx-auto">
          Precision tools for your modern desk.
        </h1>

        {/* 3. Subtext */}
        <p className="hero-anim-text text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed">
          Curated mechanical keyboards, 4K displays, and acoustic essentials engineered
          with high-grade materials and zero-flicker inventory sync.
        </p>

        {/* 4. Action CTAs */}
        <div className="hero-anim-text flex flex-wrap items-center justify-center gap-4 pt-2">
          <GlassButton
            as={Link}
            to="/register"
            variant="primary"
            size="lg"
            className="group shadow-[0_0_32px_rgba(var(--accent)/0.35)]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </GlassButton>

          <GlassButton
            as={Link}
            to="/login"
            variant="glass"
            size="lg"
          >
            Sign In to Account
          </GlassButton>
        </div>

        {/* 
          5. Decoupled Product Preview Card Architecture:
             Wrapper 1: Entrance Timeline (opacity / entry translate)
             Wrapper 2: ScrollTrigger Parallax (y shift with scrub)
             Wrapper 3: Idle Floating Oscillation (sine yoyo float)
             Wrapper 4: Memoized Dashboard Canvas with GPU layer promotion
        */}
        <div
          id="preview"
          ref={previewEntranceRef}
          className="pt-10 sm:pt-14 max-w-4xl mx-auto relative gpu-layer"
        >
          {/* Ambient Glow behind preview - Isolated background GPU layer */}
          <div
            className="pointer-events-none absolute -inset-3 bg-gradient-to-tr from-accent/20 via-accent-to/15 to-transparent blur-[70px] rounded-3xl -z-10 gpu-layer"
            aria-hidden="true"
          />

          {/* Parallax Container */}
          <div ref={previewParallaxRef} className="w-full gpu-layer">
            {/* Idle Float Container */}
            <div ref={previewFloatRef} className="w-full gpu-layer">
              <DashboardMockUI />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
