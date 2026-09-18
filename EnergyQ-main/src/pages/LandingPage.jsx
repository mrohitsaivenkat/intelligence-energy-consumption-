import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, BarChart3, Sun, ShieldCheck, Headphones, Settings, 
  ArrowRight, FileText, Sparkles, TrendingUp, DollarSign, 
  CheckCircle2, Menu, X, Cpu, ChevronRight, Activity, Shield, ShoppingBag
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      desc: "Interactive charts showing real-time daily, weekly, and monthly consumption patterns across all household appliances.",
      badge: "Real-Time Tracking"
    },
    {
      icon: Sparkles,
      title: "AI Energy Assistant",
      desc: "Mistral AI-powered conversational assistant to answer electricity queries, explain tariff slabs, and give personalized tips.",
      badge: "Mistral LLM"
    },
    {
      icon: Sun,
      title: "Solar ROI Calculator",
      desc: "Personalized solar potential analysis, rooftop area sizing, government subsidy estimation, and payback period calculation.",
      badge: "ROI Simulator"
    },
    {
      icon: FileText,
      title: "Bill Analyzer",
      desc: "Upload PDF or image utility bills to extract line items, detect hidden charges, and verify tariff slab compliance.",
      badge: "PDF Ingestion"
    },
    {
      icon: Settings,
      title: "ML Cost Forecasting",
      desc: "Machine learning models predicting future energy consumption and monthly bills to keep your budget on track.",
      badge: "XGBoost ML"
    },
    {
      icon: Headphones,
      title: "Service Marketplace",
      desc: "Connect instantly with certified local electricians, appliance repair technicians, and solar installation experts.",
      badge: "Certified Pros"
    },
    {
      icon: ShoppingBag,
      title: "Before You Buy Calculator",
      desc: "Simulate electricity bills, compare 5-star energy ratings, and view 5-year running costs before buying any appliance.",
      badge: "Pre-Purchase ROI"
    }
  ];

  const stats = [
    { value: "30%", label: "Average Bill Reduction", sub: "For active users" },
    { value: "50,000+", label: "kWh Monitored", sub: "Across Indian homes" },
    { value: "₹1,200", label: "Avg. Monthly Savings", sub: "Per household" },
    { value: "98.4%", label: "Forecast Accuracy", sub: "ML model confidence" }
  ];

  const steps = [
    {
      num: "01",
      title: "Setup Profile or Upload Bill",
      desc: "Add your household appliances or simply upload your latest electricity bill."
    },
    {
      num: "02",
      title: "AI & ML Usage Analysis",
      desc: "Our algorithms detect energy leaks, peak usage spikes, and tariff optimization opportunities."
    },
    {
      num: "03",
      title: "Lower Your Monthly Bill",
      desc: "Follow personalized recommendations, optimize solar capacity, and save up to 30% monthly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                SMART HOUSEHOLD ENERGY
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                  AI Platform
                </span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Consumption • Analysis • Forecasting</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Live Demo</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-cyan-400 transition-colors">Impact</a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
            >
              Log In
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 py-6 space-y-4"
            >
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 font-medium py-2"
              >
                Features
              </a>
              <a 
                href="#demo" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 font-medium py-2"
              >
                Live Demo
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-cyan-400 font-medium py-2"
              >
                How It Works
              </a>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-white/5 rounded-2xl font-semibold text-slate-200"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-cyan-500 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 md:pt-44 pb-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center">
          
          {/* Top Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI-Powered Energy Intelligence for Indian Households</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] mb-8 max-w-5xl mx-auto"
          >
            Understand Your Energy.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent block sm:inline">
              Reduce Your Bill.
            </span>{' '}
            Power Home Smarter.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Monitor real-time consumption, analyze utility bills with AI, forecast monthly costs with ML models, and calculate rooftop solar ROI for maximum household savings.
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-3 group"
            >
              <Zap className="w-5 h-5 fill-white" />
              Calculate My Savings
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-2xl font-bold text-base backdrop-blur-md transition-all flex items-center justify-center gap-3"
            >
              <FileText className="w-5 h-5 text-cyan-400" />
              Analyze My Bill
            </Link>
          </motion.div>

          {/* Feature Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-slate-400 border-t border-white/10 pt-8"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Real-Time Analytics
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Mistral AI Assistant
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> XGBoost Cost Predictions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Solar ROI Calculator
            </div>
          </motion.div>
        </div>

        {/* Live Interactive Preview Widget */}
        <motion.div 
          id="demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto mt-16 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-cyan-950/50 relative overflow-hidden"
        >
          {/* Top Bar inside Preview */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">Smart Dashboard Preview</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Monitoring Active
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <span className="text-slate-400 text-xs font-medium block mb-1">Current Load</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-400">2.4 kW</div>
              <span className="text-[10px] text-green-400 mt-1 inline-block">Normal peak window</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <span className="text-slate-400 text-xs font-medium block mb-1">Monthly Bill Est.</span>
              <div className="text-xl sm:text-2xl font-black text-white">₹3,240</div>
              <span className="text-[10px] text-slate-400 mt-1 inline-block">Slab Rate: ₹6.50/kWh</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <span className="text-slate-400 text-xs font-medium block mb-1">Monthly Savings</span>
              <div className="text-xl sm:text-2xl font-black text-green-400">₹850</div>
              <span className="text-[10px] text-green-400 mt-1 inline-block">↑ 18% vs last month</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
              <span className="text-slate-400 text-xs font-medium block mb-1">Efficiency Score</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-400">88%</div>
              <span className="text-[10px] text-indigo-300 mt-1 inline-block">Grade A Household</span>
            </div>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-200">Weekly Energy Consumption (kWh)</h4>
              <span className="text-xs text-cyan-400 font-mono">Mon - Sun Average</span>
            </div>
            <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 border-b border-white/10 pb-2">
              {[
                { day: 'Mon', kwh: 12.4, peak: false },
                { day: 'Tue', kwh: 15.1, peak: true },
                { day: 'Wed', kwh: 11.8, peak: false },
                { day: 'Thu', kwh: 18.2, peak: true },
                { day: 'Fri', kwh: 14.0, peak: false },
                { day: 'Sat', kwh: 10.5, peak: false },
                { day: 'Sun', kwh: 9.8, peak: false },
              ].map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      item.peak ? 'bg-gradient-to-t from-cyan-600 to-cyan-400' : 'bg-cyan-500/30 group-hover:bg-cyan-500/50'
                    }`}
                    style={{ height: `${(item.kwh / 20) * 100}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Banner */}
          <div className="flex items-start gap-3 bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-left">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-cyan-200 leading-relaxed">
              <strong className="text-white">AI Energy Tip:</strong> Setting your AC temperature to 24°C instead of 18°C saves approximately ₹450 on your monthly bill while maintaining optimal cooling efficiency.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Impact / Stats Bar */}
      <section id="stats" className="py-16 px-4 bg-slate-900/60 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-slate-300">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities / Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">All-In-One Energy Platform</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Powerful Features Designed for Energy Optimization
            </h3>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Everything you need to monitor power consumption, analyze utility bills, and reduce monthly costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-cyan-500/40 hover:bg-white/[0.05] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                      <f.icon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {f.badge}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{f.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  Explore feature <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Simple Process</h2>
            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">How Smart Energy Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative text-left">
                <div className="text-4xl font-black text-cyan-500/30 mb-4 font-mono">{st.num}</div>
                <h4 className="text-xl font-bold text-white mb-2">{st.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-blue-900/40 to-slate-900 border border-cyan-500/30 backdrop-blur-2xl text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <h3 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Lower Your Electricity Bill?
          </h3>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Join households across India monitoring energy, analyzing bills, and implementing AI recommendations today.
          </p>

          <Link 
            to="/register" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-cyan-500/30 transition-all hover:scale-105"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-xl">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">SMART HOUSEHOLD ENERGY</span>
          </div>

          <div className="flex items-center gap-6 text-xs sm:text-sm">
            <span>© 2026 Smart Energy Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span>Systems Normal (FastAPI + React)</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

