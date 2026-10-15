import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import InputField from '../components/ui/InputField';
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} from '../api/customerApi';

export default function Lab1Auth({ onCustomerChange }) {
  const queryClient = useQueryClient();

  // Active form view: 'login' | 'register'
  const [activeForm, setActiveForm] = useState('login');

  // Form states
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  });

  // Live Inspector log state to display API results
  const [latestResponse, setLatestResponse] = useState(null);

  // 1. React Query: Fetch authenticated profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      try {
        const res = await getProfile();
        if (onCustomerChange) onCustomerChange(res);
        return res;
      } catch (err) {
        if (onCustomerChange) onCustomerChange(null);
        throw err;
      }
    },
    retry: false,
  });

  // 2. Register Mutation
  const registerMutation = useMutation({
    mutationFn: registerCustomer,
    onSuccess: (data) => {
      setLatestResponse({
        endpoint: 'POST /customers/register',
        status: '201 Created',
        data,
      });
      // Pre-fill login email
      setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      setActiveForm('login');
    },
    onError: (error) => {
      setLatestResponse({
        endpoint: 'POST /customers/register',
        status: `${error.status || 400} Bad Request / Conflict`,
        data: error.data || { message: error.message },
        isError: true,
      });
    },
  });

  // 3. Login Mutation
  const loginMutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: (data) => {
      setLatestResponse({
        endpoint: 'POST /customers/login',
        status: '200 OK',
        data,
      });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
    onError: (error) => {
      setLatestResponse({
        endpoint: 'POST /customers/login',
        status: `${error.status || 401} Unauthorized`,
        data: error.data || { message: error.message },
        isError: true,
      });
    },
  });

  // 4. Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: logoutCustomer,
    onSuccess: (data) => {
      setLatestResponse({
        endpoint: 'POST /customers/logout',
        status: '200 OK',
        data,
      });
      queryClient.setQueryData(['customerProfile'], null);
      if (onCustomerChange) onCustomerChange(null);
    },
    onError: (error) => {
      setLatestResponse({
        endpoint: 'POST /customers/logout',
        status: `${error.status || 500} Error`,
        data: error.data || { message: error.message },
        isError: true,
      });
    },
  });

  // 5. Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      setLatestResponse({
        endpoint: 'PATCH /customers/change-password',
        status: '200 OK',
        data,
      });
      setPasswordForm({ oldPassword: '', newPassword: '' });
    },
    onError: (error) => {
      setLatestResponse({
        endpoint: 'PATCH /customers/change-password',
        status: `${error.status || 400} Error`,
        data: error.data || { message: error.message },
        isError: true,
      });
    },
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordForm);
  };

  const handleFetchProfileClick = async () => {
    try {
      const res = await refetchProfile();
      if (res.data) {
        setLatestResponse({
          endpoint: 'GET /customers/me',
          status: '200 OK',
          data: res.data,
        });
      } else if (res.error) {
        setLatestResponse({
          endpoint: 'GET /customers/me',
          status: '401 Unauthorized',
          data: res.error.data || { message: res.error.message },
          isError: true,
        });
      }
    } catch (err) {
      setLatestResponse({
        endpoint: 'GET /customers/me',
        status: '401 Unauthorized',
        data: err.data || { message: err.message },
        isError: true,
      });
    }
  };

  const isAuthenticated = !!profileData && !profileError;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-400">
          <span>Lab 01</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span className="text-zinc-200">Customer Authentication Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          ShopKart Identity & Auth
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          REST API service with JWT authentication stored in secure HttpOnly cookies,
          password hashing via bcrypt, and protected customer profile routes.
        </p>
      </div>

      {/* Main Grid: Authentication Forms & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Authenticated Customer Card (if logged in) */}
          {isAuthenticated ? (
            <GlassCard variant="elevated" className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
                    {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-white">
                      {profileData.fullName}
                    </h3>
                    <p className="text-xs text-zinc-400">{profileData.email}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  Authenticated
                </span>
              </div>

              {/* Customer details summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                    Customer ID
                  </span>
                  <span className="text-xs text-zinc-300 font-mono break-all">
                    {profileData._id}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">
                    {profileData.phone}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={handleFetchProfileClick}
                  isLoading={isProfileLoading}
                >
                  Verify /me Endpoint
                </GlassButton>

                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  isLoading={logoutMutation.isPending}
                >
                  Log Out
                </GlassButton>
              </div>

              {/* Bonus Challenge: Change Password Form */}
              <div className="pt-4 border-t border-white/[0.08] text-left">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Bonus Challenge: Change Password (+10 Marks)
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    PATCH /customers/change-password
                  </span>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                      }
                      required
                    />
                    <InputField
                      type="password"
                      placeholder="New Password (min 6 chars)"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <GlassButton
                    type="submit"
                    variant="glass"
                    size="sm"
                    isLoading={changePasswordMutation.isPending}
                  >
                    Update Password
                  </GlassButton>
                </form>
              </div>
            </GlassCard>
          ) : (
            /* Auth Tabs & Forms (When not logged in) */
            <GlassCard variant="default" className="space-y-6">
              {/* Pill Switcher */}
              <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveForm('login')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    activeForm === 'login'
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Login (Task 2)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm('register')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    activeForm === 'register'
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Register (Task 1)
                </button>
              </div>

              {/* Login Form */}
              {activeForm === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-lg font-medium text-white">Customer Login</h3>
                    <p className="text-xs text-zinc-400">
                      Authenticates customer and returns an HttpOnly secure cookie.
                    </p>
                  </div>

                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="john@gmail.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />

                  <InputField
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />

                  <div className="pt-2">
                    <GlassButton
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={loginMutation.isPending}
                    >
                      Authenticate & Get Cookie
                    </GlassButton>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="text-left space-y-1">
                    <h3 className="text-lg font-medium text-white">Register Customer</h3>
                    <p className="text-xs text-zinc-400">
                      Hashes password with bcrypt before saving to MongoDB.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      placeholder="Ada Lovelace"
                      value={registerForm.fullName}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, fullName: e.target.value })
                      }
                      required
                    />

                    <InputField
                      label="Phone Number"
                      placeholder="9876543210"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <InputField
                    label="Email Address"
                    type="email"
                    placeholder="john@gmail.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, email: e.target.value })
                    }
                    required
                  />

                  <InputField
                    label="Password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, password: e.target.value })
                    }
                    helperText="Stored exclusively as a bcrypt salt hash"
                    required
                  />

                  <div className="pt-2">
                    <GlassButton
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={registerMutation.isPending}
                    >
                      Create Customer Account
                    </GlassButton>
                  </div>
                </form>
              )}
            </GlassCard>
          )}

          {/* Quick API action buttons for grading/demo */}
          <GlassCard variant="subtle" className="text-left space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Quick Test Endpoints
            </h4>
            <div className="flex flex-wrap gap-2">
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={handleFetchProfileClick}
                isLoading={isProfileLoading}
              >
                Test GET /customers/me
              </GlassButton>

              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  loginMutation.mutate({
                    email: 'wrong@shopkart.com',
                    password: 'wrongpassword',
                  })
                }
              >
                Test 401 Invalid Credentials
              </GlassButton>

              <GlassButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  registerMutation.mutate({
                    fullName: 'Incomplete User',
                    email: '',
                    password: '123',
                    phone: '',
                  })
                }
              >
                Test 400 Validation Error
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Live Inspector & TA Evaluation Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live API Response Inspector */}
          <GlassCard variant="default" className="text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Live Response Inspector
                </h3>
              </div>
              {latestResponse && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    latestResponse.isError
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {latestResponse.status}
                </span>
              )}
            </div>

            {latestResponse ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Endpoint:</span>
                  <span className="font-mono text-zinc-300 bg-white/[0.05] px-2 py-0.5 rounded-md text-[11px]">
                    {latestResponse.endpoint}
                  </span>
                </div>

                <div className="rounded-2xl bg-zinc-950/80 border border-white/[0.06] p-3.5 overflow-x-auto max-h-72">
                  <pre className="text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(latestResponse.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Perform an action (Register, Login, /me) to inspect live HTTP status and JSON response.
              </div>
            )}
          </GlassCard>

          {/* TA Evaluation Checklist Card */}
          <GlassCard variant="subtle" className="text-left space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Lab 01 Rubric Checklist (100 Marks)
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Register API (15 Marks): bcrypt hash, required fields</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Login API (15 Marks): constant-time bcrypt comparison</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>JWT + Cookie Auth (20 Marks): HttpOnly cookie security</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Protected Profile Route (20 Marks): req.user via middleware</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>MVC Architecture (10 Marks): model, route, controller</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Error Handling & Viva (20 Marks): Clean HTTP status codes</span>
              </li>
              <li className="flex items-center gap-2 text-indigo-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Bonus Challenge (+10 Marks): Change Password API</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
