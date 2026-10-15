import { useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { ShoppingBag, LogOut, Heart, ShoppingCart, User } from 'lucide-react';
import gsap from 'gsap';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';
import { WishlistProvider, useWishlist } from '../context/WishlistContext';
import GlassButton from '../components/ui/GlassButton';
import UndoToast from '../components/ui/UndoToast';

/**
 * App Layout Content (Wrapped in WishlistProvider)
 * Renders verified authenticated navigation, synchronized Wishlist and Cart badges with GSAP pops,
 * user profile avatar, and the global UndoToast.
 */
function AppLayoutContent() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const customer = outletContext?.customer;

  const { totalItems, clearCart } = useCart();
  const { count: wishlistCount, clearWishlist } = useWishlist();

  const wishlistBadgeRef = useRef(null);
  const cartBadgeRef = useRef(null);
  const isFirstWishlist = useRef(true);
  const isFirstCart = useRef(true);

  // GSAP badge pop animation on count changes (skip first render)
  useEffect(() => {
    if (isFirstWishlist.current) {
      isFirstWishlist.current = false;
      return;
    }
    if (wishlistBadgeRef.current && wishlistCount > 0) {
      gsap.fromTo(
        wishlistBadgeRef.current,
        { scale: 1 },
        { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
  }, [wishlistCount]);

  useEffect(() => {
    if (isFirstCart.current) {
      isFirstCart.current = false;
      return;
    }
    if (cartBadgeRef.current && totalItems > 0) {
      gsap.fromTo(
        cartBadgeRef.current,
        { scale: 1 },
        { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
  }, [totalItems]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearWishlist();
      clearCart();
      navigate('/login');
    }
  };

  const navLinkStyle = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
      isActive
        ? 'bg-primary text-bg font-semibold shadow-sm'
        : 'text-muted hover:text-primary hover:bg-glass/[0.06]'
    }`;

  const displayWishlist = wishlistCount > 9 ? '9+' : wishlistCount;
  const displayCart = totalItems > 9 ? '9+' : totalItems;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg text-primary">
      {/* App Top Glass Header Bar */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-7xl mx-auto transition-all duration-300">
        <nav className="flex items-center justify-between px-5 py-3 rounded-full bg-bg/80 backdrop-blur-2xl border border-glass-border/[0.1] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          {/* Brand Mark */}
          <Link
            to="/home"
            className="group flex items-center gap-2.5 text-primary hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-glass/[0.08] border border-glass-border/[0.14] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4 text-accent" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-primary">
              ShopKart
            </span>
          </Link>

          {/* Navigation Links with Centralized Counter Badges */}
          <div className="flex items-center gap-1 bg-glass/[0.03] p-1 rounded-full border border-glass-border/[0.06]">
            <NavLink to="/home" className={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkStyle}>
              Products
            </NavLink>
            <NavLink to="/wishlist" className={navLinkStyle}>
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span
                  ref={wishlistBadgeRef}
                  className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold tracking-tight leading-none"
                >
                  {displayWishlist}
                </span>
              )}
            </NavLink>
            <NavLink to="/cart" className={navLinkStyle}>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span
                  ref={cartBadgeRef}
                  className="px-1.5 py-0.5 rounded-full bg-accent/25 text-accent border border-accent/40 text-[10px] font-semibold tracking-tight leading-none"
                >
                  {displayCart}
                </span>
              )}
            </NavLink>
            <NavLink to="/orders" className={navLinkStyle}>
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orders</span>
            </NavLink>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            {customer && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-primary leading-tight">
                  {customer.fullName?.trim() || customer.email?.split('@')[0] || 'Member'}
                </span>
                <span className="text-[11px] text-muted leading-tight truncate max-w-[140px]">
                  {customer.email || ''}
                </span>
              </div>
            )}

            <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs font-semibold text-accent select-none">
              {(customer?.fullName?.trim() || customer?.email?.split('@')[0]) ? (
                (customer.fullName?.trim() || customer.email.split('@')[0]).charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs hover:text-danger hover:bg-danger/10"
              icon={<LogOut className="w-3.5 h-3.5" />}
              aria-label="Log out of account"
            >
              <span className="hidden sm:inline">Logout</span>
            </GlassButton>
          </div>
        </nav>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 w-full my-6">
        <Outlet context={{ customer }} />
      </main>

      {/* Global Undo Toast */}
      <UndoToast />

      {/* App Minimalist Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-glass-border/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">ShopKart</span>
          <span>•</span>
          <span>Verified Secure Session</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/home" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link to="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>•</span>
          <Link to="/wishlist" className="hover:text-primary transition-colors">
            Wishlist
          </Link>
          <span>•</span>
          <Link to="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
        </div>
      </footer>
    </div>
  );
}

/**
 * AppLayout Provider Shell
 */
export default function AppLayout() {
  return (
    <WishlistProvider>
      <AppLayoutContent />
    </WishlistProvider>
  );
}
