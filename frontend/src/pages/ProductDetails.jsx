import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Check,
  Package,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  ArrowLeft,
  SearchX,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { fetchProductById, fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/shop/ProductCard';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';

const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Premium Apple-Grade Product Detail Page ("/products/:id")
 * 
 * Features:
 * - Clean Breadcrumb hierarchy (Shop / Category / Name)
 * - Two-column desktop layout with sticky image stage
 * - High-contrast product title, INR price, stock dot indicator
 * - Quantity stepper clamped to available inventory
 * - Primary full-width Add to Cart pill with quantity feedback & secondary Wishlist toggle
 * - Verified slim trust badges
 * - "You might also like" 4-product recommendation row
 * - Mobile-first sticky bottom checkout action bar
 * - Restrained GSAP entrance motion with reduced-motion support
 */
export default function ProductDetails() {
  const { id } = useParams();
  const containerRef = useRef(null);
  const imageStageRef = useRef(null);
  const infoColRef = useRef(null);
  const mainBtnRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  // Central Wishlist context (Single Source of Truth)
  const { ids, toggle } = useWishlist();

  // Cart operations & feedback
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Mobile sticky bottom bar visibility (shows when main button scrolls out of view)
  const [showStickyBar, setShowStickyBar] = useState(false);

  // 1. Fetch Product
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setQuantity(1);
        setImgError(false);

        // Fetch target product
        const data = await fetchProductById(id);
        if (!isMounted) return;

        const prod = data.product;
        setProduct(prod);

        // Fetch related products from the same category
        if (prod.category) {
          fetchProducts({ category: prod.category })
            .then((catData) => {
              if (isMounted && catData?.products) {
                const filtered = catData.products
                  .filter((p) => p._id !== prod._id)
                  .slice(0, 4);
                setRelatedProducts(filtered);
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Product not found.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Intersection Observer for Mobile Sticky Bottom Bar
  useEffect(() => {
    if (!mainBtnRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main button is not intersecting (scrolled away), show bottom bar
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(mainBtnRef.current);
    return () => observer.disconnect();
  }, [loading, product]);

  const cartItem = useMemo(() => {
    if (!product?._id) return null;
    return cartItems?.find(
      (item) => (item.product?._id || item.product) === product._id
    );
  }, [cartItems, product]);

  const isWishlisted = Boolean(product?._id && ids.has(product._id));
  const isOutOfStock = (product?.stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && product?.stock !== undefined && product.stock <= 5;
  const maxAvailable = product?.stock || 1;

  const handleQuantityMinus = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleQuantityPlus = () => {
    setQuantity((prev) => Math.min(maxAvailable, prev + 1));
  };

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock || !product?._id) return;

    try {
      setIsAdding(true);
      // Add according to chosen quantity
      for (let i = 0; i < quantity; i++) {
        await addToCart(product._id);
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2200);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!product?._id) return;
    toggle(product);
  };

  // 3. GSAP Animations: Image Stage Scale-in & Info Column Stagger
  useGSAP(
    () => {
      if (loading || !product) return;
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (imageStageRef.current) {
          gsap.fromTo(
            imageStageRef.current,
            { opacity: 0, scale: 0.96 },
            { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
          );
        }

        if (infoColRef.current) {
          gsap.fromTo(
            infoColRef.current.children,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
          );
        }
      });

      return () => mm.revert();
    },
    { dependencies: [loading, product], scope: containerRef }
  );

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse text-primary">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-glass/[0.04] rounded-md w-48" />

        {/* Two-Column Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="md:col-span-6 lg:col-span-7 aspect-[4/5] rounded-3xl bg-glass/[0.03] border border-glass-border/[0.06]" />
          <div className="md:col-span-6 lg:col-span-5 space-y-6 pt-2">
            <div className="h-3.5 bg-glass/[0.05] rounded-full w-24" />
            <div className="h-10 bg-glass/[0.07] rounded-xl w-3/4" />
            <div className="h-8 bg-glass/[0.08] rounded-xl w-1/3" />
            <div className="space-y-2 pt-4">
              <div className="h-3.5 bg-glass/[0.04] rounded-md w-full" />
              <div className="h-3.5 bg-glass/[0.04] rounded-md w-5/6" />
              <div className="h-3.5 bg-glass/[0.04] rounded-md w-4/6" />
            </div>
            <div className="h-12 bg-glass/[0.06] rounded-full w-full pt-4" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Product Not Found State
  if (error || !product) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center">
        <GlassCard padding="lg" className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-glass/[0.05] border border-glass-border/[0.08] flex items-center justify-center mx-auto text-muted">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Product Not Found</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {error || 'The product you are looking for does not exist or has been retired.'}
            </p>
          </div>
          <GlassButton
            as={Link}
            to="/products"
            variant="primary"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5 ml-1" />}
            className="mx-auto"
          >
            Back to Shop
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-12 sm:space-y-16 text-primary"
    >
      {/* BREADCRUMB NAVIGATION */}
      <nav aria-label="Breadcrumb" className="text-left select-none">
        <ol className="flex items-center gap-2 text-xs text-muted">
          <li>
            <Link to="/products" className="hover:text-primary transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true" className="text-glass-border/[0.3]">
            /
          </li>
          <li>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-primary transition-colors"
            >
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true" className="text-glass-border/[0.3]">
            /
          </li>
          <li className="text-secondary truncate max-w-xs font-medium" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* TWO-COLUMN SHOWCASE (Desktop: Left Sticky Stage, Right Scrolling Info) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* LEFT COLUMN: Large Sticky Image Stage (Aspect 4/5, Unified Tone) */}
        <div className="md:col-span-6 lg:col-span-7 md:sticky md:top-28 self-start">
          <div
            ref={imageStageRef}
            className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-glass/[0.03] border border-glass-border/[0.08] shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] select-none flex items-center justify-center"
          >
            {/* Soft Ambient Radial Glow Behind Stage */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-radial from-accent/15 via-transparent to-transparent opacity-50"
              aria-hidden="true"
            />

            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={product.name}
                loading="eager"
                decoding="async"
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover object-center ${
                  isOutOfStock ? 'opacity-40 grayscale-[70%]' : 'opacity-95 contrast-[1.02] saturate-[1.03]'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-glass/[0.08] to-transparent p-8 text-center">
                <Package className="w-16 h-16 text-muted/40 mb-3" />
                <span className="text-sm text-muted font-medium">
                  {product.category || 'Curated Gear'}
                </span>
              </div>
            )}

            {/* Subtle Tone Vignette Overlay */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-black/10 opacity-60"
              aria-hidden="true"
            />

            {/* Out of Stock Overlay Badge */}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-bg/90 backdrop-blur-xl border border-danger/40 text-xs font-semibold text-danger uppercase tracking-wider">
                Sold Out
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Information & Purchase Controls */}
        <div
          ref={infoColRef}
          className="md:col-span-6 lg:col-span-5 text-left space-y-7 pt-1"
        >
          {/* Category Tag & Name */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent select-none">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary leading-[1.12]">
              {product.name}
            </h1>
          </div>

          {/* Pricing & Stock Status Dot */}
          <div className="flex items-baseline justify-between gap-4 pb-6 border-b border-glass-border/[0.08]">
            <span className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
              {formatPrice(product.price)}
            </span>

            {/* Stock Dot Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOutOfStock
                    ? 'bg-danger'
                    : isLowStock
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
                aria-hidden="true"
              />
              <span
                className={
                  isOutOfStock
                    ? 'text-danger'
                    : isLowStock
                    ? 'text-amber-400'
                    : 'text-muted'
                }
              >
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : isLowStock
                  ? `Only ${product.stock} units left`
                  : 'In Stock & Ready to Ship'}
              </span>
            </div>
          </div>

          {/* Real Description Only */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
                Overview
              </h2>
              <p className="text-sm sm:text-base text-secondary/90 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity Stepper & Main Add to Cart Row */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">Select Quantity</span>
                <div className="inline-flex items-center rounded-full bg-glass/[0.05] border border-glass-border/[0.1] p-1">
                  <button
                    type="button"
                    onClick={handleQuantityMinus}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-glass/[0.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-primary select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuantityPlus}
                    disabled={quantity >= maxAvailable}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-glass/[0.08] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Full-width Pill Add to Cart + Wishlist Icon Button */}
              <div ref={mainBtnRef} className="flex items-center gap-3">
                <GlassButton
                  variant={justAdded ? 'primary' : 'primary'}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  isLoading={isAdding}
                  aria-label={
                    justAdded
                      ? 'Added to cart'
                      : cartItem
                      ? `In cart (${cartItem.quantity}), click to add more`
                      : 'Add product to cart'
                  }
                  icon={
                    justAdded ? (
                      <Check className="w-4 h-4 text-bg stroke-[2.5]" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 text-bg" />
                    )
                  }
                  className="flex-1 py-3.5 text-sm font-semibold active:scale-[0.98] shadow-lg transition-transform"
                >
                  {justAdded
                    ? 'Added to Cart'
                    : cartItem
                    ? `In Cart (${cartItem.quantity}) • Add ${quantity}`
                    : `Add ${quantity > 1 ? `${quantity} to Cart` : 'to Cart'}`}
                </GlassButton>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label={
                    isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
                  }
                  className={`w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isWishlisted
                      ? 'bg-danger/20 border-danger/40 text-danger scale-100 shadow-danger/20'
                      : 'bg-glass/[0.06] hover:bg-glass/[0.12] border-glass-border/[0.12] text-muted hover:text-danger hover:border-danger/30'
                  } active:scale-90`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isWishlisted ? 'fill-current scale-110' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Out of Stock Callout */}
          {isOutOfStock && (
            <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-xs text-danger space-y-1">
              <span className="font-semibold block">Currently Unavailable</span>
              <span>This product is out of stock. Please check back later.</span>
            </div>
          )}

          {/* Slim Row of Verified Trust Items */}
          <div className="pt-6 border-t border-glass-border/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span className="text-secondary font-medium">Fast Nationwide</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span className="text-secondary font-medium">7-Day Easy Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
              <span className="text-secondary font-medium">100% Genuine</span>
            </div>
          </div>
        </div>
      </div>

      {/* "YOU MIGHT ALSO LIKE" (4 Products from Same Category) */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-heading" className="pt-12 border-t border-glass-border/[0.08]">
          <div className="flex items-end justify-between mb-8 text-left">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Curated Suggestions
              </span>
              <h2
                id="related-heading"
                className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary mt-1"
              >
                You Might Also Like
              </h2>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs text-muted hover:text-primary transition-colors font-medium"
            >
              See all {product.category} →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* MOBILE STICKY BOTTOM ACTION BAR (Appears when main button scrolls out of view) */}
      <div
        className={`sm:hidden fixed bottom-0 inset-x-0 z-50 p-4 bg-bg/90 backdrop-blur-2xl border-t border-glass-border/[0.12] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          showStickyBar && !isOutOfStock ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-muted truncate max-w-[150px]">
              {product.name}
            </span>
            <span className="text-base font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            isLoading={isAdding}
            icon={justAdded ? <Check className="w-4 h-4 text-bg" /> : <ShoppingCart className="w-4 h-4 text-bg" />}
            className="flex-1 text-xs font-semibold"
          >
            {justAdded ? 'Added' : cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
