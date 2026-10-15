import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { registerCustomer, loginCustomer, getMe } from '../services/api';
import AuthShell from '../components/auth/AuthShell';
import InputField from '../components/ui/InputField';
import GlassButton from '../components/ui/GlassButton';

/**
 * Register Page ("/register")
 * Centered glass authentication card wrapped in AuthShell.
 * Automatically redirects already-authenticated sessions to /home.
 */
export default function Register({ setCustomer }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

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
        // Unauthenticated - stay on /register
      });

    return () => {
      isMounted = false;
    };
  }, [navigate, setCustomer]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const { fullName, email, password, phone } = formData;
    if (!fullName.trim() || !email.trim() || !password || !phone.trim()) {
      return 'All fields are mandatory.';
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must contain at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Create customer account on backend
      await registerCustomer(formData);

      // 2. On success -> Redirect to Login page (Lab 02 Requirement)
      navigate('/login', {
        state: {
          registeredEmail: formData.email,
          successMessage: 'Account created successfully! Please log in.',
        },
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join ShopKart to experience curated workspace gear"
      badgeText="New Customer"
    >
      {/* Inline Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-danger/15 border border-danger/30 text-danger text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <InputField
          label="Full Name"
          id="register-name"
          name="fullName"
          type="text"
          placeholder="Ada Lovelace"
          value={formData.fullName}
          onChange={handleChange}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <InputField
          label="Email Address"
          id="register-email"
          name="email"
          type="email"
          placeholder="ada@example.com"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <InputField
          label="Phone Number"
          id="register-phone"
          name="phone"
          type="tel"
          placeholder="9876543210"
          value={formData.phone}
          onChange={handleChange}
          leftIcon={<Phone className="w-4 h-4" />}
          required
        />

        <InputField
          label="Password"
          id="register-password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={formData.password}
          onChange={handleChange}
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </GlassButton>
        </div>
      </form>

      {/* Switch to Login */}
      <p className="mt-6 text-center text-xs text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-accent hover:underline font-medium ml-1 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
