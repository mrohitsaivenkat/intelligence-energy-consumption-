import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Zap, ArrowUpRight, TrendingUp, Info, BarChart, ShieldCheck, RefreshCw } from 'lucide-react';
import { useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const BillAnalyzer = () => {
  const { uploadedBill, saveUploadedBill, clearUploadedBill, householdBaseline } = useHouseholdEnergy();
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'manual'
  const [analyzing, setAnalyzing] = useState(false);
  const [syncToast, setSyncToast] = useState(false);

  const [formData, setFormData] = useState({
    billingPeriod: uploadedBill?.billingPeriod || 'Nov 2023 - Dec 2023',
    unitsConsumed: uploadedBill?.units || 412,
    tariffRate: uploadedBill?.tariffRate || 6.5,
    fixedCharges: uploadedBill?.fixedCharges || 250,
    taxes: uploadedBill?.taxes || 318,
    otherCharges: uploadedBill?.otherCharges || 200,
    discom: uploadedBill?.discom || 'State Electricity Board'
  });

  const [result, setResult] = useState(() => {
    if (uploadedBill && uploadedBill.amount > 0) {
      return {
        period: uploadedBill.billingPeriod,
        units: uploadedBill.units,
        amount: uploadedBill.amount,
        dailyKwh: Math.round((uploadedBill.units / 30) * 10) / 10,
        dailyCost: Math.round(uploadedBill.amount / 30),
        diffPercentage: Math.round(((uploadedBill.units - 320) / 320) * 100),
        breakdown: uploadedBill.breakdown?.length > 0 ? uploadedBill.breakdown : [
          { label: 'Energy Charges (Units x Tariff)', value: Math.round(uploadedBill.units * (uploadedBill.tariffRate || 6.5)) },
          { label: 'Fixed / Connection Charges', value: uploadedBill.fixedCharges || 250 },
          { label: 'Taxes & Electricity Duties', value: uploadedBill.taxes || 300 },
          { label: 'Other Surcharges & Adjustments', value: uploadedBill.otherCharges || 150 }
        ],
        ai_insight: uploadedBill.ai_insight || 'Active analyzed electricity bill for your household.'
      };
    }
    return null;
  });

  const calculateBillAnalysis = (data) => {
    const units = Number(data.unitsConsumed) || 400;
    const rate = Number(data.tariffRate) || 6.5;
    const fixed = Number(data.fixedCharges) || 250;
    const tax = Number(data.taxes) || 300;
    const other = Number(data.otherCharges) || 150;

    const energyCharges = Math.round(units * rate);
    const totalAmount = energyCharges + fixed + tax + other;
    const dailyKwh = Math.round((units / 30) * 10) / 10;
    const dailyCost = Math.round(totalAmount / 30);

    // Benchmarking against average Indian household (320 kWh)
    const benchmarkKwh = 320;
    const diffPercentage = Math.round(((units - benchmarkKwh) / benchmarkKwh) * 100);

    let insight = "";
    if (units > 400) {
      insight = `Your consumption of ${units} kWh exceeds the 400 kWh threshold. You are currently in the highest tariff slab (₹8.50/kWh). Reducing monthly consumption by 25 kWh will shift your bill into a lower slab, saving ~₹650 monthly.`;
    } else if (units > 250) {
      insight = `Your household consumption (${units} kWh) is within normal moderate range. Your main energy drivers are Air Conditioning and Refrigeration. Shifting AC usage to 24°C can lower your monthly bill by ₹400.`;
    } else {
      insight = `Excellent efficiency! Your usage of ${units} kWh is well optimized. Consider adding rooftop solar to completely offset grid consumption and earn net-metering credits.`;
    }

    return {
      period: data.billingPeriod,
      units: units,
      amount: totalAmount,
      dailyKwh: dailyKwh,
      dailyCost: dailyCost,
      diffPercentage: diffPercentage,
      discom: data.discom,
      tariffRate: rate,
      fixedCharges: fixed,
      taxes: tax,
      otherCharges: other,
      breakdown: [
        { label: 'Energy Charges (Units x Tariff)', value: energyCharges },
        { label: 'Fixed / Connection Charges', value: fixed },
        { label: 'Taxes & Electricity Duties', value: tax },
        { label: 'Other Surcharges & Adjustments', value: other }
      ],
      ai_insight: insight
    };
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    setAnalyzing(true);

    setTimeout(() => {
      const res = calculateBillAnalysis(formData);
      setResult(res);

      // Save to centralized household energy state!
      saveUploadedBill({
        amount: res.amount,
        units: res.units,
        billingPeriod: res.period,
        tariffRate: res.tariffRate,
        fixedCharges: res.fixedCharges,
        taxes: res.taxes,
        otherCharges: res.otherCharges,
        discom: res.discom,
        breakdown: res.breakdown,
        ai_insight: res.ai_insight
      });

      setAnalyzing(false);
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 4000);
    }, 1200);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      // Auto populate parsed bill data simulation for demo
      setFormData(prev => ({
        ...prev,
        billingPeriod: 'July 2024 - Utility Bill',
        unitsConsumed: 438,
        tariffRate: 7.2,
        discom: 'MSEDCL / State Electricity Board'
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification when bill is saved to global household profile */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-slate-950 shrink-0" />
          <div>
            <p className="text-sm">Bill Synchronized with Entire App!</p>
            <p className="text-xs font-normal text-slate-900">
              Updated Dashboard, Before You Buy, Solar ROI, and Energy Audit.
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">Electricity Bill Analyzer</h1>
            <ConnectedDataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm">Upload PDF utility bills or enter line items for AI tariff audit & automatic household sync.</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl shrink-0">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'upload' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Upload PDF/Image
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'manual' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Direct Data Entry
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form / File Upload Input Panel */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm h-fit space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">
            {mode === 'upload' ? 'Bill Document Ingestion' : 'Bill Line Item Details'}
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-6">
            {mode === 'upload' ? (
              <div 
                className="border-2 border-dashed border-white/15 rounded-3xl p-8 sm:p-12 text-center hover:border-cyan-500/50 transition-all cursor-pointer group bg-white/[0.02]"
                onClick={() => document.getElementById('bill-upload-input').click()}
              >
                <input 
                  type="file" 
                  id="bill-upload-input" 
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-base font-bold text-white mb-1">
                  {file ? file.name : 'Click or Drag PDF / Image Bill'}
                </p>
                <p className="text-xs text-slate-500">Supports MSEDCL, BESCOM, Tata Power, Adani, BSES & DISCOM bills (Max 10MB)</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Billing Period / Month</label>
                  <input 
                    type="text"
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Total Units Consumed (kWh)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={formData.unitsConsumed}
                      onChange={(e) => setFormData({ ...formData, unitsConsumed: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Tariff Rate (₹ / kWh)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.tariffRate}
                      onChange={(e) => setFormData({ ...formData, tariffRate: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Fixed Charges (₹)</label>
                    <input 
                      type="number"
                      value={formData.fixedCharges}
                      onChange={(e) => setFormData({ ...formData, fixedCharges: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Taxes / Duty (₹)</label>
                    <input 
                      type="number"
                      value={formData.taxes}
                      onChange={(e) => setFormData({ ...formData, taxes: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Other Charges (₹)</label>
                    <input 
                      type="number"
                      value={formData.otherCharges}
                      onChange={(e) => setFormData({ ...formData, otherCharges: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={analyzing}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
              {analyzing ? 'Processing & Auditing Bill...' : 'Analyze & Audit Bill'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" /> Bill Audit Complete
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {result.period}
                </span>
              </div>
              
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Total Consumption</p>
                  <p className="text-xl font-black text-cyan-400">{result.units} <span className="text-xs font-normal">kWh</span></p>
                  <p className="text-[10px] text-slate-400 mt-1">~{result.dailyKwh} kWh / day</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Total Amount</p>
                  <p className="text-xl font-black text-green-400">₹{result.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1">~₹{result.dailyCost} / day</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 mb-1 font-medium">vs Benchmark</p>
                  <p className={`text-xl font-black ${result.diffPercentage > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {result.diffPercentage > 0 ? `+${result.diffPercentage}%` : `${result.diffPercentage}%`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">vs 320 kWh avg home</p>
                </div>
              </div>

              {/* Detailed Itemized Line Items */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Charge Breakdown</p>
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono font-bold text-white">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between items-center text-base">
                  <span className="font-bold text-white">Total Payable Amount</span>
                  <span className="text-2xl font-black text-cyan-400">₹{result.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4 fill-cyan-400" />
                  <span className="text-sm font-bold">AI Tariff & Savings Insights</span>
                </div>
                <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                  "{result.ai_insight}"
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-sm text-center h-full flex flex-col items-center justify-center space-y-4">
              <FileText className="w-16 h-16 text-slate-500" />
              <h3 className="text-lg font-bold text-white">No Active Analysis</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Upload your utility PDF bill or input your current bill details on the left to generate a breakdown and AI recommendation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillAnalyzer;

