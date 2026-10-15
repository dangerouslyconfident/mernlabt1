import { useEffect, useState, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getMe } from '../../services/api';
import GlassButton from '../ui/GlassButton';

/**
 * Protected Route Wrapper
 * On mount, queries GET /api/customers/me to verify server-side HttpOnly cookie session.
 * Displays a zero-flicker glass loader while pending.
 * Redirects to /login ONLY on a true 401 Unauthorized.
 * On network errors or 5xx, displays a friendly retry card instead of bouncing the user to login.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('pending'); // 'pending' | 'authenticated' | 'unauthenticated' | 'error'
  const [customer, setCustomer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (isMounted) {
          setCustomer(data);
          setStatus('authenticated');
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.status === 401) {
            setCustomer(null);
            setStatus('unauthenticated');
          } else {
            setErrorMessage(err.message || 'Unable to connect to authentication service');
            setStatus('error');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRetry = useCallback(async () => {
    setStatus('pending');
    setIsRetrying(true);
    setErrorMessage(null);

    try {
      const data = await getMe();
      setCustomer(data);
      setStatus('authenticated');
    } catch (err) {
      if (err.status === 401) {
        setCustomer(null);
        setStatus('unauthenticated');
      } else {
        setErrorMessage(err.message || 'Unable to connect to authentication service');
        setStatus('error');
      }
    } finally {
      setIsRetrying(false);
    }
  }, []);

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-bg">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-glass-border/[0.15] border-t-accent animate-spin" />
          <div className="absolute w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
        <p className="text-xs text-muted tracking-wide font-medium">
          Verifying session...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-5 bg-bg text-center">
        <div className="w-12 h-12 rounded-2xl bg-danger/15 border border-danger/30 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h2 className="text-base font-semibold text-primary">Connection Issue</h2>
          <p className="text-xs text-muted leading-relaxed">
            {errorMessage || 'Unable to verify session. Please check your connection and try again.'}
          </p>
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          onClick={handleRetry}
          isLoading={isRetrying}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mx-auto"
        >
          Retry Connection
        </GlassButton>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet context={{ customer }} />;
}
