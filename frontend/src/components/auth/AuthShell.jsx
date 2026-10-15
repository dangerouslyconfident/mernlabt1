import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import GlassCard from '../ui/GlassCard';

/**
 * Centered Auth Shell Layout for Login and Register pages
 * Incorporates subtle Apple-style radial ambient glows, top brand mark linking to "/",
 * centered GlassCard, and GSAP mount animation.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form and page content
 * @param {string} [props.title] - Heading text
 * @param {string} [props.subtitle] - Subtext
 * @param {string} [props.badgeText] - Pill badge text
 */
export default function AuthShell({
  children,
  title,
  subtitle,
  badgeText = 'ShopKart • Secure Auth',
}) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(cardRef.current, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: 'power3.out',
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative flex flex-col justify-center items-center px-4 py-12 overflow-hidden bg-bg"
    >
      {/* Subtle Apple-style radial glow behind auth card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-accent/12 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-accent-to/10 blur-[100px]"
        aria-hidden="true"
      />

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand link to home */}
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 mb-8 text-primary hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-2xl bg-glass/[0.08] border border-glass-border/[0.15] backdrop-blur-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-accent" />
          </div>
          <span className="font-semibold text-lg tracking-tight">ShopKart</span>
        </Link>

        {/* Centered GlassCard */}
        <div ref={cardRef} className="w-full">
          <GlassCard variant="elevated" padding="lg" className="w-full text-left">
            {(badgeText || title || subtitle) && (
              <div className="text-center space-y-2 mb-6">
                {badgeText && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass/[0.06] border border-glass-border/[0.08] text-[11px] text-muted font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{badgeText}</span>
                  </div>
                )}
                {title && (
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
