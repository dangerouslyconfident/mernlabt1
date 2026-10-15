import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MarketingLayout from './layouts/MarketingLayout';
import AppLayout from './layouts/AppLayout';

// Auth Guard & Shell
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';

// Context
import { CartProvider } from './context/CartContext';

/**
 * Root Application Component
 * Implements clean architectural separation between Marketing and App layouts,
 * HttpOnly session verification via ProtectedRoute, and landing-first experience.
 */
export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Route: Entry Landing Page */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          {/* Standalone Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Experience (Server-verified HttpOnly Session) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderSuccess />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
            </Route>
          </Route>

          {/* Catch-all redirect to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
