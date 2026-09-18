import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  User, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ShieldCheck, 
  KeyRound,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAuthenticated, user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(searchParams.get('role') || 'household');
  const [email, setEmail] = useState(() => localStorage.getItem('energyq_saved_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('energyq_saved_email'));
  const [error, setError] = useState('');
  const [canAutoRegister, setCanAutoRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Sync role from query param if changed
  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole && (qRole === 'household' || qRole === 'provider')) {
      setRole(qRole);
    }
  }, [searchParams]);

  // Destination resolver: respect saved intended route
  const getRedirectDestination = (userRole) => {
    const fromPath = location.state?.from;
    if (fromPath && typeof fromPath === 'string' && fromPath.startsWith('/')) {
      return fromPath;
    }
    return userRole === 'provider' ? '/provider' : '/dashboard';
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleLoginSubmit = async (e, shouldAutoRegister = false) => {
    if (e) e.preventDefault();
    setError('');
    setCanAutoRegister(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (rememberMe) {
        localStorage.setItem('energyq_saved_email', cleanEmail);
      } else {
        localStorage.removeItem('energyq_saved_email');
      }

      // Login request without forced role mismatch rejection
      const res = await login(cleanEmail, password, role, shouldAutoRegister);
      const destination = getRedirectDestination(res.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to authenticate. Please check your credentials.');
      if (err.canAutoRegister || err.message?.toLowerCase().includes('no account found')) {
        setCanAutoRegister(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async (demoKey) => {
    setError('');
    setCanAutoRegister(false);
    setIsSubmitting(true);
    try {
      let targetEmail = 'household@example.com';
      let targetRole = 'household';
      
      if (demoKey === 'provider') {
        targetEmail = 'provider@example.com';
        targetRole = 'provider';
      } else if (demoKey === 'rohit') {
        targetEmail = 'mulaparthi.rohit1234@gmail.com';
        targetRole = 'household';
      }

      setEmail(targetEmail);
      setPassword('password123');
      setRole(targetRole);

      const res = await login(targetEmail, 'password123', targetRole);
      const destination = getRedirectDestination(res.user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log in with demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = (fillEmail, fillRole) => {
    setEmail(fillEmail);
    setPassword('password123');
    setRole(fillRole);
    setError('');
    setCanAutoRegister(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg p-6 sm:p-9 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link 
            to="/" 
            className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform"
            title="Return to Home"
          >
            <Zap className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Smart Energy Portal</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
            Log in to monitor appliances, forecast consumption, run audits, or schedule certified technicians.
          </p>
        </div>

        {/* Existing Session Alert */}
        {isAuthenticated && user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-slate-200 text-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-white">Active Session Detected</span>
              </div>
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Signed in as <strong className="text-white">{user.full_name}</strong> ({user.email}).
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                id="btn-continue-session"
                onClick={() => navigate(getRedirectDestination(user.role))}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn-switch-account"
                onClick={logout}
                className="bg-white/10 hover:bg-white/15 text-slate-300 font-semibold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </motion.div>
        )}

        {/* 1-Click Fast Demo Accounts */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant 1-Click Test Access</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md font-mono">
              Password: password123
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Household Demo */}
            <div className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 transition-all flex flex-col justify-between gap-2 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs mb-0.5">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Resident</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate" title="household@example.com">
                  household@example.com
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-household"
                  disabled={isSubmitting}
                  onClick={() => handleInstantDemoLogin('household')}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition-colors cursor-pointer text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  title="Autofill credentials to edit"
                  onClick={() => handleFillDemoCredentials('household@example.com', 'household')}
                  className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
                >
                  Fill
                </button>
              </div>
            </div>

            {/* Service Provider Demo */}
            <div className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/25 transition-all flex flex-col justify-between gap-2 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-xs mb-0.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Technician</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate" title="provider@example.com">
                  provider@example.com
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-provider"
                  disabled={isSubmitting}
                  onClick={() => handleInstantDemoLogin('provider')}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition-colors cursor-pointer text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  title="Autofill credentials to edit"
                  onClick={() => handleFillDemoCredentials('provider@example.com', 'provider')}
                  className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
                >
                  Fill
                </button>
              </div>
            </div>

            {/* Rohit Mulaparthi */}
            <div className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 transition-all flex flex-col justify-between gap-2 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Rohit's ID</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate" title="mulaparthi.rohit1234@gmail.com">
                  rohit...gmail.com
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-rohit"
                  disabled={isSubmitting}
                  onClick={() => handleInstantDemoLogin('rohit')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] transition-colors cursor-pointer text-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  title="Autofill credentials to edit"
                  onClick={() => handleFillDemoCredentials('mulaparthi.rohit1234@gmail.com', 'household')}
                  className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-[10px] cursor-pointer"
                >
                  Fill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full"></div>
          <span className="bg-slate-900 px-3 text-[11px] text-slate-400 font-semibold tracking-wider uppercase whitespace-nowrap">
            Account Credentials
          </span>
          <div className="border-t border-white/10 w-full"></div>
        </div>

        {/* Error Notification Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-300 text-xs sm:text-sm space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-200">Unable to Sign In</p>
                  <p className="text-red-300 text-xs mt-0.5">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setError(''); setCanAutoRegister(false); }}
                  className="text-red-400 hover:text-red-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {canAutoRegister && (
                <div className="pt-2 border-t border-red-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-300">Account not found? Create it right now:</span>
                  <button
                    type="button"
                    id="btn-auto-register"
                    disabled={isSubmitting}
                    onClick={() => handleLoginSubmit(null, true)}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create & Sign In in 1-Click</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role Context Segmented Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 ml-1">Account Category</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button
              type="button"
              id="role-select-household-tab"
              onClick={() => setRole('household')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'household'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Household Resident</span>
            </button>
            <button
              type="button"
              id="role-select-provider-tab"
              onClick={() => setRole('provider')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'provider'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Service Provider</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleLoginSubmit(e, false)} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'provider' ? 'provider@example.com' : 'household@example.com'}
                autoComplete="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setPassword('password123')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Use default "password123"
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleKeyUp}
                placeholder="Enter account password"
                autoComplete="current-password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
              <button
                type="button"
                id="btn-toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {capsLockActive && (
              <div className="text-[11px] text-amber-400 flex items-center gap-1 ml-1 pt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>Caps Lock is ON</span>
              </div>
            )}
          </div>

          {/* Remember Me & Help Links */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="login-remember-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
              />
              <span>Remember email</span>
            </label>
            <button
              type="button"
              onClick={() => handleFillDemoCredentials('household@example.com', 'household')}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Trouble logging in?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Securely...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to {role === 'provider' ? 'Provider Portal' : 'Household Dashboard'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="pt-2 border-t border-white/10 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span>New to Smart Energy?</span>
          <Link
            to={`/register?role=${role}`}
            className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-0.5"
          >
            <span>Create free account</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
