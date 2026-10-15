import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

/**
 * Minimalist Apple-style Marketing Footer
 * Restrained typography, subtle border, quick links, and system status indicator.
 */
export default function MarketingFooter() {
  return (
    <footer className="w-full border-t border-glass-border/[0.08] bg-bg/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pb-10 border-b border-glass-border/[0.06]">
          {/* Logo & Tagline */}
          <div className="space-y-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary font-semibold text-base tracking-tight"
            >
              <div className="w-7 h-7 rounded-lg bg-glass/[0.08] border border-glass-border/[0.12] flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5 text-accent" />
              </div>
              <span>ShopKart</span>
            </Link>
            <p className="text-xs text-muted max-w-sm">
              Curated hardware and modern desk essentials engineered with architectural precision.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted">
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-primary transition-colors">
              Dashboard
            </a>
            <Link to="/products" className="hover:text-primary transition-colors">
              Catalog
            </Link>
            <Link to="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-primary transition-colors">
              Register
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">All systems operational • Lab 01–05 verified</span>
          </div>

          <p>© {new Date().getFullYear()} ShopKart Inc. Crafted with restrained motion and design tokens.</p>
        </div>
      </div>
    </footer>
  );
}
