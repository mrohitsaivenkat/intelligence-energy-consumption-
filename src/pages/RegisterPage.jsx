import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Mail, Lock, User, Briefcase, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: searchParams.get('role') || 'household',
    business_name: '',
    categories: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(formData);
      if (res.user.role === 'provider') {
        navigate('/provider');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex p-3.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl mb-3 shadow-lg shadow-cyan-500/25">
            <Zap className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join the smart household energy platform</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-2 animate-fade-in">
            <span className="font-semibold shrink-0">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-4 border border-white/5">
            <button
              type="button"
              id="register-role-household-btn"
              onClick={() => setFormData({ ...formData, role: 'household' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                formData.role === 'household'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Household Resident
            </button>
            <button
              type="button"
              id="register-role-provider-btn"
              onClick={() => setFormData({ ...formData, role: 'provider' })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                formData.role === 'provider'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Service Provider
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="register-fullname-input"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                placeholder="e.g. Alex Sharma"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="register-email-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {formData.role === 'provider' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Business Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="register-businessname-input"
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    placeholder="CoolAir Tech Services"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1">Service Categories</label>
                <input
                  id="register-categories-input"
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  placeholder="AC Service, Electrical, Solar Installation"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                placeholder="••••••••"
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
            id="register-submit-btn"
            disabled={isSubmitting}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 group mt-3"
          >
            {isSubmitting ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Sign Up & Access Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-400 text-xs">
          Already have an account?{' '}
          <Link to={`/login?role=${formData.role}`} className="text-cyan-400 font-bold hover:underline">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
