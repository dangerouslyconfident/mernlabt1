import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar({ customer, setCustomer, wishlistCount = 0 }) {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (setCustomer) setCustomer(null);
      navigate('/login');
    }
  };

  const navLinkStyle = ({ isActive }) =>
    `px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
      isActive
        ? 'bg-white text-zinc-950 font-semibold shadow-sm'
        : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
    }`;

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 w-full max-w-6xl mx-auto transition-all duration-300">
      <nav className="flex items-center justify-between px-5 py-3.5 rounded-3xl bg-zinc-950/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Brand */}
        <Link to="/home" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-500/25">
            S
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm tracking-tight text-white block">
              ShopKart
            </span>
            <span className="text-[10px] text-zinc-400 block -mt-0.5">
              MERN Labs 01-05
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Home | Products | Wishlist | Cart) */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05]">
          <NavLink to="/home" className={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkStyle}>
            Products
          </NavLink>
          <NavLink to="/wishlist" className={navLinkStyle}>
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                {wishlistCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/cart" className={navLinkStyle}>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-[10px] font-semibold">
                {totalItems}
              </span>
            )}
          </NavLink>
          <NavLink to="/orders" className={navLinkStyle}>
            <span>Orders</span>
          </NavLink>
        </div>

        {/* Auth / Profile Actions */}
        <div className="flex items-center gap-3">
          {customer ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-zinc-200 leading-tight">
                  {customer.fullName}
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight truncate max-w-[130px]">
                  {customer.email}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
                {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="text-xs font-medium px-3.5 py-1.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-semibold shadow-sm"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
