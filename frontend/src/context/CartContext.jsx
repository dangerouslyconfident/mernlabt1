/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's cart on initialization
  const refreshCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      if (err.status !== 401) {
        setError(err.message || 'Unable to load cart');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getCart()
      .then((data) => {
        if (isMounted) setCartItems(data.cart || []);
      })
      .catch((err) => {
        if (isMounted) {
          if (err.status !== 401) {
            setError(err.message || 'Unable to load cart');
          }
          setCartItems([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Add product to cart (or increment quantity)
  const addToCart = async (productId) => {
    try {
      setError(null);
      const data = await apiAddToCart(productId);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Failed to add product to cart';
      setError(msg);
      throw err;
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId, quantity) => {
    try {
      setError(null);
      const data = await apiUpdateCartQuantity(productId, quantity);
      setCartItems(data.cart || []);
    } catch (err) {
      const msg = err.message || 'Failed to update quantity';
      setError(msg);
      throw err;
    }
  };

  // Remove product from cart entirely
  const removeFromCart = async (productId) => {
    try {
      setError(null);
      const data = await apiRemoveFromCart(productId);
      setCartItems(data.cart || []);
    } catch (err) {
      const msg = err.message || 'Failed to remove item from cart';
      setError(msg);
      throw err;
    }
  };

  // Derived calculations: subtotal and totalItems count
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Clear cart state on logout
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    loading,
    error,
    subtotal,
    totalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
