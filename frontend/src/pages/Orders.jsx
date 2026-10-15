import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { fetchOrders } from '../services/api';
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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return {
        label: 'Delivered',
        className: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        icon: CheckCircle,
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        className: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
        icon: Truck,
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        className: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
        icon: CheckCircle,
      };
    case 'PLACED':
    default:
      return {
        label: status || 'Placed',
        className: 'bg-accent/15 border-accent/30 text-accent',
        icon: Clock,
      };
  }
};

/**
 * My Orders Page ("/orders") — Engineering Lab 06 Task 8
 */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Unable to retrieve your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center space-y-4 text-primary">
        <div className="w-12 h-12 rounded-full border-2 border-glass-border/[0.15] border-t-accent animate-spin" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-primary">Loading your orders...</h2>
          <p className="text-xs text-muted">Retrieving your historical purchase snapshots</p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-20 text-center space-y-5 text-primary">
        <div className="w-14 h-14 rounded-2xl bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-primary">Something went wrong</h2>
          <p className="text-xs text-muted">{error}</p>
        </div>
        <GlassButton
          variant="primary"
          size="md"
          onClick={loadOrders}
          icon={<RefreshCw className="w-4 h-4" />}
          className="mx-auto"
        >
          Try Again
        </GlassButton>
      </div>
    );
  }

  // 3. EMPTY STATE
  if (orders.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center space-y-6 text-primary">
        <div className="w-20 h-20 rounded-3xl bg-glass/[0.04] border border-glass-border/[0.1] text-muted flex items-center justify-center mx-auto">
          <Package className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            You have not placed any orders yet.
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Explore our curated catalog and place your first order.
          </p>
        </div>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-bg font-semibold text-xs hover:opacity-95 transition-all shadow-lg active:scale-95"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 4. ORDERS LIST
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-primary text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-glass-border/[0.08] pb-6">
        <div>
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            Order History
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mt-1">
            My Orders
          </h1>
          <p className="text-xs text-muted mt-1">
            {orders.length} {orders.length === 1 ? 'order placed' : 'orders placed'}
          </p>
        </div>

        <Link
          to="/products"
          className="px-4 py-2 rounded-full bg-glass/[0.05] hover:bg-glass/[0.1] text-primary border border-glass-border/[0.1] text-xs font-medium transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop More Gear</span>
        </Link>
      </div>

      {/* Orders Stack */}
      <div className="space-y-6">
        {orders.map((order) => {
          const statusInfo = getStatusBadge(order.status);
          const StatusIcon = statusInfo.icon;

          return (
            <GlassCard key={order._id} padding="lg" className="space-y-5">
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-glass-border/[0.08] pb-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                    Order Reference
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm text-primary">
                      #{order._id}
                    </span>
                    <span className="text-xs text-muted">•</span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusInfo.className}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusInfo.label}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-glass/[0.08] border border-glass-border/[0.12] text-[11px] font-medium text-muted">
                    {order.paymentStatus || 'PAID'}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="divide-y divide-glass-border/[0.06]">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-glass/[0.06] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-muted/50" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-primary">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-muted">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm font-semibold text-primary shrink-0">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-4 border-t border-glass-border/[0.08] flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-muted">
                  <span>Delivered to: </span>
                  <span className="text-primary font-medium">
                    {order.shippingAddress?.fullName} ({order.shippingAddress?.city},{' '}
                    {order.shippingAddress?.pincode})
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted">Total Paid:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
