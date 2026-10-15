import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import FilterBar from '../components/shop/FilterBar';
import ProductCard from '../components/shop/ProductCard';
import { fetchProducts } from '../services/api';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Books'];

/**
 * Premium Apple-Grade Products Listing Page ("/products")
 * 
 * Design Architecture:
 * - Minimal, spacious, product-first layout
 * - Apple-style headline with live polite product count
 * - Sticky glass filter bar with segmented category pills & custom sort dropdown
 * - Borderless 4/5 product cards with cursor-following soft radial light
 * - GSAP mount animations, ScrollTrigger grid reveal, and instant filter crossfading
 * - Automatic filter URL synchronization & scroll position preservation
 */
export default function Products() {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Preserve & Restore Scroll Position when navigating to/from product details
  useEffect(() => {
    const savedPos = sessionStorage.getItem('shopkart_products_scroll');
    if (savedPos && !loading && products.length > 0) {
      window.scrollTo(0, parseInt(savedPos, 10));
      sessionStorage.removeItem('shopkart_products_scroll');
    }
  }, [loading, products.length]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('shopkart_products_scroll', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update URL Search Parameters
  const handleSearchChange = (newSearch) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSearch) next.set('q', newSearch);
      else next.delete('q');
      return next;
    });
  };

  const handleCategoryChange = (newCat) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newCat && newCat !== 'All') next.set('category', newCat);
      else next.delete('category');
      return next;
    });
  };

  const handleSortChange = (newSort) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSort) next.set('sort', newSort);
      else next.delete('sort');
      return next;
    });
  };

  const handleClearAll = () => {
    setSearchParams({});
  };

  // Fetch products on query state changes
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchProducts({
          search,
          category,
          sort,
        });

        if (isMounted) {
          const list = data.products || [];
          setProducts(list);

          // Dynamically augment categories if new ones appear
          if (list.length > 0) {
            const catSet = new Set(DEFAULT_CATEGORIES);
            list.forEach((p) => {
              if (p.category) catSet.add(p.category);
            });
            setAllCategories(Array.from(catSet));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Something went wrong while loading products.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [search, category, sort, reloadTrigger]);

  // Derived live count text
  const liveCountText = useMemo(() => {
    if (loading) return 'Loading catalog...';
    if (products.length === 0) return '0 products';
    return `${products.length} ${products.length === 1 ? 'product' : 'products'}`;
  }, [loading, products.length]);

  // GSAP Animations (Header mount + ScrollTrigger grid reveals + Filter transitions)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 1. Header fade + rise on mount
        if (headerRef.current) {
          gsap.fromTo(
            headerRef.current.children,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
            }
          );
        }

        // 2. Filter bar reveal
        const filterBar = containerRef.current?.querySelector('[data-filter-bar]');
        if (filterBar) {
          gsap.fromTo(
            filterBar,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: 'power3.out' }
          );
        }

        // 3. Product grid reveal with ScrollTrigger
        if (gridRef.current && !loading && products.length > 0) {
          const cards = gridRef.current.querySelectorAll('[data-product-card]');
          if (cards.length) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 24 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: gridRef.current,
                  start: 'top 92%',
                  once: true,
                },
              }
            );
          }
          ScrollTrigger.refresh();
        }
      });

      return () => mm.revert();
    },
    { dependencies: [loading, products.length, search, category, sort], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 text-primary"
    >
      {/* HEADER SECTION (Apple-Style Title & Muted Second Phrase) */}
      <header
        ref={headerRef}
        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 text-left pt-2 pb-2"
      >
        <div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-primary leading-tight">
            Shop.{' '}
            <span className="text-muted font-normal">
              Curated gear for your space.
            </span>
          </h1>
        </div>

        {/* Live Product Counter (Announced via aria-live) */}
        <div className="shrink-0">
          <span
            aria-live="polite"
            className="text-xs sm:text-sm text-muted font-medium select-none"
          >
            {liveCountText}
          </span>
        </div>
      </header>

      {/* STICKY FILTER BAR */}
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        sort={sort}
        onSortChange={handleSortChange}
        categories={allCategories}
        onClearAll={handleClearAll}
      />

      {/* 1. LOADING SKELETON STATE (Fixed 4/5 Aspect Ratio, Zero Layout Shift) */}
      {loading && (
        <div
          role="status"
          aria-label="Loading products"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="p-3 sm:p-4 rounded-3xl space-y-4 animate-pulse">
              {/* Image Stage Placeholder (4/5 Aspect Ratio) */}
              <div className="w-full aspect-[4/5] rounded-2xl sm:rounded-3xl bg-glass/[0.04] border border-glass-border/[0.05]" />
              {/* Typography Placeholders */}
              <div className="space-y-2 pt-1">
                <div className="h-2.5 bg-glass/[0.05] rounded-full w-1/4" />
                <div className="h-4 bg-glass/[0.08] rounded-md w-4/5" />
                <div className="h-3.5 bg-glass/[0.05] rounded-md w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 bg-glass/[0.08] rounded-md w-1/3" />
                  <div className="h-3 bg-glass/[0.04] rounded-full w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. ERROR STATE (Friendly Glass Card with Retry) */}
      {!loading && error && (
        <div className="w-full max-w-md mx-auto py-16 text-center">
          <GlassCard padding="lg" className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary">
                Unable to Load Catalog
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">{error}</p>
            </div>
            <GlassButton
              variant="glass"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setReloadTrigger((prev) => prev + 1)}
              className="mx-auto"
            >
              Retry
            </GlassButton>
          </GlassCard>
        </div>
      )}

      {/* 3. EMPTY STATE (Friendly Glass Message + Clear Filters) */}
      {!loading && !error && products.length === 0 && (
        <div className="w-full max-w-lg mx-auto py-20 text-center">
          <GlassCard padding="lg" className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-glass/[0.05] border border-glass-border/[0.08] flex items-center justify-center mx-auto text-muted">
              <SearchX className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-primary">
                {search ? `No matches for \u201C${search}\u201D` : 'No products found'}
              </h2>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                {category !== 'All'
                  ? `There are no products in the \u201C${category}\u201D collection matching your criteria.`
                  : 'Try adjusting your search terms or clearing the current filters.'}
              </p>
            </div>
            <div className="pt-2">
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleClearAll}
                className="mx-auto"
              >
                Clear all filters
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 4. PRODUCT GRID (2 cols mobile, 3 tablet, 4 desktop, gap-x-6 gap-y-14) */}
      {!loading && !error && products.length > 0 && (
        <main
          ref={gridRef}
          aria-label="Products catalog grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14"
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </main>
      )}
    </div>
  );
}
