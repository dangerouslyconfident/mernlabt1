import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';
import GlassButton from '../components/ui/GlassButton';

/**
 * Wishlist Page ("/wishlist")
 * Engineering Lab 04 Specification:
 * - Persistent backend feature: fetches dynamically via GET /wishlist
 * - Direct component state management (intentional design placed before Redux/Context)
 * - Three explicit UI states: Loading, Empty, and Error
 * - Dynamic rendering of WishlistCard components
 * - Direct removal via DELETE /wishlist/:productId
 */
export default function Wishlist({ onWishlistUpdate }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchWishlistData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();

      // Ensure valid product objects
      const items = (data.wishlist || []).filter(
        (item) => item && typeof item === 'object' && item._id
      );

      setWishlist(items);
      if (onWishlistUpdate) onWishlistUpdate(items.length);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError('Unable to load wishlist. Please check your connection.');
      setWishlist([]);
      if (onWishlistUpdate) onWishlistUpdate(0);
    } finally {
      setLoading(false);
    }
  }, [onWishlistUpdate]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  // Remove a product from wishlist
  const handleRemoveProduct = async (productId) => {
    try {
      await removeFromWishlist(productId);

      // Dynamically update UI state without full page refresh
      setWishlist((prev) => {
        const updated = prev.filter((item) => item._id !== productId);
        if (onWishlistUpdate) onWishlistUpdate(updated.length);
        return updated;
      });

      setToastMessage('Product removed from wishlist');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert(err.message || 'Unable to remove product from wishlist. Please try again.');
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-glass-border/[0.15] border-t-accent animate-spin" />
          <Heart className="absolute w-5 h-5 text-accent animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-primary">Loading your wishlist...</h2>
          <p className="text-xs text-muted">Retrieving your saved products from the database</p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">Something went wrong</h2>
          <p className="text-xs text-muted leading-relaxed">
            We couldn&apos;t load your wishlist. {error}
          </p>
        </div>
        <GlassButton
          variant="primary"
          size="md"
          onClick={fetchWishlistData}
          icon={<RefreshCw className="w-4 h-4" />}
          className="mx-auto"
        >
          Try Again
        </GlassButton>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (wishlist.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        {/* Floating Heart Icon */}
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/5">
          <Heart className="w-10 h-10 fill-rose-500/20" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Your wishlist is empty ❤️
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Save products you love and find them here later.
          </p>
        </div>

        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-bg font-semibold text-sm hover:opacity-95 transition-all shadow-lg active:scale-95"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 4. POPULATED WISHLIST STATE
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/90 border border-white/[0.1] text-xs font-medium text-white shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-glass-border/[0.08] pb-6 text-left">
        <div>
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            Saved Products
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mt-1">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'product saved' : 'products saved'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2 rounded-full bg-glass/[0.05] hover:bg-glass/[0.1] text-primary border border-glass-border/[0.1] text-xs font-medium transition-all inline-flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Grid of Saved Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemoveProduct}
          />
        ))}
      </div>
    </div>
  );
}
