import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, TrendingUp, DollarSign, Leaf, Info, ArrowRight, Clock, Award, ShieldCheck, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const STATE_CONFIG = {
  'Maharashtra': { tariff: 8.5, sunHours: 5.2 },
  'Delhi': { tariff: 7.0, sunHours: 5.0 },
  'Gujarat': { tariff: 6.8, sunHours: 5.6 },
  'Karnataka': { tariff: 8.0, sunHours: 5.3 },
  'Tamil Nadu': { tariff: 7.2, sunHours: 5.4 },
  'Telangana': { tariff: 7.5, sunHours: 5.4 },
  'Rajasthan': { tariff: 7.8, sunHours: 5.8 },
  'West Bengal': { tariff: 7.6, sunHours: 4.8 },
  'Other': { tariff: 7.5, sunHours: 5.0 },
};

const SolarROI = () => {
  const { householdBaseline } = useHouseholdEnergy();

  const [inputs, setInputs] = useState({
    monthlyBill: householdBaseline?.currentBill || 3500,
    roofArea: 400,
    location: 'Maharashtra',
    sunHours: 5.2
  });
  const [isCalculated, setIsCalculated] = useState(false);

  // Sync with household baseline when available and user hasn't overridden
  useEffect(() => {
    if (householdBaseline?.currentBill && householdBaseline.currentBill > 0) {
      setInputs(prev => ({
        ...prev,
        monthlyBill: householdBaseline.currentBill
      }));
    }
  }, [householdBaseline?.currentBill]);

  const calculateSolar = (bill, area, loc, customSunHrs) => {
    const validBill = Math.max(200, Number(bill) || 3500);
    const validArea = Math.max(50, Number(area) || 400);
    const cfg = STATE_CONFIG[loc] || STATE_CONFIG['Other'];
    const avgTariff = cfg.tariff;
    const sunHrs = Number(customSunHrs) || cfg.sunHours;

    const monthlyKwhTarget = validBill / avgTariff;
    const capacityByArea = validArea / 100; // ~100 sq ft per kWp
    const genPerKwPerMonth = sunHrs * 30 * 0.78; // 0.78 performance ratio
    const capacityByBill = monthlyKwhTarget / Math.max(60, genPerKwPerMonth);

    // Recommended capacity capped to available roof area
    const rawCapacity = Math.min(capacityByArea, Math.max(1, capacityByBill));
    const recommendedCapacity = Math.max(1, Math.round(rawCapacity * 10) / 10);

    const monthlyGenerationKwh = Math.round(recommendedCapacity * genPerKwPerMonth);
    const grossCost = Math.round(recommendedCapacity * 60000); // ₹60k/kWp benchmark

    // PM Surya Ghar Muft Bijli Yojana Central Financial Assistance (Subsidy)
    let subsidy = 0;
    if (recommendedCapacity <= 2) {
      subsidy = Math.round(recommendedCapacity * 30000);
    } else if (recommendedCapacity <= 3) {
      subsidy = Math.round(60000 + (recommendedCapacity - 2) * 18000);
    } else {
      subsidy = 78000; // Cap at ₹78,000 for residential > 3 kWp
    }

    const netCost = Math.max(15000, grossCost - subsidy);
    const monthlySavings = Math.round(Math.min(validBill * 0.95, monthlyGenerationKwh * avgTariff));
    const annualSavings = monthlySavings * 12;
    const paybackYears = Math.round((netCost / Math.max(1000, annualSavings)) * 10) / 10;
    const longTermSavings = Math.round((annualSavings * 25) - netCost);
    const roiPercentage = Math.round((longTermSavings / Math.max(1, netCost)) * 100);
    const co2Reduction = Math.round(recommendedCapacity * 1250);

    return {
      capacity: recommendedCapacity,
      monthlyGen: monthlyGenerationKwh,
      grossCost,
      subsidy,
      netCost,
      monthlySavings,
      annualSavings,
      payback: paybackYears,
      longTermSavings,
      roi: roiPercentage,
      co2: co2Reduction,
      tariff: avgTariff
    };
  };

  const [results, setResults] = useState(() => 
    calculateSolar(inputs.monthlyBill, inputs.roofArea, inputs.location, inputs.sunHours)
  );

  // Automatically recalculate whenever inputs change
  useEffect(() => {
    const updated = calculateSolar(inputs.monthlyBill, inputs.roofArea, inputs.location, inputs.sunHours);
    setResults(updated);
  }, [inputs.monthlyBill, inputs.roofArea, inputs.location, inputs.sunHours]);

  const handleLocationChange = (e) => {
    const newLoc = e.target.value;
    const cfg = STATE_CONFIG[newLoc] || STATE_CONFIG['Other'];
    setInputs((prev) => ({
      ...prev,
      location: newLoc,
      sunHours: cfg.sunHours,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = calculateSolar(inputs.monthlyBill, inputs.roofArea, inputs.location, inputs.sunHours);
    setResults(res);
    setIsCalculated(true);
    setTimeout(() => setIsCalculated(false), 1500);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">Rooftop Solar ROI Calculator</h1>
            <ConnectedDataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm">Estimate rooftop capacity, installation cost, government subsidy, and 25-year financial savings based on your household consumption.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Details Form */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white">Household & Solar Inputs</h3>
            {inputs.monthlyBill !== householdBaseline.currentBill && (
              <button
                type="button"
                onClick={() => setInputs(prev => ({ ...prev, monthlyBill: householdBaseline.currentBill }))}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                title="Reset bill to match current household baseline"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to ₹{householdBaseline.currentBill}
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Avg. Monthly Electricity Bill (₹)</label>
                <span className="text-[10px] text-slate-400">
                  Default: {householdBaseline.sourceLabel}
                </span>
              </div>
              <input 
                type="number" 
                min="200"
                step="100"
                value={inputs.monthlyBill}
                onChange={(e) => setInputs({ ...inputs, monthlyBill: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Available Shade-Free Roof Area (Sq. Ft.)</label>
              <input 
                type="number" 
                min="100"
                step="50"
                value={inputs.roofArea}
                onChange={(e) => setInputs({ ...inputs, roofArea: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">State / Region</label>
              <select
                id="solar-state-select"
                value={inputs.location}
                onChange={handleLocationChange}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all text-sm"
              >
                <option value="Maharashtra" className="bg-slate-900">Maharashtra (₹8.5/kWh, 5.2 hrs sun)</option>
                <option value="Delhi" className="bg-slate-900">Delhi NCR (₹7.0/kWh, 5.0 hrs sun)</option>
                <option value="Gujarat" className="bg-slate-900">Gujarat (₹6.8/kWh, 5.6 hrs sun)</option>
                <option value="Karnataka" className="bg-slate-900">Karnataka (₹8.0/kWh, 5.3 hrs sun)</option>
                <option value="Tamil Nadu" className="bg-slate-900">Tamil Nadu (₹7.2/kWh, 5.4 hrs sun)</option>
                <option value="Telangana" className="bg-slate-900">Telangana / AP (₹7.5/kWh, 5.4 hrs sun)</option>
                <option value="Rajasthan" className="bg-slate-900">Rajasthan (₹7.8/kWh, 5.8 hrs sun)</option>
                <option value="West Bengal" className="bg-slate-900">West Bengal (₹7.6/kWh, 4.8 hrs sun)</option>
                <option value="Other" className="bg-slate-900">Other State (₹7.5/kWh, 5.0 hrs sun)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Peak Sun Hours / Day (Avg: {inputs.sunHours} hrs)</label>
              <input 
                id="solar-sun-hours-input"
                type="number" 
                min="3"
                max="8"
                step="0.1"
                value={inputs.sunHours}
                onChange={(e) => setInputs({ ...inputs, sunHours: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all text-sm"
              />
            </div>

            <button 
              id="recalculate-roi-btn"
              type="submit" 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isCalculated ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>ROI Recalculated!</span>
                </>
              ) : (
                <>
                  <span>Recalculate ROI</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results & Financial Analysis Overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top Capacity & CO2 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-yellow-500/15 via-amber-500/10 to-transparent border border-yellow-500/30 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <Sun className="w-8 h-8 text-yellow-400" />
                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-yellow-500/30">
                  Capacity
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Recommended System</p>
              <h3 className="text-3xl font-black text-white">{results.capacity} <span className="text-base font-bold text-yellow-400">kWp</span></h3>
              <p className="text-[11px] text-slate-400 mt-2">Generates ~{results.monthlyGen} kWh / month</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-transparent border border-green-500/30 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <Leaf className="w-8 h-8 text-green-400" />
                <span className="text-[10px] font-bold bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-500/30">
                  Eco Offset
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Annual CO₂ Reduction</p>
              <h3 className="text-3xl font-black text-white">{results.co2.toLocaleString()} <span className="text-base font-bold text-green-400">kg</span></h3>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">Equivalent to planting ~{Math.round(results.co2 / 20)} trees</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-500/30 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <Award className="w-8 h-8 text-cyan-400" />
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30">
                  25-Yr ROI
                </span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Return on Investment</p>
              <h3 className="text-3xl font-black text-cyan-400">{results.roi}%</h3>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">25-Yr Savings: ₹{results.longTermSavings.toLocaleString()}</p>
            </div>

          </div>

          {/* Financial Breakdown Panel */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Detailed Financial Breakdown</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Gross System Cost
                </p>
                <p className="text-xl font-bold text-white">₹{results.grossCost.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-green-400" /> Govt PM Subsidy
                </p>
                <p className="text-xl font-bold text-green-400">- ₹{results.subsidy.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Zap className="w-4 h-4 text-yellow-400" /> Net Out-Of-Pocket Cost
                </p>
                <p className="text-xl font-bold text-yellow-400">₹{results.netCost.toLocaleString()}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-cyan-400" /> Payback Period
                </p>
                <p className="text-xl font-bold text-cyan-400">{results.payback} Years</p>
              </div>
            </div>

            {/* Savings Timeline */}
            <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
                <span>Estimated Monthly Savings</span>
                <span className="text-green-400 font-bold text-base">₹{results.monthlySavings.toLocaleString()} / month</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-200">
                <span>Estimated Annual Savings</span>
                <span className="text-green-400 font-bold text-base">₹{results.annualSavings.toLocaleString()} / year</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold text-slate-200 pt-2 border-t border-white/10">
                <span>25-Year Cumulative Net Savings</span>
                <span className="text-cyan-400 font-bold text-lg">₹{results.longTermSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* PM Surya Ghar Subsidy Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl flex items-start gap-4 text-left">
            <Info className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-yellow-200/90 leading-relaxed space-y-1">
              <strong className="text-white font-bold block text-sm">PM Surya Ghar: Muft Bijli Yojana Subsidy Applied</strong>
              <p>
                Under current Ministry of New and Renewable Energy (MNRE) guidelines, residential systems up to 2 kW receive ₹30,000/kW and 3 kW systems receive up to ₹78,000 total subsidy.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SolarROI;

