import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, User, Wrench, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, quickDemoLogin, isAuthenticated, user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(searchParams.get('role') || 'household');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password, role);
      if (res.user.role === 'provider') {
        navigate('/provider');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (demoRole) => {
    setError('');
    setIsSubmitting(true);
    try {
      const res = await quickDemoLogin(demoRole);
      if (res.user.role === 'provider') {
        navigate('/provider');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Could not log in with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/25">
            <Zap className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">
            Sign in to access your smart household energy dashboard
          </p>
        </div>

        {/* If already logged in, provide easy resumption */}
        {isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-slate-200 text-sm">
            <div className="flex items-center gap-2 mb-2 font-medium text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Signed in as {user.full_name} ({user.role})</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => navigate(user.role === 'provider' ? '/provider' : '/dashboard')}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-2 px-3 rounded-xl text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Pre-configured Demo Accounts */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2.5 px-0.5 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pre-Seeded Demo Accounts</span>
            </div>
            <span className="text-[10px] text-slate-400 normal-case">Exact credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              id="demo-login-household-btn"
              onClick={() => handleDemoClick('household')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex flex-col gap-1 transition-all text-left"
              title="Click to sign in with seeded household credentials"
            >
              <div className="flex items-center gap-1.5 font-semibold text-cyan-200">
                <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Household Demo</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">household@example.com</div>
              <div className="text-[10px] text-slate-400">Pass: <span className="text-slate-300 font-mono">password123</span></div>
            </button>
            <button
              type="button"
              id="demo-login-provider-btn"
              onClick={() => handleDemoClick('provider')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium flex flex-col gap-1 transition-all text-left"
              title="Click to sign in with seeded provider credentials"
            >
              <div className="flex items-center gap-1.5 font-semibold text-blue-200">
                <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Provider Demo</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">provider@example.com</div>
              <div className="text-[10px] text-slate-400">Pass: <span className="text-slate-300 font-mono">password123</span></div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 w-full"></div>
          <span className="bg-slate-900 px-3 text-xs text-slate-500 font-medium uppercase">Or Sign In with Registered Account</span>
          <div className="border-t border-white/10 w-full"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex flex-col gap-1.5 animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="font-semibold shrink-0">Authentication Error:</span>
              <span>{error}</span>
            </div>
            {error.toLowerCase().includes("no account found") && (
              <div className="pt-1 text-xs text-slate-300 border-t border-red-500/10 flex items-center justify-between">
                <span>Need to register this email?</span>
                <Link to={`/register?role=${role}`} className="text-cyan-400 font-bold hover:underline">
                  Create Account →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-5 border border-white/5">
          <button
            type="button"
            id="role-select-household-tab"
            onClick={() => setRole('household')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'household'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Household Resident
          </button>
          <button
            type="button"
            id="role-select-provider-tab"
            onClick={() => setRole('provider')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'provider'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Service Provider
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder={role === 'provider' ? 'provider@example.com' : 'household@example.com'}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold text-slate-300">Exact Password</label>
              <span className="text-[11px] text-slate-400">Exact match required</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group mt-2"
          >
            {isSubmitting ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>Sign In as {role === 'provider' ? 'Provider' : 'Household'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-6 text-center text-slate-400 text-xs">
          Don't have an account yet?{' '}
          <Link to={`/register?role=${role}`} className="text-cyan-400 font-bold hover:underline">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
