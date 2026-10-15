import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Package } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Apple-Grade Borderless Stage ProductCard
 * 
 * Variants:
 * - 'catalog' (default): Quick-add pill slides up on hover from bottom of image stage
 * - 'wishlist': Filled heart to remove, full-width "Move to Cart" button below metadata
 * 
 * Features:
 * - Transparent & borderless at rest: image stage (4/5 aspect ratio) + metadata below
 * - Soft cursor-following radial light on desktop pointer devices (gsap.quickTo)
 * - Category text above product name
 * - Formatted INR price close to name with no awkward spacing
 * - Status dot for stock (In stock / Low stock / Out of stock)
 * - Synchronized with WishlistContext & CartContext (zero duplicate local state)
 * - Entire card acts as semantic link to /products/:id
 */
export default function ProductCard({
  product,
  variant = 'catalog',
  className = '',
  onRemove,
  onMoveToCart,
}) {
  const cardRef = useRef(null);
  const heartIconRef = useRef(null);
  const xTo = useRef(null);
  const yTo = useRef(null);

  const [imgError, setImgError] = useState(false);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Single source of truth for Wishlist and Cart
  const { ids, toggle, remove, restore, showToast } = useWishlist();
  const { addToCart, removeFromCart, cartItems } = useCart();

  const isWishlisted = Boolean(product?._id && ids.has(product._id));
  const cartItem = cartItems?.find(
    (item) => (item.product?._id || item.product) === product?._id
  );
  const isOutOfStock = (product?.stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && product?.stock !== undefined && product.stock <= 5;

  // Signature Cursor-Following Soft Light (desktop pointer only, respects reduced-motion)
  useGSAP(
    () => {
      if (!cardRef.current) return;
      const mm = gsap.matchMedia();

      mm.add(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          xTo.current = gsap.quickTo(cardRef.current, '--mx', {
            duration: 0.35,
            ease: 'power2.out',
          });
          yTo.current = gsap.quickTo(cardRef.current, '--my', {
            duration: 0.35,
            ease: 'power2.out',
          });
        }
      );

      return () => mm.revert();
    },
    { scope: cardRef }
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current || !xTo.current || !yTo.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    xTo.current(e.clientX - rect.left);
    yTo.current(e.clientY - rect.top);
  };

  const animateOut = (callback) => {
    if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      callback();
      return;
    }
    gsap.to(cardRef.current, {
      scale: 0.96,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: callback,
    });
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product?._id) return;

    if (heartIconRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(
        heartIconRef.current,
        { scale: 0.8 },
        { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }

    if (variant === 'wishlist') {
      if (onRemove) {
        onRemove(product);
      } else {
        animateOut(() => remove(product._id));
      }
    } else {
      toggle(product);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingCart || isOutOfStock || !product?._id) return;

    try {
      setIsAddingCart(true);
      await addToCart(product._id);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAddingCart(false);
    }
  };

  const handleMoveToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMoving || isOutOfStock || !product?._id) return;

    if (onMoveToCart) {
      onMoveToCart(product);
      return;
    }

    setIsMoving(true);
    animateOut(async () => {
      try {
        await addToCart(product._id);
        await remove(product._id, { showUndoToast: false });
        showToast(`Moved "${product.name}" to cart`, () => {
          restore(product);
          removeFromCart(product._id);
        });
      } catch (err) {
        console.error('Failed to move to cart:', err);
        if (cardRef.current) {
          gsap.to(cardRef.current, { scale: 1, opacity: 1, duration: 0.2 });
        }
      } finally {
        setIsMoving(false);
      }
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      data-product-card
      style={{ '--mx': '50%', '--my': '50%' }}
      className={`group relative rounded-3xl p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 text-left bg-transparent hover:bg-glass/[0.04] border border-transparent hover:border-glass-border/[0.14] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Signature Cursor Light: radial accent glow follows pointer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 bg-[radial-gradient(320px_circle_at_var(--mx)_var(--my),_rgba(99,102,241,0.18),_transparent_75%)]"
        aria-hidden="true"
      />

      {/* Whole Card Link */}
      <Link
        to={`/products/${product?._id}`}
        aria-label={`View ${product?.name || 'product details'}`}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="sr-only">View {product?.name}</span>
      </Link>

      {/* 1. IMAGE STAGE (Fixed 4/5 Aspect Ratio) */}
      <div className="relative w-full aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden bg-glass/[0.03] select-none">
        {/* Soft Radial Backlight behind the Stage */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-radial from-accent/10 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden="true"
        />

        {product?.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name || 'Product photo'}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-[1.05] ${
              isOutOfStock ? 'opacity-40 grayscale-[70%]' : 'opacity-95 contrast-[1.02] saturate-[1.04]'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-glass/[0.06] to-transparent p-4 text-center">
            <Package className="w-10 h-10 text-muted/50 mb-2" />
            <span className="text-xs text-muted font-medium">
              {product?.category || 'Curated Gear'}
            </span>
          </div>
        )}

        {/* Cohesive Tone Overlay (Soft vignette + contrast normalization) */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-black/10 opacity-70"
          aria-hidden="true"
        />

        {/* Top Status Badge (Only for status: Out of stock / Low stock) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full bg-bg/85 backdrop-blur-md border border-danger/30 text-[10px] font-semibold text-danger uppercase tracking-wider">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full bg-bg/85 backdrop-blur-md border border-amber-500/30 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button (Top-Right Glass Circle) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={
            isWishlisted
              ? `Remove ${product?.name || 'item'} from wishlist`
              : `Add ${product?.name || 'item'} to wishlist`
          }
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-200 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isWishlisted
              ? 'opacity-100 bg-danger/20 border-danger/40 text-danger scale-100'
              : 'opacity-90 sm:opacity-0 group-hover:opacity-100 bg-bg/75 border-glass-border/[0.12] text-muted hover:text-danger hover:border-danger/30 hover:scale-105'
          } active:scale-90`}
        >
          <span ref={heartIconRef} className="inline-flex items-center justify-center">
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isWishlisted ? 'fill-current scale-110' : ''
              }`}
            />
          </span>
        </button>

        {/* Catalog Variant Quick-Add Pill (Slides up from bottom of image on hover, always on touch) */}
        {variant === 'catalog' && !isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 z-20 transition-all duration-300 transform sm:translate-y-3 sm:opacity-0 sm:pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto max-sm:translate-y-0 max-sm:opacity-100 max-sm:pointer-events-auto">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAddingCart}
              aria-label={
                justAdded
                  ? `${product?.name || 'Item'} added to cart`
                  : cartItem
                  ? `In cart (${cartItem.quantity}), click to add another`
                  : `Quick add ${product?.name || 'item'} to cart`
              }
              className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold backdrop-blur-2xl border transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.97] ${
                justAdded
                  ? 'bg-success text-bg border-success shadow-success/20'
                  : cartItem
                  ? 'bg-primary text-bg border-primary/90 hover:opacity-95'
                  : 'bg-bg/90 hover:bg-primary text-primary hover:text-bg border-glass-border/[0.18]'
              }`}
            >
              {isAddingCart ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Added to Cart</span>
                </>
              ) : cartItem ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>In Cart ({cartItem.quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2. METADATA & TYPOGRAPHY STAGE (Under Image, Tight & Cohesive) */}
      <div className="mt-4 flex-1 flex flex-col justify-between space-y-1">
        <div>
          {/* Category as small muted uppercase text above the name */}
          {product?.category && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted mb-1 select-none">
              {product.category}
            </p>
          )}

          {/* Product Name (2 Lines Max, Clean Medium Weight) */}
          <h3 className="text-sm sm:text-base font-medium text-primary group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
            {product?.name || 'Curated Product'}
          </h3>
        </div>

        {/* Price & Stock Dot Sit Tight Together */}
        <div className="pt-2 flex items-baseline justify-between gap-2">
          <span className="text-base sm:text-lg font-semibold text-primary tracking-tight">
            {formatPrice(product?.price)}
          </span>

          {/* Stock Indicator: Small colored dot + text */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
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
                  ? 'text-muted'
                  : isLowStock
                  ? 'text-amber-400 font-medium'
                  : 'text-muted'
              }
            >
              {isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${product.stock} left` : 'In stock'}
            </span>
          </div>
        </div>

        {/* 3. Wishlist Variant Primary Action: Full-width Pill "Move to Cart" */}
        {variant === 'wishlist' && (
          <div className="pt-3">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-glass/[0.04] text-muted border border-glass-border/[0.06] cursor-not-allowed text-center select-none"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-glass/[0.08] text-primary border border-glass-border/[0.14] flex items-center justify-center gap-1.5 select-none">
                <Check className="w-3.5 h-3.5 text-accent stroke-[2.5]" />
                <span>In Cart ({cartItem.quantity})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleMoveToCart}
                disabled={isMoving}
                aria-label={`Move ${product?.name || 'item'} to cart`}
                className="w-full py-2.5 px-4 rounded-full text-xs font-semibold bg-primary text-bg hover:opacity-95 border border-primary/90 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
              >
                {isMoving ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
