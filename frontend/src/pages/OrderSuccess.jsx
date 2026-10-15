import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, MapPin, Calendar, Clock } from 'lucide-react';
import { fetchOrderById } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Order Confirmation Page ("/order-success/:id") — Lab 06 Task 6
 */
export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchOrderById(id)
      .then((data) => {
        if (isMounted) setOrder(data.order);
      })
      .catch((err) => {
        console.error('Failed to load confirmed order:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-glass-border/[0.15] border-t-accent animate-spin mx-auto" />
        <p className="text-xs text-muted">Retrieving order confirmation...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-primary">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-fade-in">
          <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Payment Verified & Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Order Placed Successfully
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Thank you! Your order has been placed and your cart has been cleared.
          </p>
        </div>
      </div>

      {/* Confirmation Glass Card */}
      <GlassCard padding="lg" className="space-y-6 text-left">
        {/* Order Details Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-glass-border/[0.08] pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Order Reference
            </span>
            <p className="text-base font-mono font-semibold text-accent">{order?._id || id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              {order?.status || 'PLACED'}
            </span>
            <span className="px-3 py-1 rounded-full bg-glass/[0.08] border border-glass-border/[0.12] text-xs font-medium text-muted">
              {order?.paymentStatus || 'PAID'}
            </span>
          </div>
        </div>

        {/* Snapshot Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Items in this Order ({order?.items?.length || 0})
          </h3>
          <div className="divide-y divide-glass-border/[0.06] border border-glass-border/[0.08] rounded-2xl p-2 bg-glass/[0.02]">
            {(order?.items || []).map((item, index) => (
              <div key={index} className="py-2.5 px-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-glass/[0.06] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-muted/50" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-primary line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-muted">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">
                  {formatPrice((item.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address and Total Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Shipping Address Snapshot */}
          <div className="p-4 rounded-2xl bg-glass/[0.03] border border-glass-border/[0.06] space-y-1.5 text-xs text-muted">
            <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>Delivery Address</span>
            </div>
            <p className="font-medium text-primary">{order?.shippingAddress?.fullName}</p>
            <p>{order?.shippingAddress?.addressLine1}</p>
            <p>
              {order?.shippingAddress?.city}, {order?.shippingAddress?.state} -{' '}
              {order?.shippingAddress?.pincode}
            </p>
            <p>Phone: {order?.shippingAddress?.phone}</p>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl bg-glass/[0.03] border border-glass-border/[0.06] space-y-2 text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex justify-between text-muted">
                <span>Payment Method</span>
                <span className="text-primary font-medium">Razorpay (Test Mode)</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>
            </div>
            <div className="pt-2 border-t border-glass-border/[0.08] flex justify-between items-baseline">
              <span className="text-xs font-semibold text-primary">Total Paid</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(order?.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-glass-border/[0.08]">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-primary text-bg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all text-center"
          >
            <span>View My Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-glass/[0.06] hover:bg-glass/[0.12] text-primary border border-glass-border/[0.1] font-medium text-xs flex items-center justify-center gap-2 transition-all text-center"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
