import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Package } from 'lucide-react';

const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * WishlistCard Component (Engineering Lab 04 Specification)
 * 
 * Displays:
 * 1. Product Image
 * 2. Product Name
 * 3. Price (formatted in INR)
 * 4. Category
 * 5. Stock Status ("x units left" / "In stock" / "Out of stock")
 * 6. [ View Details ] button (routes to /products/:id)
 * 7. [ Remove ♥ ] button (removes item from wishlist)
 */
export default function WishlistCard({ product, onRemove }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock <= 5;

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      if (onRemove) {
        await onRemove(product._id);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-glass/[0.03] hover:bg-glass/[0.06] border border-glass-border/[0.08] hover:border-glass-border/[0.2] backdrop-blur-2xl p-4 sm:p-5 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      {/* Top Image Stage (Fixed Aspect Ratio) */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-glass/[0.04] select-none">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name || 'Wishlist item'}
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

        {/* Stock Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10">
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

        {/* Quick Corner Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-bg/80 hover:bg-danger/20 backdrop-blur-md border border-glass-border/[0.12] hover:border-danger/30 text-rose-400 hover:text-danger flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          {isRemoving ? (
            <div className="w-3.5 h-3.5 border-2 border-danger border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart className="w-4 h-4 fill-current" />
          )}
        </button>
      </div>

      {/* Product Metadata */}
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

          {/* Price & Stock status */}
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted">
              {isOutOfStock ? 'Unavailable' : `${product.stock ?? 1} in stock`}
            </span>
          </div>
        </div>

        {/* Actions: [ View Details ] & [ Remove ♥ ] */}
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
            onClick={handleRemove}
            disabled={isRemoving}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isRemoving ? (
              <>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove ♥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
