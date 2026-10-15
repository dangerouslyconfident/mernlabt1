/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  toggleWishlist as apiToggleWishlist,
} from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // In-flight request tracker to prevent double-clicks/duplicate mutations
  const inFlightRef = useRef(new Set());

  // Global Undo Toast state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((message, onUndo) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: Date.now(),
      message,
      onUndo: onUndo
        ? () => {
            onUndo();
            dismissToast();
          }
        : null,
    });
  }, [dismissToast]);

  // Load wishlist from server once authenticated
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      // Filter out null/undefined items (e.g. deleted products from failed population)
      const validItems = (data.wishlist || []).filter(
        (item) => item && typeof item === 'object' && item._id
      );
      setItems(validItems);
    } catch (err) {
      if (err.status !== 401) {
        setError(err.message || 'Unable to load wishlist');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getWishlist()
      .then((data) => {
        if (!isMounted) return;
        const validItems = (data.wishlist || []).filter(
          (item) => item && typeof item === 'object' && item._id
        );
        setItems(validItems);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.status !== 401) {
          setError(err.message || 'Unable to load wishlist');
        }
        setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Derived Set of IDs for O(1) membership checks
  const ids = useMemo(() => {
    return new Set(items.map((item) => item._id));
  }, [items]);

  // Count is strictly derived from items
  const count = items.length;

  // Optimistic Toggle with rollback and in-flight deduplication
  const toggle = useCallback(
    async (product) => {
      if (!product || !product._id) return;
      const productId = product._id;

      if (inFlightRef.current.has(productId)) return;
      inFlightRef.current.add(productId);

      const isCurrentlySaved = ids.has(productId);
      const previousItems = items;

      // Optimistic state transition
      if (isCurrentlySaved) {
        setItems((prev) => prev.filter((item) => item._id !== productId));
      } else {
        setItems((prev) => [product, ...prev]);
      }

      try {
        await apiToggleWishlist(productId);
      } catch (err) {
        // Rollback on error
        setItems(previousItems);
        showToast('Unable to update wishlist. Please try again.');
        console.error('Failed to toggle wishlist:', err);
      } finally {
        inFlightRef.current.delete(productId);
      }
    },
    [ids, items, showToast]
  );

  // Restore for Undo
  const restore = useCallback(
    async (product) => {
      if (!product || !product._id) return;
      const productId = product._id;

      if (inFlightRef.current.has(productId)) return;
      inFlightRef.current.add(productId);

      // Optimistic restore
      setItems((prev) => {
        if (prev.some((item) => item._id === productId)) return prev;
        return [product, ...prev];
      });

      try {
        await apiAddToWishlist(productId);
      } catch (err) {
        // Rollback
        setItems((prev) => prev.filter((item) => item._id !== productId));
        showToast('Unable to restore item to wishlist.');
        console.error('Failed to restore item:', err);
      } finally {
        inFlightRef.current.delete(productId);
      }
    },
    [showToast]
  );

  // Optimistic Remove with rollback
  const remove = useCallback(
    async (productId, { showUndoToast = true } = {}) => {
      if (!productId) return;
      if (inFlightRef.current.has(productId)) return;
      inFlightRef.current.add(productId);

      const targetItem = items.find((item) => item._id === productId);
      const previousItems = items;

      // Optimistic removal
      setItems((prev) => prev.filter((item) => item._id !== productId));

      if (showUndoToast && targetItem) {
        showToast(`Removed "${targetItem.name}" from wishlist`, () => {
          restore(targetItem);
        });
      }

      try {
        await apiRemoveFromWishlist(productId);
      } catch (err) {
        // Rollback
        setItems(previousItems);
        showToast('Unable to remove item from wishlist.');
        console.error('Failed to remove from wishlist:', err);
      } finally {
        inFlightRef.current.delete(productId);
      }
    },
    [items, restore, showToast]
  );

  // Batch remove for "Move all to cart"
  const removeMany = useCallback(
    async (productIds) => {
      if (!productIds || productIds.length === 0) return;
      const idSet = new Set(productIds);
      const previousItems = items;

      // Optimistically remove all from items
      setItems((prev) => prev.filter((item) => !idSet.has(item._id)));

      try {
        await Promise.all(productIds.map((id) => apiRemoveFromWishlist(id)));
      } catch (err) {
        setItems(previousItems);
        showToast('Unable to remove items from wishlist.');
        console.error('Failed to batch remove from wishlist:', err);
      }
    },
    [items, showToast]
  );

  // Batch restore for Undo
  const restoreMany = useCallback(
    async (products) => {
      if (!products || products.length === 0) return;
      const previousItems = items;

      // Optimistically restore all
      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i._id));
        const toAdd = products.filter((p) => p && p._id && !existingIds.has(p._id));
        return [...toAdd, ...prev];
      });

      try {
        await Promise.all(products.map((p) => apiAddToWishlist(p._id)));
      } catch (err) {
        setItems(previousItems);
        showToast('Unable to restore items to wishlist.');
        console.error('Failed to batch restore to wishlist:', err);
      }
    },
    [items, showToast]
  );

  // Clear state on logout
  const clearWishlist = useCallback(() => {
    setItems([]);
    setToast(null);
  }, []);

  const value = useMemo(
    () => ({
      items,
      ids,
      count,
      loading,
      error,
      toggle,
      remove,
      restore,
      removeMany,
      restoreMany,
      refresh,
      clearWishlist,
      toast,
      showToast,
      dismissToast,
    }),
    [
      items,
      ids,
      count,
      loading,
      error,
      toggle,
      remove,
      restore,
      removeMany,
      restoreMany,
      refresh,
      clearWishlist,
      toast,
      showToast,
      dismissToast,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
