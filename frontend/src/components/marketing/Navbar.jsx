import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import GlassButton from '../ui/GlassButton';

/**
 * Sticky Marketing Navbar with scroll-triggered opacity shift
 * Apple-style minimalist frosted glass banner with brand logo and quick CTAs.
 */
export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-bg/75 backdrop-blur-xl border-b border-glass-border/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Mark */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-primary hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-glass/[0.08] border border-glass-border/[0.12] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-base tracking-tight text-primary">
            ShopKart
          </span>
        </Link>

        {/* Marketing Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-muted">
          <a
            href="#features"
            className="hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#preview"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </a>
          <Link
            to="/products"
            className="hover:text-primary transition-colors"
          >
            Catalog
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <GlassButton
            as={Link}
            to="/login"
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Sign In
          </GlassButton>
          <GlassButton
            as={Link}
            to="/register"
            variant="primary"
            size="sm"
            className="text-xs group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </GlassButton>
        </div>
      </div>
    </header>
  );
}
