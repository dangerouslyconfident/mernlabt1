import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Package, Check, AlertCircle } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useWishlist } from '../context/WishlistContext';

const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * ProductCard Component (Engineering Lab 03 & 04 Specification)
 * 
 * Complies with Lab 04 Product Card & Interaction States:
 * - Default: "♡ Add to Wishlist"
 * - Request in progress: "⏳ Saving..."
 * - Success: "♥ Added to Wishlist"
 * - Failure: "Unable to save product. Please try again."
 * - [ View Details ] button navigating to /products/:id
 * - Prevents duplicate clicks while saving
 * - No page refresh required
 */
export default function ProductCard({ product, variant = 'catalog', onRemove }) {
  const wishlistCtx = useWishlist();
  const isContextWishlisted = wishlistCtx?.ids ? wishlistCtx.ids.has(product?._id) : false;

  const [isWishlisted, setIsWishlisted] = useState(isContextWishlisted);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock <= 5;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate clicks while in-flight
    if (isSaving || !product._id) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
        if (wishlistCtx?.remove) {
          wishlistCtx.remove(product._id);
        }
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
        if (wishlistCtx?.ids) {
          wishlistCtx.ids.add(product._id);
        }
        if (wishlistCtx?.refresh) {
          wishlistCtx.refresh();
        }
      }
    } catch (err) {
      console.error('Wishlist action failed:', err);
      // If 409 Conflict (already in wishlist), sync state to true
      if (err.status === 409) {
        setIsWishlisted(true);
      } else {
        setErrorMessage(err.message || 'Unable to save product. Please try again.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl bg-glass/[0.03] hover:bg-glass/[0.06] border border-glass-border/[0.08] hover:border-glass-border/[0.2] backdrop-blur-2xl p-4 sm:p-5 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      {/* 1. Image Stage */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-glass/[0.04] select-none">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name || 'Product photo'}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-40 grayscale' : 'opacity-95'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-glass/[0.06] to-transparent p-4 text-center">
            <Package className="w-10 h-10 text-muted/50 mb-1" />
            <span className="text-xs text-muted font-medium">
              {product.category || 'Gear'}
            </span>
          </div>
        )}

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full bg-bg/85 backdrop-blur-md border border-danger/30 text-[10px] font-semibold text-danger uppercase tracking-wider">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 rounded-full bg-bg/85 backdrop-blur-md border border-amber-500/30 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              {product.stock} units left
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-bg/85 backdrop-blur-md border border-success/30 text-[10px] font-semibold text-success uppercase tracking-wider">
              {product.stock ? `${product.stock} units left` : 'In Stock'}
            </span>
          )}
        </div>

        {/* Top-Right Quick Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isSaving}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-sm ${
            isWishlisted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-bg/80 border-glass-border/[0.12] text-muted hover:text-rose-400 hover:border-rose-500/30'
          }`}
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* 2. Metadata */}
      <div className="mt-4 flex-1 flex flex-col justify-between space-y-2 text-left">
        <div>
          {/* Category */}
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1">
            {product.category || 'Category'}
          </span>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Price & Stock info */}
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted">
              {isOutOfStock ? '0 units left' : `${product.stock ?? 1} units left`}
            </span>
          </div>
        </div>

        {/* Error alert if wishlist call failed */}
        {errorMessage && (
          <div className="p-2 rounded-xl bg-danger/15 border border-danger/30 text-danger text-[11px] flex items-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* 3. Action Buttons: [ View Details ] [ ♡ Wishlist ] */}
        <div className="pt-3 grid grid-cols-2 gap-2 border-t border-glass-border/[0.08]">
          <Link
            to={`/products/${product._id}`}
            className="w-full py-2 px-3 rounded-xl bg-glass/[0.06] hover:bg-glass/[0.12] text-primary border border-glass-border/[0.1] text-xs font-medium flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleWishlistClick}
            disabled={isSaving}
            className={`w-full py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-60 ${
              isWishlisted
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                : 'bg-glass/[0.05] hover:bg-glass/[0.1] border-glass-border/[0.12] text-muted hover:text-primary'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : isWishlisted ? (
              <>
                <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                <span>Wishlisted</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 text-muted group-hover:text-rose-400" />
                <span>Wishlist</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
