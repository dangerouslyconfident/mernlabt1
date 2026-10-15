import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const product = item.product || {};
  const quantity = item.quantity || 1;
  const stock = product.stock !== undefined ? product.stock : 10;
  const lineTotal = (product.price || 0) * quantity;

  const handleDecrease = async () => {
    if (quantity <= 1 || isUpdating) return;
    try {
      setIsUpdating(true);
      setErrorMsg(null);
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update quantity');
      setTimeout(() => setErrorMsg(null), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (quantity >= stock || isUpdating) return;
    try {
      setIsUpdating(true);
      setErrorMsg(null);
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update quantity');
      setTimeout(() => setErrorMsg(null), 2500);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    try {
      setIsRemoving(true);
      await removeFromCart(product._id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove');
      setTimeout(() => setErrorMsg(null), 2500);
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
      {/* Product Image & Meta */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05] shrink-0"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </Link>

        <div className="space-y-1 text-left">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
            {product.category || 'General'}
          </span>
          <Link
            to={`/products/${product._id}`}
            className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span>₹{(product.price || 0).toLocaleString('en-IN')} each</span>
            <span>•</span>
            <span className={stock < 5 ? 'text-amber-400' : 'text-zinc-500'}>
              {stock} in stock
            </span>
          </div>
          {errorMsg && (
            <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Quantity Controls & Line Total */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
        {/* [-] quantity [+] controls */}
        <div className="flex items-center gap-2 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isUpdating}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-semibold text-white">
            {isUpdating ? '⏳' : quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= stock || isUpdating}
            title={quantity >= stock ? 'Maximum stock reached' : ''}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Line Subtotal */}
        <div className="text-right min-w-[90px]">
          <span className="text-base font-bold text-white block">
            ₹{lineTotal.toLocaleString('en-IN')}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-50 transition-colors mt-0.5"
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
