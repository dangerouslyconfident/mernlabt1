import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Sparkles,
  Laptop,
  Shirt,
  Home as HomeIcon,
  BookOpen,
  Layers,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

gsap.registerPlugin(ScrollTrigger);

// Category visual icon mappings
const CATEGORY_ICONS = {
  Electronics: Laptop,
  Fashion: Shirt,
  Home: HomeIcon,
  Books: BookOpen,
};

function getCategoryIcon(catName) {
  return CATEGORY_ICONS[catName] || Layers;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(customer) {
  if (customer?.fullName && customer.fullName.trim()) {
    return customer.fullName.trim().split(/\s+/)[0];
  }
  if (customer?.email && customer.email.includes('@')) {
    return customer.email.split('@')[0];
  }
  return '';
}

/**
 * Modernized ShopKart Home Experience
 * Designed with Apple Store clarity, Amazon utility, and high-performance glassmorphism.
 */
export default function Home() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const customer = outletCtx?.customer;

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = useMemo(() => getFirstName(customer), [customer]);
  const greeting = useMemo(() => {
    const timeGreeting = getGreeting();
    return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  }, [firstName]);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load products. Please check your connection.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    init();

    return () => {
      isMounted = false;
    };
  }, [reloadTrigger]);

  // Derived real categories from products
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Curated product slices
  const bentoProducts = useMemo(() => {
    if (!products.length) return [];
    // Prioritize high-value or flagship items for bento
    return [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3);
  }, [products]);

  const newArrivals = useMemo(() => {
    if (!products.length) return [];
    return [...products]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [products]);

  const popularProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products].slice(0, 8);
  }, [products]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/products');
    }
  };

  // GSAP Animations with matchMedia (respects prefers-reduced-motion)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. Hero on mount animation
        if (heroRef.current) {
          const heroElements = heroRef.current.querySelectorAll('[data-hero-anim]');
          if (heroElements.length) {
            gsap.fromTo(
              heroElements,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
              }
            );
          }
        }

        // 2. ScrollTrigger reveals for sections (runs once data has rendered)
        if (!loading && containerRef.current) {
          const sections = containerRef.current.querySelectorAll('[data-reveal-section]');
          sections.forEach((sec) => {
            const cards = sec.querySelectorAll('[data-product-card], [data-bento-tile], [data-cat-tile]');
            if (cards.length) {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 24 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: sec,
                    start: 'top 85%',
                    once: true,
                  },
                }
              );
            }
          });

          // Refresh ScrollTrigger calculations after async render
          ScrollTrigger.refresh();
        }
      });

      return () => mm.revert();
    },
    { dependencies: [loading, products.length], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-16 md:space-y-24 text-primary"
    >
      {/* SECTION 1: HERO + SEARCH */}
      <section
        ref={heroRef}
        aria-labelledby="hero-heading"
        className="relative pt-6 sm:pt-12 pb-6 flex flex-col items-center text-center overflow-hidden"
      >
        {/* Soft Accent Radial Glow (Very Low Opacity) */}
        <div
          className="pointer-events-none absolute inset-0 -top-20 flex items-center justify-center -z-10"
          aria-hidden="true"
        >
          <div className="w-[500px] h-[350px] sm:w-[700px] sm:h-[450px] bg-accent/10 rounded-full blur-[100px] animate-pulse duration-1000" />
        </div>

        {/* Small Greeting Line */}
        <div
          data-hero-anim
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-glass/[0.05] border border-glass-border/[0.08] text-xs font-medium text-muted mb-4 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>{greeting}</span>
        </div>

        {/* Big Headline */}
        <h1
          id="hero-heading"
          data-hero-anim
          className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-primary max-w-3xl leading-[1.08] mb-6"
        >
          What are you looking for today?
        </h1>

        {/* Customer Profile Card (Lab 02: Welcome message, Customer name, Email, Phone number) */}
        {customer && (
          <div
            data-hero-anim
            className="mb-8 p-4 sm:p-5 rounded-2xl bg-glass/[0.04] border border-glass-border/[0.1] backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 text-left max-w-2xl w-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center font-bold text-base shadow-sm">
                {(customer.fullName || 'User').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-primary">
                    {customer.fullName || 'Valued Member'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                    Verified Customer
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted mt-0.5">
                  <span>{customer.email}</span>
                  {customer.phone && (
                    <>
                      <span>•</span>
                      <span>Phone: {customer.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/wishlist"
              className="text-xs text-accent hover:underline font-medium flex items-center gap-1"
            >
              <span>My Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Large Pill-Shaped Glass Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          data-hero-anim
          className="w-full max-w-2xl relative mb-6"
        >
          <div className="relative flex items-center rounded-full bg-glass/[0.06] hover:bg-glass/[0.09] focus-within:bg-glass/[0.1] border border-glass-border/[0.14] focus-within:border-accent/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl transition-all duration-300 px-3 py-1.5 sm:py-2">
            <Search className="w-5 h-5 text-muted ml-3 shrink-0" aria-hidden="true" />
            <input
              type="text"
              id="hero-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mechanical keyboards, 4K displays, audio gear..."
              aria-label="Search catalog items"
              className="w-full bg-transparent px-3.5 py-2 text-sm sm:text-base text-primary placeholder-muted/70 focus:outline-none"
            />
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              aria-label="Submit search"
              className="shrink-0 font-medium px-5"
            >
              Search
            </GlassButton>
          </div>
        </form>

        {/* Category Chips that wrap onto multiple lines */}
        {categories.length > 0 && (
          <div
            data-hero-anim
            className="flex flex-wrap items-center justify-center gap-2 max-w-2xl"
          >
            <span className="text-xs text-muted mr-1">Trending:</span>
            <Link
              to="/products"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-glass/[0.04] hover:bg-glass/[0.1] text-secondary hover:text-primary border border-glass-border/[0.08] hover:border-glass-border/[0.18] transition-all duration-200"
            >
              All Items
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-glass/[0.04] hover:bg-glass/[0.1] text-secondary hover:text-primary border border-glass-border/[0.08] hover:border-glass-border/[0.18] transition-all duration-200"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ERROR STATE */}
      {error && !loading && (
        <section className="w-full max-w-md mx-auto py-8">
          <GlassCard padding="lg" className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary">Connection Issue</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{error}</p>
            </div>
            <GlassButton
              onClick={() => setReloadTrigger((prev) => prev + 1)}
              variant="glass"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="mx-auto"
            >
              Retry
            </GlassButton>
          </GlassCard>
        </section>
      )}

      {/* LOADING SKELETON STATE (Subtle glass shimmer, zero layout shift) */}
      {loading && (
        <div className="space-y-16 md:space-y-24 animate-pulse">
          {/* Skeleton Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-96 rounded-3xl bg-glass/[0.03] border border-glass-border/[0.06]" />
            <div className="space-y-6 flex flex-col justify-between">
              <div className="h-44 rounded-3xl bg-glass/[0.03] border border-glass-border/[0.06]" />
              <div className="h-44 rounded-3xl bg-glass/[0.03] border border-glass-border/[0.06]" />
            </div>
          </div>

          {/* Skeleton Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl bg-glass/[0.03] border border-glass-border/[0.06]"
              />
            ))}
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 rounded-3xl bg-glass/[0.03] border border-glass-border/[0.06]"
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: FEATURED BENTO (Asymmetric Grid of 3 Glass Tiles) */}
      {!loading && !error && bentoProducts.length >= 3 && (
        <section data-reveal-section aria-labelledby="featured-heading">
          <div className="flex items-end justify-between mb-6 text-left">
            <div>
              <span className="text-xs font-medium text-accent tracking-wider uppercase">
                Spotlight Collection
              </span>
              <h2
                id="featured-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1"
              >
                Featured Essentials
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-medium group"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Tile 1: Large Showcase Tile (Spans 2 columns on desktop) */}
            <Link
              to={`/products/${bentoProducts[0]._id}`}
              data-bento-tile
              aria-label={`View featured product ${bentoProducts[0].name}`}
              className="group relative md:col-span-2 min-h-[380px] sm:min-h-[440px] rounded-3xl bg-glass/[0.03] hover:bg-glass/[0.06] border border-glass-border/[0.08] hover:border-glass-border/[0.2] backdrop-blur-2xl p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {/* Product Background Image with Smooth Subtle Scale Hover */}
              <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl select-none">
                {bentoProducts[0].image ? (
                  <img
                    src={bentoProducts[0].image}
                    alt={bentoProducts[0].name}
                    loading="lazy"
                    className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.04] transition-transform duration-700 ease-out opacity-45"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-glass/[0.08] to-transparent" />
                )}
                {/* Dark Vignette Overlay for Crisp High-Contrast Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent opacity-95" />
              </div>

              {/* Top Tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg/80 backdrop-blur-md border border-glass-border/[0.12] text-xs font-medium text-accent">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Flagship Gear</span>
                </span>
                <span className="text-xs text-muted backdrop-blur-md bg-bg/60 px-2.5 py-1 rounded-full border border-glass-border/[0.08]">
                  {bentoProducts[0].category}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="space-y-3 max-w-lg mt-auto pt-8">
                <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight text-primary leading-tight">
                  {bentoProducts[0].name}
                </h3>
                <p className="text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
                  {bentoProducts[0].description}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(bentoProducts[0].price).toLocaleString('en-IN')}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-bg font-semibold text-xs group-hover:opacity-95 transition-opacity shadow-lg">
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Right Column: 2 Smaller Bento Tiles */}
            <div className="grid grid-cols-1 gap-6">
              {[bentoProducts[1], bentoProducts[2]].map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item._id}`}
                  data-bento-tile
                  aria-label={`View product ${item.name}`}
                  className="group relative min-h-[190px] rounded-3xl bg-glass/[0.03] hover:bg-glass/[0.06] border border-glass-border/[0.08] hover:border-glass-border/[0.2] backdrop-blur-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* Subtle Product Image Background */}
                  <div className="absolute inset-0 -z-10 overflow-hidden select-none">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.04] transition-transform duration-700 ease-out opacity-35"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-glass/[0.05] to-transparent" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-transparent" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-xs text-primary font-semibold">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <h4 className="text-base font-medium text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                      {item.name}
                    </h4>
                    <span className="w-8 h-8 rounded-full bg-glass/[0.08] group-hover:bg-primary group-hover:text-bg border border-glass-border/[0.1] flex items-center justify-center text-xs shrink-0 transition-all duration-200">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: SHOP BY CATEGORY */}
      {!loading && !error && categories.length > 0 && (
        <section data-reveal-section aria-labelledby="categories-heading">
          <div className="text-left mb-6">
            <span className="text-xs font-medium text-accent tracking-wider uppercase">
              Curated Collections
            </span>
            <h2
              id="categories-heading"
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1"
            >
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const IconComp = getCategoryIcon(cat);
              const count = products.filter((p) => p.category === cat).length;

              return (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  data-cat-tile
                  aria-label={`Browse ${cat} category with ${count} items`}
                  className="group relative rounded-2xl bg-glass/[0.03] hover:bg-glass/[0.07] border border-glass-border/[0.08] hover:border-glass-border/[0.2] backdrop-blur-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.25)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="w-10 h-10 rounded-xl bg-glass/[0.06] group-hover:bg-accent/20 border border-glass-border/[0.1] group-hover:border-accent/30 flex items-center justify-center text-accent transition-colors mb-3">
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-primary group-hover:text-accent transition-colors">
                      {cat}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {count} {count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 4: PRODUCT ROWS ("New Arrivals" & "Popular Gear") */}
      {!loading && !error && products.length > 0 && (
        <section data-reveal-section aria-labelledby="new-arrivals-heading" className="space-y-12">
          {/* Row 1: New Arrivals */}
          <div>
            <div className="flex items-end justify-between mb-6 text-left">
              <div>
                <span className="text-xs font-medium text-accent tracking-wider uppercase">
                  Fresh Inventory
                </span>
                <h2
                  id="new-arrivals-heading"
                  className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1"
                >
                  New Arrivals
                </h2>
              </div>
              <Link
                to="/products?sort=newest"
                className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-medium group"
              >
                <span>See all</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Row 2: Popular Gear */}
          {popularProducts.length > 4 && (
            <div>
              <div className="flex items-end justify-between mb-6 text-left">
                <div>
                  <span className="text-xs font-medium text-accent tracking-wider uppercase">
                    Customer Favorites
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1">
                    Popular in Store
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-medium group"
                >
                  <span>See all</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularProducts.slice(4, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 5: SLIM TRUST STRIP */}
      <section
        aria-label="ShopKart guarantees"
        className="w-full py-4 border-y border-glass-border/[0.08] backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-6 text-xs text-muted">
          <div className="inline-flex items-center gap-2">
            <Truck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <span className="text-secondary font-medium">Fast Nationwide Delivery</span>
          </div>

          <span className="hidden sm:inline text-glass-border/[0.2]">•</span>

          <div className="inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <span className="text-secondary font-medium">7-Day Easy Returns</span>
          </div>

          <span className="hidden sm:inline text-glass-border/[0.2]">•</span>

          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
            <span className="text-secondary font-medium">100% Verified Hardware</span>
          </div>
        </div>
      </section>
    </div>
  );
}
