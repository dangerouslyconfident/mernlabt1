import { useState } from 'react';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, loading, error, subtotal, totalItems, refreshCart } = useCart();
  const [checkoutMsg, setCheckoutMsg] = useState(false);

  const handleCheckout = () => {
    setCheckoutMsg(true);
    setTimeout(() => setCheckoutMsg(false), 3000);
  };

  // 1. LOADING STATE (Section 17)
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-400">Loading your cart...</p>
      </div>
    );
  }

  // 2. ERROR STATE (Section 17)
  if (error && cartItems.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl space-y-3">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-lg font-semibold text-white">Unable to load your cart.</h2>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            type="button"
            onClick={refreshCart}
            className="px-5 py-2.5 rounded-2xl bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. EMPTY STATE (Section 17)
  if (!loading && cartItems.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
            🛒
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Your cart is empty</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't added anything yet. Discover our latest items.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-md shadow-white/10"
            >
              <span>Browse Products</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACTIVE CART VIEW
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left border-b border-white/[0.06] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 mb-2">
            <span>Engineering Lab 05</span>
            <span>•</span>
            <span>Shopping Cart State</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-2">
            <span>My Shopping Cart</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Persisted in MongoDB with real-time stock validation and derived subtotal
          </p>
        </div>

        <span className="text-xs text-zinc-400">
          Total items: <strong className="text-white">{totalItems}</strong>
        </span>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item, idx) => (
            <CartItem key={item.product?._id || item._id || idx} item={item} />
          ))}
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl text-left space-y-5 sticky top-24 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <h2 className="text-base font-semibold text-white pb-3 border-b border-white/[0.06]">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Total Items</span>
                <span className="font-medium text-white">{totalItems} units</span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm">
                <span className="font-semibold text-white">Estimated Total</span>
                <span className="text-lg font-bold text-white tracking-tight">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 space-y-2">
              <Link
                to="/checkout"
                className="w-full py-3 rounded-2xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-lg shadow-white/10 active:scale-[0.98] flex items-center justify-center text-center"
              >
                Proceed to Checkout
              </Link>
            </div>

            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              Stock availability is verified in real time on every quantity change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
