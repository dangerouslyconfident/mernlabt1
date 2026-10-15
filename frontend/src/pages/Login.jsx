import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { loginCustomer, getMe } from '../services/api';
import AuthShell from '../components/auth/AuthShell';
import InputField from '../components/ui/InputField';
import GlassButton from '../components/ui/GlassButton';

/**
 * Login Page ("/login")
 * Centered glass authentication card wrapped in AuthShell.
 * Automatically redirects already-authenticated sessions to /home.
 */
export default function Login({ setCustomer }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect immediately to /home
  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((data) => {
        if (isMounted && data) {
          if (setCustomer) setCustomer(data);
          navigate('/home', { replace: true });
        }
      })
      .catch(() => {
        // Unauthenticated - stay on /login
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, setCustomer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Call login API (sets HttpOnly cookie)
      await loginCustomer({ email, password });

      // 2. Fetch authenticated profile
      try {
        const me = await getMe();
        if (setCustomer) setCustomer(me);
      } catch {
        // Fallback
      }

      // 3. Navigate to protected Home
      navigate('/home');
    } catch {
      // Security practice: generic message prevents account enumeration
      setError('Invalid Credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to access your curated catalog and orders"
      badgeText="Customer Sign In"
    >
      {/* Registration Success Alert */}
      {location.state?.successMessage && !error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
          <span>{location.state.successMessage}</span>
        </div>
      )}

      {/* Inline Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          id="login-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <InputField
          label="Password"
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          showPasswordToggle
          required
        />

        <div className="pt-2">
          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-semibold"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </GlassButton>
        </div>
      </form>

      {/* Switch to Register */}
      <p className="mt-6 text-center text-xs text-muted">
        Don&apos;t have an account yet?{' '}
        <Link
          to="/register"
          className="text-accent hover:underline font-medium ml-1 transition-colors"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
