import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Scale, 
  Zap, 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  Sun, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Leaf,
  Info,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';
import { 
  APPLIANCE_CATALOG, 
  PREBUILT_COMPARISONS, 
  UNKNOWN_WATTAGE_BENCHMARKS 
} from '../data/beforeYouBuyData';

const ALL_CATEGORIES = [
  'Cooling & Ventilation',
  'Kitchen',
  'Laundry & Cleaning',
  'Heating & Water',
  'Entertainment & Computing',
  'Lighting',
  'Other'
];

const BeforeYouBuy = () => {
  const { 
    householdBaseline,
    addAppliance, 
    TARIFF_RATE 
  } = useHouseholdEnergy();

  // Consistent connected baseline from central context
  const baselineBill = householdBaseline?.currentBill && householdBaseline.currentBill > 0
    ? householdBaseline.currentBill
    : 3240;

  const baselineKwh = householdBaseline?.currentMonthlyKwh && householdBaseline.currentMonthlyKwh > 0
    ? householdBaseline.currentMonthlyKwh
    : Math.round(baselineBill / (householdBaseline?.tariffRate || TARIFF_RATE));

  const effectiveTariff = householdBaseline?.tariffRate || TARIFF_RATE || 8.0;

  // Active top mode: 'single' (Analyze Single Appliance) or 'compare' (Compare 2-3 Options)
  const [activeTab, setActiveTab] = useState('single');
  const [addedToast, setAddedToast] = useState({ show: false, name: '' });

  const triggerToast = (name) => {
    setAddedToast({ show: true, name });
    setTimeout(() => setAddedToast({ show: false, name: '' }), 3500);
  };

  // =========================================================
  // SINGLE APPLIANCE STATE
  // =========================================================
  const [category, setCategory] = useState('Cooling & Ventilation');
  const [selectedApplianceId, setSelectedApplianceId] = useState('ac_1_5_ton');
  const [selectedRatingIndex, setSelectedRatingIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [considerSolar, setConsiderSolar] = useState(false);
  const [solarOffsetPercent, setSolarOffsetPercent] = useState(55);
  const [showDetails, setShowDetails] = useState(false);

  // Custom "Other Appliance" state for Single Mode
  const isOther = category === 'Other';
  const [customName, setCustomName] = useState('Air Fryer / Custom Appliance');
  const [customWatts, setCustomWatts] = useState(1400);
  const [isWattageUnknown, setIsWattageUnknown] = useState(false);
  const [customPrice, setCustomPrice] = useState(6500);

  const categoryAppliances = useMemo(() => {
    return APPLIANCE_CATALOG[category] || [];
  }, [category]);

  const activeAppliance = useMemo(() => {
    if (isOther) return null;
    return categoryAppliances.find((a) => a.id === selectedApplianceId) || categoryAppliances[0] || null;
  }, [isOther, categoryAppliances, selectedApplianceId]);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat !== 'Other') {
      const list = APPLIANCE_CATALOG[newCat] || [];
      if (list.length > 0) {
        setSelectedApplianceId(list[0].id);
        setSelectedRatingIndex(0);
        setHoursPerDay(list[0].defaultHours || 6);
        setDaysPerMonth(list[0].defaultDays || 30);
      }
    } else {
      setCustomName('Air Fryer / Custom Appliance');
      setCustomWatts(1400);
      setHoursPerDay(1);
      setDaysPerMonth(25);
    }
  };

  const handleApplianceChange = (appId) => {
    setSelectedApplianceId(appId);
    setSelectedRatingIndex(0);
    const found = categoryAppliances.find((a) => a.id === appId);
    if (found) {
      setHoursPerDay(found.defaultHours || 6);
      setDaysPerMonth(found.defaultDays || 30);
    }
  };

  const currentSpecs = useMemo(() => {
    if (isOther) {
      return {
        name: customName.trim() || 'Custom Appliance',
        pureName: customName.trim() || 'Custom Appliance',
        category: 'Other',
        power: Math.max(1, Number(customWatts) || 100),
        ratingLabel: isWattageUnknown ? 'Estimated Benchmark' : 'Custom Rated',
        price: Number(customPrice) || 12000,
        star: null,
        ecoGrade: null,
        isEstimate: isWattageUnknown
      };
    }

    if (!activeAppliance) {
      return {
        name: 'Appliance',
        pureName: 'Appliance',
        category,
        power: 500,
        ratingLabel: 'Standard',
        price: 15000,
        star: null,
        ecoGrade: null,
        isEstimate: false
      };
    }

    const ratings = activeAppliance.ratings || [];
    const chosen = ratings[selectedRatingIndex] || ratings[0] || { power: 500, price: 15000, label: 'Standard' };

    return {
      name: `${activeAppliance.name} (${chosen.label})`,
      pureName: activeAppliance.name,
      category: activeAppliance.category || category,
      power: chosen.power,
      ratingLabel: chosen.label,
      price: chosen.price || 15000,
      star: chosen.star || null,
      ecoGrade: chosen.ecoGrade || null,
      isEstimate: false
    };
  }, [isOther, customName, customWatts, isWattageUnknown, customPrice, activeAppliance, selectedRatingIndex, category]);

  // Core Calculations for Single Appliance
  const metrics = useMemo(() => {
    const qty = Math.max(1, Number(quantity) || 1);
    const hrs = Math.max(0.1, Number(hoursPerDay) || 1);
    const days = Math.max(1, Math.min(31, Number(daysPerMonth) || 30));
    const power = currentSpecs.power;

    const dailyKwh = (power * hrs * qty) / 1000;
    const rawMonthlyKwh = Math.round(dailyKwh * days * 10) / 10;
    
    let solarSavedKwh = 0;
    let netMonthlyKwh = rawMonthlyKwh;
    if (considerSolar) {
      solarSavedKwh = Math.round(rawMonthlyKwh * (solarOffsetPercent / 100) * 10) / 10;
      netMonthlyKwh = Math.max(0, Math.round((rawMonthlyKwh - solarSavedKwh) * 10) / 10);
    }

    const monthlyCost = Math.round(netMonthlyKwh * effectiveTariff);
    const grossMonthlyCost = Math.round(rawMonthlyKwh * effectiveTariff);
    const solarMonthlySavings = grossMonthlyCost - monthlyCost;
    const yearlyCost = monthlyCost * 12;

    const currentBill = baselineBill;
    const newBill = currentBill + monthlyCost;
    const billIncreasePercent = currentBill > 0 
      ? Math.round(((newBill - currentBill) / currentBill) * 100 * 10) / 10 
      : 0;

    const cost3Year = yearlyCost * 3;
    const cost5Year = yearlyCost * 5;
    const cost10Year = yearlyCost * 10;
    const total5YearOwnership = currentSpecs.price + cost5Year;

    const monthlyCo2Kg = Math.round(rawMonthlyKwh * 0.82);
    const treesEquivalent = Math.max(1, Math.round((monthlyCo2Kg * 12) / 21));

    return {
      dailyKwh: Math.round(dailyKwh * 100) / 100,
      monthlyKwh: rawMonthlyKwh,
      netMonthlyKwh,
      monthlyCost,
      grossMonthlyCost,
      solarMonthlySavings,
      yearlyCost,
      currentBill,
      newBill,
      billIncreasePercent,
      cost3Year,
      cost5Year,
      cost10Year,
      total5YearOwnership,
      monthlyCo2Kg,
      treesEquivalent
    };
  }, [currentSpecs, quantity, hoursPerDay, daysPerMonth, considerSolar, solarOffsetPercent, baselineBill, effectiveTariff]);

  // Efficient Alternative Advisor
  const alternativeInfo = useMemo(() => {
    if (isOther || !activeAppliance || !activeAppliance.efficientAlternative) return null;
    const alt = activeAppliance.efficientAlternative;
    if (selectedRatingIndex === alt.targetRatingIndex) {
      return { isAlreadyBest: true };
    }

    const targetRating = activeAppliance.ratings[alt.targetRatingIndex];
    if (!targetRating) return null;

    const altPower = targetRating.power;
    const qty = Math.max(1, Number(quantity) || 1);
    const hrs = Math.max(0.1, Number(hoursPerDay) || 1);
    const days = Math.max(1, Math.min(31, Number(daysPerMonth) || 30));

    const altMonthlyKwh = Math.round(((altPower * hrs * qty) / 1000) * days * 10) / 10;
    const altMonthlyCost = Math.round(altMonthlyKwh * effectiveTariff);
    const monthlySavings = Math.max(0, metrics.grossMonthlyCost - altMonthlyCost);
    const yearlySavings = monthlySavings * 12;
    const fiveYearSavings = yearlySavings * 5;

    const priceDiff = Math.max(0, targetRating.price - currentSpecs.price);
    const paybackMonths = yearlySavings > 0 ? Math.round((priceDiff / (yearlySavings / 12)) * 10) / 10 : 0;

    return {
      isAlreadyBest: false,
      recommendedName: alt.recommendedName,
      targetRatingIndex: alt.targetRatingIndex,
      reason: alt.reason,
      altPower,
      monthlySavings,
      yearlySavings,
      fiveYearSavings,
      priceDiff,
      paybackMonths
    };
  }, [isOther, activeAppliance, selectedRatingIndex, quantity, hoursPerDay, daysPerMonth, metrics, currentSpecs, effectiveTariff]);

  const handleAddToAppliances = () => {
    const finalName = currentSpecs.pureName 
      ? `${currentSpecs.pureName} (${currentSpecs.ratingLabel})` 
      : currentSpecs.name;

    addAppliance({
      name: finalName,
      category: isOther ? 'Other' : currentSpecs.category,
      power: currentSpecs.power,
      quantity: Math.max(1, Number(quantity) || 1),
      hours: Math.max(0.1, Number(hoursPerDay) || 1),
      days: Math.max(1, Math.min(31, Number(daysPerMonth) || 30))
    });

    triggerToast(finalName);
  };

  // =========================================================
  // COMPARE 2-3 APPLIANCES STATE (UNLIMITED, ANY CATEGORY + CUSTOM)
  // =========================================================
  const [compareCount, setCompareCount] = useState(3); // 2 or 3 appliances
  const [sharedHours, setSharedHours] = useState(8);
  const [sharedDays, setSharedDays] = useState(30);

  // Each slot can independently choose ANY category, appliance, rating, or custom "Other"
  const [compareSlots, setCompareSlots] = useState([
    {
      slotId: 1,
      category: 'Cooling & Ventilation',
      applianceId: 'ac_1_5_ton',
      ratingIndex: 0, // 5-Star Inverter
      isCustom: false,
      customName: 'Custom Option A',
      customWatts: 1100,
      customPrice: 42990
    },
    {
      slotId: 2,
      category: 'Cooling & Ventilation',
      applianceId: 'ac_1_5_ton',
      ratingIndex: 2, // 3-Star Inverter
      isCustom: false,
      customName: 'Custom Option B',
      customWatts: 1550,
      customPrice: 32990
    },
    {
      slotId: 3,
      category: 'Cooling & Ventilation',
      applianceId: 'ac_1_5_ton',
      ratingIndex: 3, // 3-Star Non-Inverter
      isCustom: false,
      customName: 'Custom Option C',
      customWatts: 1800,
      customPrice: 27990
    }
  ]);

  // Load one of the prebuilt quick comparisons into the slots
  const handleLoadPrebuilt = (presetId) => {
    const preset = PREBUILT_COMPARISONS.find(p => p.id === presetId);
    if (!preset) return;

    setSharedHours(preset.hours || 8);
    setSharedDays(preset.days || 30);
    setCompareCount(Math.min(3, Math.max(2, preset.options.length)));

    const newSlots = preset.options.slice(0, 3).map((opt, idx) => ({
      slotId: idx + 1,
      category: opt.category || preset.category || 'Cooling & Ventilation',
      applianceId: 'custom',
      ratingIndex: 0,
      isCustom: true,
      customName: opt.name,
      customWatts: opt.power,
      customPrice: opt.price,
      highlight: opt.highlight
    }));

    // Ensure we have 3 slots populated in state even if only 2 are displayed
    while (newSlots.length < 3) {
      newSlots.push({
        slotId: newSlots.length + 1,
        category: 'Other',
        applianceId: 'custom',
        ratingIndex: 0,
        isCustom: true,
        customName: 'Alternative Appliance',
        customWatts: 1000,
        customPrice: 15000
      });
    }

    setCompareSlots(newSlots);
  };

  // Update an individual slot
  const updateSlot = (slotIdx, updates) => {
    setCompareSlots(prev => {
      const copy = [...prev];
      copy[slotIdx] = { ...copy[slotIdx], ...updates };
      return copy;
    });
  };

  // Computed results for each compared appliance
  const computedComparedAppliances = useMemo(() => {
    const activeSlots = compareSlots.slice(0, compareCount);

    return activeSlots.map((slot, idx) => {
      let name = '';
      let power = 100;
      let price = 10000;
      let ratingLabel = '';
      let categoryName = slot.category;

      if (slot.isCustom || slot.category === 'Other') {
        name = slot.customName || `Option ${idx + 1}`;
        power = Math.max(1, Number(slot.customWatts) || 100);
        price = Math.max(0, Number(slot.customPrice) || 0);
        ratingLabel = 'Custom Specification';
      } else {
        const catList = APPLIANCE_CATALOG[slot.category] || [];
        const appObj = catList.find(a => a.id === slot.applianceId) || catList[0];
        if (appObj) {
          const ratings = appObj.ratings || [];
          const rObj = ratings[slot.ratingIndex] || ratings[0] || { power: 500, price: 10000, label: 'Standard' };
          name = `${appObj.name} (${rObj.label})`;
          power = rObj.power;
          price = rObj.price || 10000;
          ratingLabel = rObj.label;
        } else {
          name = slot.customName || `Option ${idx + 1}`;
          power = slot.customWatts || 500;
          price = slot.customPrice || 10000;
          ratingLabel = 'Standard';
        }
      }

      // Calculations required by prompt:
      // Additional kWh/month, Additional monthly cost, Additional yearly cost, Current bill, New estimated bill, Bill increase percentage
      const dailyKwh = (power * sharedHours) / 1000;
      const additionalMonthlyKwh = Math.round(dailyKwh * sharedDays * 10) / 10;
      const additionalMonthlyCost = Math.round(additionalMonthlyKwh * effectiveTariff);
      const additionalYearlyCost = additionalMonthlyCost * 12;
      const currentBill = baselineBill;
      const newEstimatedBill = currentBill + additionalMonthlyCost;
      const billIncreasePercent = currentBill > 0 
        ? Math.round(((newEstimatedBill - currentBill) / currentBill) * 100 * 10) / 10 
        : 0;

      const fiveYearCost = additionalYearlyCost * 5;
      const total5YearOwnership = price + fiveYearCost;

      return {
        slotIndex: idx,
        slotNumber: idx + 1,
        category: categoryName,
        name,
        power,
        price,
        ratingLabel,
        highlight: slot.highlight,
        additionalMonthlyKwh,
        additionalMonthlyCost,
        additionalYearlyCost,
        currentBill,
        newEstimatedBill,
        billIncreasePercent,
        fiveYearCost,
        total5YearOwnership
      };
    });
  }, [compareSlots, compareCount, sharedHours, sharedDays, baselineBill, effectiveTariff]);

  // Determine winning options in comparison
  const lowestRunningCostOption = useMemo(() => {
    if (!computedComparedAppliances.length) return null;
    return [...computedComparedAppliances].sort((a, b) => a.additionalMonthlyCost - b.additionalMonthlyCost)[0];
  }, [computedComparedAppliances]);

  const lowestTotalOwnershipOption = useMemo(() => {
    if (!computedComparedAppliances.length) return null;
    return [...computedComparedAppliances].sort((a, b) => a.total5YearOwnership - b.total5YearOwnership)[0];
  }, [computedComparedAppliances]);

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {addedToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-500 text-slate-950 font-bold px-5 py-3.5 rounded-2xl shadow-2xl shadow-cyan-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <div>
            <p className="text-sm">Added to Household Inventory!</p>
            <p className="text-xs font-normal text-slate-900">
              <strong>{addedToast.name}</strong> is now synced to your <Link to="/dashboard/appliances" className="underline font-bold">Appliances</Link> tab.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-white">Before You Buy</h1>
            <ConnectedDataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Evaluate exact monthly power bills, compare 2–3 appliances side-by-side, and calculate 5-year running costs before bringing any new appliance home.
          </p>
        </div>

        {/* Connected Household Baseline Snapshot */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl text-xs">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <span className="text-slate-400">Current Household Bill:</span>
            <span className="font-bold text-white font-mono text-sm">₹{baselineBill.toLocaleString()}/mo</span>
            <span className="text-slate-500 text-[11px]">({baselineKwh} kWh)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Tariff Rate: <strong className="text-cyan-400 font-mono">₹{effectiveTariff}/kWh</strong>
          </div>
        </div>
      </header>

      {/* Navigation Mode Tabs: Single vs Compare 2-3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
          <button
            id="single-appliance-mode-tab"
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Single Appliance Impact</span>
          </button>

          <button
            id="compare-appliances-mode-tab"
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Compare 2–3 Selected Appliances</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Connected to {householdBaseline?.sourceLabel || 'Household Baseline'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: SINGLE APPLIANCE IMPACT ANALYSIS */}
      {/* ========================================================= */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Controls & Config (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Select Any Appliance
                </h3>
                <span className="text-xs text-slate-400">Step-by-step</span>
              </div>

              {/* 1. Category Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {cat === 'Other' ? '+ Other Appliance' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Appliance Selector OR Custom Appliance Form */}
              {!isOther ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Appliance Model</label>
                    <select
                      id="single-appliance-model-select"
                      value={selectedApplianceId}
                      onChange={(e) => handleApplianceChange(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    >
                      {categoryAppliances.map((app) => (
                        <option key={app.id} value={app.id} className="bg-slate-900">
                          {app.name}
                        </option>
                      ))}
                    </select>
                    {activeAppliance && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">{activeAppliance.description}</p>
                    )}
                  </div>

                  {/* Rating / Efficiency Selector */}
                  {activeAppliance && activeAppliance.ratings && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Efficiency Star Rating / Model Spec
                      </label>
                      <div className="space-y-2">
                        {activeAppliance.ratings.map((rate, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedRatingIndex(idx)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              selectedRatingIndex === idx
                                ? 'bg-cyan-500/10 border-cyan-500 text-white'
                                : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selectedRatingIndex === idx
                                    ? 'border-cyan-400 bg-cyan-400'
                                    : 'border-slate-500'
                                }`}
                              >
                                {selectedRatingIndex === idx && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                  {rate.label}
                                  {rate.star && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                      ⭐ {rate.star}-Star
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Rated Draw: <strong className="text-cyan-300">{rate.power}W</strong> • Approx Price: ₹{rate.price?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {rate.ecoGrade && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                                {rate.ecoGrade}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Custom "Other Appliance" Input */
                <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Custom Appliance Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="single-custom-appliance-name"
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Air Fryer, Dehumidifier, EV Charger"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Power Rating (Watts) <span className="text-cyan-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsWattageUnknown(!isWattageUnknown)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        {isWattageUnknown ? 'Enter exact wattage' : "Don't know wattage? Use typical estimate"}
                      </button>
                    </div>

                    {!isWattageUnknown ? (
                      <input
                        id="single-custom-appliance-watts"
                        type="number"
                        min="1"
                        max="25000"
                        value={customWatts}
                        onChange={(e) => setCustomWatts(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                      />
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-2 gap-2">
                          {UNKNOWN_WATTAGE_BENCHMARKS.map((bench) => (
                            <button
                              key={bench.watts}
                              type="button"
                              onClick={() => setCustomWatts(bench.watts)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                customWatts === bench.watts
                                  ? 'bg-cyan-500/20 border-cyan-400 text-white'
                                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <div className="font-bold text-xs text-cyan-300">{bench.watts}W</div>
                              <div className="text-[10px] text-slate-300 font-medium">{bench.label}</div>
                            </button>
                          ))}
                        </div>
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-300 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Using approximate benchmark estimate (~{customWatts}W).</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Estimated Purchase Price (₹)
                    </label>
                    <input
                      id="single-custom-appliance-price"
                      type="number"
                      min="100"
                      step="500"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* 3. Quantity & Usage Simulator Controls */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-white text-sm font-mono">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hours Per Day Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Expected Daily Run Time</label>
                    <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      {hoursPerDay} Hours / Day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>30m</span>
                    <span>4h</span>
                    <span>8h</span>
                    <span>12h</span>
                    <span>24h</span>
                  </div>
                </div>

                {/* Days Per Month */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">Operating Days / Month</label>
                    <span className="text-xs font-bold text-white font-mono">{daysPerMonth} Days</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="31"
                    step="1"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Solar Consideration Toggle */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Factor In Rooftop Solar</span>
                  </div>
                  <input
                    type="checkbox"
                    id="single-solar-toggle"
                    checked={considerSolar}
                    onChange={(e) => setConsiderSolar(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                </div>
                {considerSolar && (
                  <div className="pt-2 text-[11px] text-slate-300 space-y-1.5 border-t border-white/5">
                    <p className="text-amber-300 font-medium">
                      ☀️ Solar absorption: ~{solarOffsetPercent}% of appliance load powered by daytime sunshine.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Daytime Solar Coverage:</span>
                      <input
                        type="range"
                        min="20"
                        max="90"
                        step="5"
                        value={solarOffsetPercent}
                        onChange={(e) => setSolarOffsetPercent(Number(e.target.value))}
                        className="w-24 accent-amber-400 h-1.5 bg-slate-900 rounded cursor-pointer"
                      />
                      <span className="font-mono text-white font-bold">{solarOffsetPercent}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Add to Appliances Tab */}
              <button
                id="single-add-to-appliances-btn"
                type="button"
                onClick={handleAddToAppliances}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add This Appliance to My Appliances Tab
              </button>
            </div>

            {/* RIGHT COLUMN: Results & Impact Display (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Status Header Bar for Active Selected Device */}
              <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{currentSpecs.name}</h2>
                    {currentSpecs.isEstimate && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Estimated Watts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {quantity} unit{quantity > 1 ? 's' : ''} • {currentSpecs.power}W each • {hoursPerDay} hrs/day • {daysPerMonth} days/mo
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Est. Purchase Price</span>
                  <span className="text-base font-bold text-white">₹{currentSpecs.price?.toLocaleString()}</span>
                </div>
              </div>

              {/* 1. PRIMARY METRIC CARDS: Additional kWh, Additional monthly cost, Additional yearly cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Additional monthly kWh */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Additional Monthly kWh</p>
                  <p className="text-2xl font-bold text-white mt-1 font-mono">
                    +{metrics.monthlyKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
                  </p>
                  {considerSolar && (
                    <p className="text-[11px] text-amber-400 mt-1 font-medium">
                      ☀️ Net grid: +{metrics.netMonthlyKwh} kWh
                    </p>
                  )}
                </div>

                {/* Additional monthly cost */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden group hover:border-green-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-3">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Additional Monthly Cost</p>
                  <p className="text-2xl font-bold text-green-400 mt-1 font-mono">
                    +₹{metrics.monthlyCost.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">@ ₹{effectiveTariff}/kWh tariff</p>
                </div>

                {/* Additional yearly cost */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Additional Yearly Cost</p>
                  <p className="text-2xl font-bold text-white mt-1 font-mono">
                    +₹{metrics.yearlyCost.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Annual power bill burden</p>
                </div>
              </div>

              {/* 2. BILL IMPACT COMPARISON CARD: Current bill, New estimated bill, Bill increase percentage */}
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Electricity Bill Impact Preview
                  </h4>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    +{metrics.billIncreasePercent}% Increase in Total Bill
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-400">Current Household Bill</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {householdBaseline?.sourceLabel ? 'Connected' : 'Baseline'}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-200 mt-1 font-mono">
                      ₹{metrics.currentBill.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ month</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={householdBaseline?.sourceLabel}>
                      {householdBaseline?.sourceLabel || 'Based on active household data'}
                    </p>
                  </div>

                  <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/30">
                    <p className="text-xs text-cyan-300 font-semibold">New Estimated Bill (With This Appliance)</p>
                    <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">
                      ₹{metrics.newBill.toLocaleString()} <span className="text-xs text-cyan-300 font-normal">/ month</span>
                    </p>
                    <p className="text-[11px] text-cyan-200/70 mt-0.5">
                      +₹{metrics.monthlyCost.toLocaleString()} added to monthly electricity expenses
                    </p>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Base Household ({Math.max(1, Math.round((metrics.currentBill / Math.max(1, metrics.newBill)) * 100))}%)</span>
                    <span>New Appliance (+{Math.max(1, Math.round((metrics.monthlyCost / Math.max(1, metrics.newBill)) * 100))}%)</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="bg-slate-500 h-full"
                      style={{ width: `${(metrics.currentBill / Math.max(1, metrics.newBill)) * 100}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full"
                      style={{ width: `${(metrics.monthlyCost / Math.max(1, metrics.newBill)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. ENERGY-EFFICIENT ALTERNATIVES ADVISOR */}
              {alternativeInfo && !alternativeInfo.isAlreadyBest && (
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Energy-Efficient Alternative Available
                        </h4>
                        <h5 className="text-sm font-bold text-white mt-0.5">
                          {alternativeInfo.recommendedName}
                        </h5>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRatingIndex(alternativeInfo.targetRatingIndex)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      Apply Alternative
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{alternativeInfo.reason}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs border-t border-emerald-500/20">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Annual Savings</span>
                      <strong className="text-emerald-400 font-mono">₹{alternativeInfo.yearlySavings.toLocaleString()} / yr</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">5-Year Savings</span>
                      <strong className="text-emerald-400 font-mono">₹{alternativeInfo.fiveYearSavings.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Payback on Price Diff</span>
                      <strong className="text-white font-mono">
                        {alternativeInfo.paybackMonths > 0 ? `~${alternativeInfo.paybackMonths} Months` : 'Instant'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. LONG-TERM 5-YEAR RUNNING COST */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" /> Long-Term Running Cost Projections
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      The "Appliance Iceberg Effect": Electricity running costs often exceed sticker prices over time.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">1-Year Cost</span>
                    <p className="text-base font-bold text-white font-mono mt-1">₹{metrics.yearlyCost.toLocaleString()}</p>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">3-Year Cost</span>
                    <p className="text-base font-bold text-white font-mono mt-1">₹{metrics.cost3Year.toLocaleString()}</p>
                  </div>

                  {/* 5-Year Cost Highlight */}
                  <div className="bg-cyan-500/10 p-3.5 rounded-2xl border border-cyan-500/40 relative">
                    <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">5-Year Cost (Focus)</span>
                    <p className="text-lg font-black text-cyan-400 font-mono mt-1">₹{metrics.cost5Year.toLocaleString()}</p>
                    <span className="text-[9px] text-cyan-300/80 block mt-0.5">Running Electricity</span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">10-Year Cost</span>
                    <p className="text-base font-bold text-white font-mono mt-1">₹{metrics.cost10Year.toLocaleString()}</p>
                  </div>
                </div>

                {/* 5-Year Total Cost of Ownership Snapshot */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Total 5-Year Cost of Ownership (Purchase + Electricity):</span>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">
                      ₹{metrics.total5YearOwnership.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-400 text-left sm:text-right">
                    Sticker: ₹{currentSpecs.price?.toLocaleString()} + Running: ₹{metrics.cost5Year.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 5. "SEE DETAILS" COLLAPSIBLE DRAWER */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      {showDetails ? 'Hide Detailed Technical & Environmental Breakdown' : 'See Details (Calculations, Carbon Footprint & Tariff Breakdown)'}
                    </span>
                  </div>
                  {showDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showDetails && (
                  <div className="p-6 border-t border-white/10 space-y-6 text-xs text-slate-300">
                    <div>
                      <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                        Operational Cost Spectrum
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[10px] uppercase">Daily</span>
                          <p className="font-bold text-white font-mono mt-1">₹{Math.round(metrics.monthlyCost / 30)}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{metrics.dailyKwh} kWh</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[10px] uppercase">Weekly</span>
                          <p className="font-bold text-white font-mono mt-1">₹{Math.round((metrics.monthlyCost / 30) * 7)}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{(metrics.dailyKwh * 7).toFixed(1)} kWh</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[10px] uppercase">Monthly</span>
                          <p className="font-bold text-cyan-400 font-mono mt-1">₹{metrics.monthlyCost}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{metrics.monthlyKwh} kWh</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                          <span className="text-slate-400 text-[10px] uppercase">Quarterly (3 Mo)</span>
                          <p className="font-bold text-white font-mono mt-1">₹{metrics.monthlyCost * 3}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{(metrics.monthlyKwh * 3).toFixed(1)} kWh</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                          <Leaf className="w-4 h-4" />
                        </div>
                        <div>
                          <h6 className="font-bold text-white text-xs">Carbon Footprint Impact</h6>
                          <p className="text-[11px] text-slate-400">
                            Adds ~{metrics.monthlyCo2Kg} kg CO₂ / month (~{(metrics.monthlyCo2Kg * 12).toLocaleString()} kg/yr) to household emissions.
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Tree Offset Equivalent</span>
                        <span className="text-green-400 font-bold font-mono">~{metrics.treesEquivalent} Trees / Year</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-white/5">
                      <h6 className="font-bold text-white text-xs">Calculation Methodology</h6>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-900 p-2 rounded-lg">
                        Additional Monthly kWh = ({currentSpecs.power}W × {hoursPerDay} hrs × {daysPerMonth} days × {quantity} unit) ÷ 1,000 = {metrics.monthlyKwh} kWh
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-900 p-2 rounded-lg">
                        Additional Monthly Cost = {metrics.monthlyKwh} kWh × ₹{effectiveTariff}/kWh tariff = ₹{metrics.monthlyCost}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-900 p-2 rounded-lg">
                        New Estimated Bill = Current Bill (₹{metrics.currentBill}) + Additional Monthly Cost (₹{metrics.monthlyCost}) = ₹{metrics.newBill} (+{metrics.billIncreasePercent}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPARE 2–3 SELECTED APPLIANCES (ANY CATEGORY + CUSTOM) */}
      {/* ========================================================= */}
      {activeTab === 'compare' && (
        <div className="space-y-8">
          {/* Comparison Header & Controls */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" /> Side-by-Side Model Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose <strong>ANY 2 or 3 appliances</strong> across any category (or custom appliances) to compare their exact kWh, bill increase, and 5-year running cost.
                </p>
              </div>

              {/* Slot Count Selector (Compare 2 vs Compare 3) */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Comparison Slots:</span>
                <div className="bg-slate-900 border border-white/10 p-1 rounded-xl flex">
                  <button
                    id="compare-2-slots-btn"
                    type="button"
                    onClick={() => setCompareCount(2)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      compareCount === 2
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2 Appliances
                  </button>
                  <button
                    id="compare-3-slots-btn"
                    type="button"
                    onClick={() => setCompareCount(3)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      compareCount === 3
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    3 Appliances
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets Shortcuts */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Quick Preset Showdowns (Or customize below):
              </label>
              <div className="flex flex-wrap gap-2">
                {PREBUILT_COMPARISONS.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleLoadPrebuilt(comp.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{comp.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shared Operational Runtime Simulator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-300 font-medium">Daily Runtime (Hours / Day)</span>
                  <span className="text-cyan-400 font-bold font-mono bg-cyan-500/10 px-2 py-0.5 rounded">
                    {sharedHours} hrs/day
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={sharedHours}
                  onChange={(e) => setSharedHours(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-300 font-medium">Operating Days / Month</span>
                  <span className="text-white font-bold font-mono bg-white/10 px-2 py-0.5 rounded">
                    {sharedDays} days/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="31"
                  step="1"
                  value={sharedDays}
                  onChange={(e) => setSharedDays(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2 or 3 Appliance Config & Comparison Grid */}
          <div className={`grid grid-cols-1 ${compareCount === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
            {computedComparedAppliances.map((opt, i) => {
              const slot = compareSlots[i];
              const isWinnerOwnership = lowestTotalOwnershipOption && lowestTotalOwnershipOption.slotIndex === i;
              const isLowestRunning = lowestRunningCostOption && lowestRunningCostOption.slotIndex === i;

              const catList = APPLIANCE_CATALOG[slot.category] || [];
              const currentAppObj = catList.find(a => a.id === slot.applianceId) || catList[0];
              const ratingsList = currentAppObj ? (currentAppObj.ratings || []) : [];

              return (
                <div
                  key={i}
                  className={`bg-white/5 border rounded-3xl p-5 sm:p-6 relative flex flex-col justify-between transition-all space-y-6 ${
                    isWinnerOwnership
                      ? 'border-cyan-500/80 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      Option {i + 1}
                    </span>

                    {isWinnerOwnership && (
                      <span className="bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Best 5-Yr Value
                      </span>
                    )}

                    {!isWinnerOwnership && isLowestRunning && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        Lowest kWh
                      </span>
                    )}
                  </div>

                  {/* SLOT CONFIGURATION CONTROLS */}
                  <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-white/5">
                    {/* Category Selector */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Category
                      </label>
                      <select
                        value={slot.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          if (newCat === 'Other') {
                            updateSlot(i, {
                              category: 'Other',
                              isCustom: true,
                              customName: `Custom Appliance ${i + 1}`,
                              customWatts: 1200,
                              customPrice: 15000
                            });
                          } else {
                            const newCatList = APPLIANCE_CATALOG[newCat] || [];
                            const firstApp = newCatList[0];
                            updateSlot(i, {
                              category: newCat,
                              applianceId: firstApp ? firstApp.id : '',
                              ratingIndex: 0,
                              isCustom: false
                            });
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        {ALL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-900">
                            {cat === 'Other' ? '+ Other Appliance (Custom)' : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Appliance Model OR Custom Inputs */}
                    {!slot.isCustom && slot.category !== 'Other' ? (
                      <>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Appliance Model
                          </label>
                          <select
                            value={slot.applianceId}
                            onChange={(e) => {
                              updateSlot(i, {
                                applianceId: e.target.value,
                                ratingIndex: 0
                              });
                            }}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                          >
                            {catList.map(app => (
                              <option key={app.id} value={app.id} className="bg-slate-900">
                                {app.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rating / Efficiency Spec */}
                        {ratingsList.length > 0 && (
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              Star Rating / Spec
                            </label>
                            <select
                              value={slot.ratingIndex}
                              onChange={(e) => updateSlot(i, { ratingIndex: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                              {ratingsList.map((r, rIdx) => (
                                <option key={rIdx} value={rIdx} className="bg-slate-900">
                                  {r.label} ({r.power}W - ₹{r.price?.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Custom Appliance Fields */
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Appliance Name
                          </label>
                          <input
                            type="text"
                            value={slot.customName}
                            onChange={(e) => updateSlot(i, { customName: e.target.value })}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Watts (W)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={slot.customWatts}
                              onChange={(e) => updateSlot(i, { customWatts: Math.max(1, Number(e.target.value)) })}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                              Sticker Price (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={slot.customPrice}
                              onChange={(e) => updateSlot(i, { customPrice: Math.max(0, Number(e.target.value)) })}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTIVE APPLIANCE TITLE & PRICE/WATTS */}
                  <div>
                    <h4 className="text-base font-bold text-white line-clamp-2">{opt.name}</h4>
                    <p className="text-xs text-cyan-300 font-medium mt-0.5">{opt.ratingLabel}</p>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-white/5 text-xs mt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Sticker Price</span>
                        <strong className="text-sm font-bold text-white font-mono">₹{opt.price.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Power Rating</span>
                        <strong className="text-sm font-bold text-cyan-400 font-mono">{opt.power} Watts</strong>
                      </div>
                    </div>
                  </div>

                  {/* ALL REQUIRED ESTIMATED METRICS (Direct prompt requirements) */}
                  <div className="space-y-2.5 text-xs bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    {/* 1. Additional kWh/month */}
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-400">Additional kWh / month:</span>
                      <span className="font-bold text-white font-mono">+{opt.additionalMonthlyKwh} kWh</span>
                    </div>

                    {/* 2. Additional monthly cost */}
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-400">Additional monthly cost:</span>
                      <span className="font-bold text-green-400 font-mono">+₹{opt.additionalMonthlyCost.toLocaleString()}</span>
                    </div>

                    {/* 3. Additional yearly cost */}
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-400">Additional yearly cost:</span>
                      <span className="font-bold text-white font-mono">+₹{opt.additionalYearlyCost.toLocaleString()}</span>
                    </div>

                    {/* 4. Current bill */}
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-400">Current bill:</span>
                      <span className="font-bold text-slate-300 font-mono">₹{opt.currentBill.toLocaleString()}</span>
                    </div>

                    {/* 5. New estimated bill */}
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-cyan-300 font-semibold">New estimated bill:</span>
                      <span className="font-bold text-cyan-400 font-mono text-sm">₹{opt.newEstimatedBill.toLocaleString()}</span>
                    </div>

                    {/* 6. Bill increase percentage */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-amber-400 font-semibold">Bill increase:</span>
                      <span className="font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                        +{opt.billIncreasePercent}%
                      </span>
                    </div>
                  </div>

                  {/* 5-Year Total Cost of Ownership */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                      Total 5-Yr Ownership Cost
                    </span>
                    <p className="text-xl font-black text-white font-mono mt-0.5">
                      ₹{opt.total5YearOwnership.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Sticker ₹{opt.price.toLocaleString()} + 5-Yr Power ₹{opt.fiveYearCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Add to Appliances Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      addAppliance({
                        name: opt.name,
                        category: opt.category || 'Cooling & Ventilation',
                        power: opt.power,
                        quantity: 1,
                        hours: sharedHours,
                        days: sharedDays
                      });
                      triggerToast(opt.name);
                    }}
                    className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add to My Appliances
                  </button>
                </div>
              );
            })}
          </div>

          {/* Payback & Economic Verdict Insight Banner */}
          {computedComparedAppliances.length >= 2 && (
            <div className="bg-slate-900 border border-cyan-500/30 p-6 rounded-3xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Economic Comparison Summary & Verdict
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Lowest Running Electricity Cost:</span>
                  <p className="text-sm font-bold text-emerald-400">{lowestRunningCostOption?.name}</p>
                  <span className="text-xs text-slate-400 font-mono">
                    ₹{lowestRunningCostOption?.additionalMonthlyCost}/mo (+{lowestRunningCostOption?.additionalMonthlyKwh} kWh)
                  </span>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Lowest 5-Year Ownership (Purchase + Power):</span>
                  <p className="text-sm font-bold text-cyan-400">{lowestTotalOwnershipOption?.name}</p>
                  <span className="text-xs text-slate-400 font-mono">
                    ₹{lowestTotalOwnershipOption?.total5YearOwnership?.toLocaleString()} total
                  </span>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Annual Power Bill Savings Spread:</span>
                  {(() => {
                    const sortedByCost = [...computedComparedAppliances].sort((a, b) => a.additionalYearlyCost - b.additionalYearlyCost);
                    const minYearly = sortedByCost[0].additionalYearlyCost;
                    const maxYearly = sortedByCost[sortedByCost.length - 1].additionalYearlyCost;
                    const diffYearly = maxYearly - minYearly;
                    return (
                      <>
                        <p className="text-sm font-bold text-white font-mono">₹{diffYearly.toLocaleString()} / year</p>
                        <span className="text-[11px] text-slate-400">
                          Difference between highest and lowest running options
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                Tip: If an appliance will be run for 6+ hours daily (such as an air conditioner or refrigerator), prioritizing 5-star inverter technology will routinely pay back the purchase price difference within 12–18 months.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BeforeYouBuy;
