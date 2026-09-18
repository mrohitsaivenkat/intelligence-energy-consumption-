import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Home, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Layers, 
  Flame,
  SunMedium
} from 'lucide-react';
import { useAppliances, useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const HomeEnergyAudit = () => {
  const {
    appliances,
    addAppliance,
    removeAppliance,
    hasAirConditioner,
    detectedAirConditioners,
    detectedAcHours,
    hasWaterHeater,
    detectedWaterHeaters,
    hasLightingInInventory,
    detectedLighting,
    otherAppliances,
    totalMonthlyKwh,
    CATEGORIZED_PRESETS
  } = useAppliances();

  const { householdBaseline } = useHouseholdEnergy();

  const [step, setStep] = useState(1);

  // Quick add form state for inline addition in Step 2
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickCategory, setQuickCategory] = useState('Cooling & Ventilation');
  const [quickPreset, setQuickPreset] = useState('Air Conditioner (1.5 Ton Inverter)');
  const [quickCustomName, setQuickCustomName] = useState('');
  const [quickPower, setQuickPower] = useState(1500);
  const [quickQty, setQuickQty] = useState(1);
  const [quickHours, setQuickHours] = useState(8);
  const [isQuickCustom, setIsQuickCustom] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    homeType: 'Apartment',
    rooms: 3,
    occupants: 4,
    hasSolar: false,
    acUsage: hasAirConditioner ? 'Moderate (4-8 hrs/day)' : 'None',
    acStarRating: '3 Star',
    heatingType: hasWaterHeater ? 'Electric Geyser' : 'None',
    lightingType: hasLightingInInventory ? 'LED' : 'Mixed (LED + CFL)',
    offPeakUsage: 'Sometimes',
    avgBill: householdBaseline?.currentBill && householdBaseline.currentBill > 0 ? householdBaseline.currentBill : 3500,
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  // Keep dynamic defaults in sync with inventory
  useEffect(() => {
    if (householdBaseline?.currentBill && householdBaseline.currentBill > 0) {
      setFormData(prev => ({
        ...prev,
        avgBill: householdBaseline.currentBill
      }));
    }
  }, [householdBaseline?.currentBill]);

  // Keep dynamic defaults in sync with inventory
  useEffect(() => {
    setFormData((prev) => {
      let updatedAcUsage = prev.acUsage;
      let updatedHeatingType = prev.heatingType;
      let updatedLightingType = prev.lightingType;

      if (!hasAirConditioner) {
        updatedAcUsage = 'None';
      } else if (prev.acUsage === 'None') {
        updatedAcUsage = detectedAcHours > 8 
          ? 'Heavy (> 8 hrs/day)' 
          : detectedAcHours >= 4 
          ? 'Moderate (4-8 hrs/day)' 
          : 'Low (< 4 hrs/day)';
      }

      if (!hasWaterHeater && prev.heatingType === 'Electric Geyser') {
        updatedHeatingType = 'None';
      } else if (hasWaterHeater && prev.heatingType === 'None') {
        updatedHeatingType = 'Electric Geyser';
      }

      if (hasLightingInInventory && prev.lightingType === 'Mixed (LED + CFL)') {
        const hasLed = detectedLighting.some((l) => l.name.toLowerCase().includes('led'));
        if (hasLed) updatedLightingType = 'LED';
      }

      return {
        ...prev,
        acUsage: updatedAcUsage,
        heatingType: updatedHeatingType,
        lightingType: updatedLightingType
      };
    });
  }, [hasAirConditioner, hasWaterHeater, hasLightingInInventory, detectedAcHours, detectedLighting]);

  // Quick category change handler
  const handleQuickCategoryChange = (cat) => {
    setQuickCategory(cat);
    if (cat === 'Other') {
      setIsQuickCustom(true);
      setQuickCustomName('');
      setQuickPower(100);
      setQuickHours(2);
    } else {
      setIsQuickCustom(false);
      const list = CATEGORIZED_PRESETS[cat] || [];
      if (list.length > 0) {
        setQuickPreset(list[0].name);
        setQuickCustomName(list[0].name);
        setQuickPower(list[0].power);
        setQuickHours(list[0].hours);
      }
    }
  };

  const handleQuickPresetChange = (presetName) => {
    setQuickPreset(presetName);
    if (presetName === 'ADD_OTHER') {
      setIsQuickCustom(true);
      setQuickCustomName('');
      setQuickPower(100);
      setQuickHours(2);
    } else {
      setIsQuickCustom(false);
      const list = CATEGORIZED_PRESETS[quickCategory] || [];
      const found = list.find((p) => p.name === presetName);
      if (found) {
        setQuickCustomName(found.name);
        setQuickPower(found.power);
        setQuickHours(found.hours);
      }
    }
  };

  const handleQuickAddAppliance = (e) => {
    e.preventDefault();
    const finalName = isQuickCustom ? quickCustomName.trim() : (quickCustomName || quickPreset);
    if (!finalName) return;

    addAppliance({
      name: finalName,
      category: quickCategory,
      power: Number(quickPower) || 100,
      quantity: Math.max(1, Number(quickQty) || 1),
      hours: Math.max(0.1, Number(quickHours) || 1),
      days: 30
    });

    // Reset and close quick add
    setShowQuickAdd(false);
    setQuickCustomName('');
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Generate Audit Report based on inputs AND appliance inventory
  const generateAuditReport = (data) => {
    let score = 84;
    let potentialSavings = 0;
    const recommendations = [];

    // 1. Air Conditioner Logic
    if (!hasAirConditioner || data.acUsage === 'None') {
      score += 6;
    } else {
      if (data.acUsage.includes('Heavy')) {
        score -= 18;
        potentialSavings += 850;
        recommendations.push(
          "Optimize Air Conditioner thermostat: Set cooling temperature to 24°C - 26°C instead of 18°C - 20°C to reduce compressor workload and save up to 24% on cooling electricity."
        );
      } else if (data.acUsage.includes('Moderate')) {
        score -= 8;
        potentialSavings += 450;
        recommendations.push(
          "Use smart timers or Sleep Mode on your AC units to prevent excessive cooling during early morning hours."
        );
      }

      if (data.acStarRating?.includes('3 Star') || data.acStarRating?.includes('Unrated')) {
        score -= 10;
        potentialSavings += 600;
        recommendations.push(
          "Upgrade older or 3-Star ACs to a modern 5-Star Twin Inverter model. 5-Star inverters consume up to 35% less power per cooling season."
        );
      } else if (data.acStarRating?.includes('5 Star')) {
        score += 5;
      }
    }

    // 2. Water Heating Logic
    if (!hasWaterHeater || data.heatingType === 'None') {
      score += 5;
    } else if (data.heatingType === 'Electric Geyser') {
      score -= 12;
      potentialSavings += 500;
      recommendations.push(
        "Install a rooftop Solar Water Heater or set your electric geyser timer to 20 minutes before use instead of keeping it continuously switched on."
      );
    } else if (data.heatingType === 'Gas Geyser') {
      score -= 3;
    } else if (data.heatingType === 'Solar Water Heater') {
      score += 8;
    }

    // 3. Lighting Logic
    if (['LED', 'Smart LED', '100% LED'].includes(data.lightingType)) {
      score += 6;
    } else if (['Incandescent', 'Halogen', 'Incandescent / Halogen'].includes(data.lightingType)) {
      score -= 14;
      potentialSavings += 400;
      recommendations.push(
        "Replace filament/incandescent and halogen bulbs with energy-efficient 9W LED bulbs to cut lighting load by up to 85%."
      );
    } else if (['CFL', 'Fluorescent Tube Light', 'Mixed (LED + CFL)'].includes(data.lightingType)) {
      score -= 6;
      potentialSavings += 220;
      recommendations.push(
        "Upgrade aging fluorescent tube lights and CFL spirals to 20W LED batten tubes for instant flicker-free light and 50% power savings."
      );
    }

    // 4. Inventory-specific advice (Other appliances)
    const hasRefrigerator = appliances.some((a) => a.name.toLowerCase().includes('refrigerator'));
    if (hasRefrigerator) {
      recommendations.push(
        "Refrigerator Maintenance: Ensure at least 3 inches of clearance behind your refrigerator and clean the condenser coils every 6 months to reduce compressor run times."
      );
      potentialSavings += 180;
    }

    const hasWashingMachine = appliances.some((a) => a.name.toLowerCase().includes('washing'));
    if (hasWashingMachine) {
      if (data.offPeakUsage === 'Rarely') {
        recommendations.push(
          "Shift washing machine operation to morning or off-peak hours and wash with cold water (30°C) rather than heated wash cycles to save up to 75% per load."
        );
        potentialSavings += 160;
        score -= 4;
      }
    }

    const hasPump = appliances.some((a) => a.name.toLowerCase().includes('pump'));
    if (hasPump) {
      recommendations.push(
        "Water Pump Optimization: Install an automatic water-level controller to prevent overhead tank overflow and eliminate idle motor pumping."
      );
      potentialSavings += 200;
    }

    // 5. Solar Logic
    if (!data.hasSolar) {
      score -= 8;
      potentialSavings += 1400;
      recommendations.push(
        "Rooftop Solar Opportunity: Under the PM Surya Ghar Muft Bijli Yojana, installing a 2-3 kW rooftop solar system can offset up to 80% of your grid bill with central government subsidies."
      );
    } else {
      score += 10;
    }

    // 6. Off-peak habit
    if (data.offPeakUsage === 'Frequently') {
      score += 4;
    }

    const finalScore = Math.max(35, Math.min(98, score));
    if (recommendations.length === 0) {
      recommendations.push(
        "Your household energy setup is highly optimized! Continue routine monthly maintenance and monitor your smart meter readings."
      );
    }

    return {
      score: finalScore,
      potentialSavings: Math.max(300, potentialSavings),
      recommendations: recommendations,
      connectedAppliancesCount: appliances.length,
      monthlyKwhEstimated: totalMonthlyKwh
    };
  };

  const handleStartAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const res = generateAuditReport(formData);
      setReport(res);
      setAnalyzing(false);
      setStep(4);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Home Energy Audit Assessment</h1>
              <ConnectedDataSourceBadge />
            </div>
            <p className="text-slate-400 text-sm">
              Comprehensive household efficiency evaluation, smart question engine, and tailored action plan.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-2xl text-xs font-semibold text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>Connected to Appliances Tab ({appliances.length} devices)</span>
          </div>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-4 max-w-2xl">
        {[
          { step: 1, label: 'Profile' },
          { step: 2, label: 'Appliances Audit' },
          { step: 3, label: 'Habits' },
          { step: 4, label: 'Report' }
        ].map((s) => (
          <div key={s.step} className="flex-1 flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s.step
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-500 border border-white/10'
              }`}
            >
              {s.step}
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">{s.label}</span>
            {s.step < 4 && (
              <div className={`flex-1 h-1 rounded-full ${step > s.step ? 'bg-cyan-500' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-sm max-w-3xl">
        {/* Step 1: Home Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <Home className="w-5 h-5 text-cyan-400" /> Step 1: Home Profile & Solar Infrastructure
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Residence Type</label>
                <select
                  value={formData.homeType}
                  onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                >
                  <option value="Apartment" className="bg-slate-900">Apartment / Flat</option>
                  <option value="Independent House" className="bg-slate-900">Independent House / Row House</option>
                  <option value="Villa" className="bg-slate-900">Villa / Bungalow</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Number of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Occupants</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={formData.occupants}
                    onChange={(e) => setFormData({ ...formData, occupants: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="solarCheck"
                  checked={formData.hasSolar}
                  onChange={(e) => setFormData({ ...formData, hasSolar: e.target.checked })}
                  className="w-5 h-5 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="solarCheck" className="text-sm text-slate-200 font-medium cursor-pointer">
                  Rooftop Solar Already Installed
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Appliances Audit — Integrated with Appliances Tab */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-cyan-400" /> Step 2: Intelligent Appliance & Load Audit
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your audit questions dynamically adapt to your existing household inventory. No duplicate entry required.
              </p>
            </div>

            {/* Inventory Sync Summary Bar */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Connected Household Inventory
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {appliances.length} device{appliances.length !== 1 ? 's' : ''} loaded from Appliances tab (~{totalMonthlyKwh} kWh/mo)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  {showQuickAdd ? 'Close Add Form' : 'Add Another Appliance'}
                </button>
              </div>

              {/* Collapsible Quick-Add Form */}
              {showQuickAdd && (
                <form
                  onSubmit={handleQuickAddAppliance}
                  className="pt-3 border-t border-white/10 mt-2 space-y-3 bg-white/5 p-3.5 rounded-xl text-xs"
                >
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span>Quick Add Device (Synced to Inventory)</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAdd(false)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Category</label>
                      <select
                        value={quickCategory}
                        onChange={(e) => handleQuickCategoryChange(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none"
                      >
                        {Object.keys(CATEGORIZED_PRESETS).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Appliance</label>
                      {!isQuickCustom && quickCategory !== 'Other' ? (
                        <select
                          value={quickPreset}
                          onChange={(e) => handleQuickPresetChange(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none"
                        >
                          {(CATEGORIZED_PRESETS[quickCategory] || []).map((preset) => (
                            <option key={preset.name} value={preset.name}>
                              {preset.name} ({preset.power}W)
                            </option>
                          ))}
                          <option value="ADD_OTHER">+ Add Other Appliance</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={quickCustomName}
                          onChange={(e) => setQuickCustomName(e.target.value)}
                          placeholder="e.g. Dehumidifier, Water Pump"
                          className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl py-2 px-3 text-white text-xs outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={quickQty}
                        onChange={(e) => setQuickQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Watts</label>
                      <input
                        type="number"
                        min="1"
                        value={quickPower}
                        onChange={(e) => setQuickPower(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Hrs/day</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        max="24"
                        value={quickHours}
                        onChange={(e) => setQuickHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
                    >
                      Save & Add to Audit
                    </button>
                  </div>
                </form>
              )}

              {/* Display list of appliances in inventory */}
              <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                {appliances.map((app) => (
                  <span
                    key={app.id}
                    className="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-slate-300"
                  >
                    <span className="font-medium text-white">{app.name}</span>
                    {app.quantity > 1 && <span className="text-cyan-400 font-bold">x{app.quantity}</span>}
                    <span className="text-slate-500 text-[10px]">({app.power}W)</span>
                    <button
                      type="button"
                      onClick={() => removeAppliance(app.id)}
                      className="text-slate-500 hover:text-red-400 ml-1 cursor-pointer"
                      title="Remove from inventory"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* DYNAMIC AUDIT QUESTIONS BASED ON INVENTORY */}
            <div className="space-y-6 pt-2">
              
              {/* 1. AIR CONDITIONING QUESTION */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      hasAirConditioner ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'
                    }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Cooling & Air Conditioning</h3>
                      <p className="text-xs text-slate-400">
                        {hasAirConditioner 
                          ? `${detectedAirConditioners.map(a => a.name).join(', ')} detected in inventory` 
                          : 'No Air Conditioner detected in your inventory'}
                      </p>
                    </div>
                  </div>

                  {hasAirConditioner ? (
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                      Active Cooling Load
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                      Skipped (Not Present)
                    </span>
                  )}
                </div>

                {hasAirConditioner ? (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Air Conditioning Daily Usage Pattern
                      </label>
                      <select
                        id="audit-ac-usage-select"
                        value={formData.acUsage}
                        onChange={(e) => setFormData({ ...formData, acUsage: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                      >
                        <option value="Low (< 4 hrs/day)" className="bg-slate-900">Low (&lt; 4 hrs/day)</option>
                        <option value="Moderate (4-8 hrs/day)" className="bg-slate-900">Moderate (4-8 hrs/day)</option>
                        <option value="Heavy (> 8 hrs/day)" className="bg-slate-900">Heavy (&gt; 8 hrs/day)</option>
                      </select>
                    </div>

                    <div id="audit-ac-star-rating-container">
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        AC Efficiency Star Rating
                      </label>
                      <select
                        id="audit-ac-star-rating-select"
                        value={formData.acStarRating}
                        onChange={(e) => setFormData({ ...formData, acStarRating: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                      >
                        <option value="5 Star Inverter" className="bg-slate-900">5-Star Inverter AC (Most Efficient)</option>
                        <option value="3 Star" className="bg-slate-900">3-Star AC (Standard)</option>
                        <option value="Non-Inverter / Unrated" className="bg-slate-900">Older Non-Inverter / Unrated (Higher Consumption)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                    <span>
                      No AC questions required because your household inventory contains zero Air Conditioners.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleQuickCategoryChange('Cooling & Ventilation');
                        setShowQuickAdd(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline shrink-0 ml-3 cursor-pointer"
                    >
                      Add AC
                    </button>
                  </div>
                )}
              </div>

              {/* 2. WATER HEATING QUESTION */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      hasWaterHeater ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'
                    }`}>
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Water Heating System</h3>
                      <p className="text-xs text-slate-400">
                        {hasWaterHeater
                          ? `${detectedWaterHeaters.map(w => w.name).join(', ')} detected in inventory`
                          : 'No dedicated water heater found in inventory (defaults to "No Water Heating System")'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                    hasWaterHeater
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-slate-400 bg-white/5 border border-white/10'
                  }`}>
                    {hasWaterHeater ? 'Water Heater Present' : 'No Water Heating'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Select Heating Technology
                  </label>
                  <select
                    id="audit-water-heating-select"
                    value={formData.heatingType}
                    onChange={(e) => setFormData({ ...formData, heatingType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                  >
                    <option value="None" className="bg-slate-900">No Water Heating System</option>
                    <option value="Electric Geyser" className="bg-slate-900">Electric Geyser (Immersion/Storage)</option>
                    <option value="Solar Water Heater" className="bg-slate-900">Solar Water Heater</option>
                    <option value="Gas Geyser" className="bg-slate-900">Gas Geyser</option>
                  </select>

                  {!hasWaterHeater && (
                    <p className="text-[11px] text-slate-400 italic">
                      Notice: If you do not heat water electrically, "No Water Heating System" avoids unnecessary penalty calculations.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. LIGHTING QUESTION */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                      <SunMedium className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Household Lighting Profile</h3>
                      <p className="text-xs text-slate-400">
                        {hasLightingInInventory
                          ? `${detectedLighting.map(l => `${l.quantity}x ${l.name}`).join(', ')} recorded in inventory`
                          : 'Primary lighting technology used across your rooms'}
                      </p>
                    </div>
                  </div>

                  {hasLightingInInventory && (
                    <span className="text-[11px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                      Inventory Synced
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Primary Lighting Type
                  </label>
                  <select
                    id="audit-lighting-type-select"
                    value={formData.lightingType}
                    onChange={(e) => setFormData({ ...formData, lightingType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-xs"
                  >
                    <option value="LED" className="bg-slate-900">LED Bulbs & Panels (Most Efficient)</option>
                    <option value="Smart LED" className="bg-slate-900">Smart LED (Scheduled/Dimmable)</option>
                    <option value="100% LED" className="bg-slate-900">100% LED across all fixtures</option>
                    <option value="Mixed (LED + CFL)" className="bg-slate-900">Mixed (LED + CFL Tubes)</option>
                    <option value="Fluorescent Tube Light" className="bg-slate-900">Fluorescent Tube Lights (T12/T8)</option>
                    <option value="CFL" className="bg-slate-900">CFL (Compact Fluorescent)</option>
                    <option value="Incandescent" className="bg-slate-900">Incandescent / Filament Bulbs</option>
                    <option value="Halogen" className="bg-slate-900">Halogen Bulbs</option>
                    <option value="Other" className="bg-slate-900">Other / Mixed Fixtures</option>
                  </select>
                </div>
              </div>

              {/* 4. OTHER INVENTORY APPLIANCES */}
              {otherAppliances.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Other Devices Integrated in Audit:</span>
                    <span className="text-slate-400">{otherAppliances.length} items</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {otherAppliances.map((app) => (
                      <span
                        key={app.id}
                        className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 text-slate-300"
                      >
                        {app.name} ({app.power}W)
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Energy Audit calculations incorporate the cumulative wattage and operational schedules of all devices above.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-slate-400 hover:bg-white/5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={nextStep}
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Habits & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white border-b border-white/10 pb-3">
              <ClipboardCheck className="w-5 h-5 text-cyan-400" /> Step 3: Consumption Habits & Summary Review
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Avg Monthly Electricity Bill (₹)</label>
                  {householdBaseline?.sourceLabel && (
                    <span className="text-[11px] text-cyan-400 font-medium">
                      Synced from: {householdBaseline.sourceLabel}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={formData.avgBill}
                  onChange={(e) => setFormData({ ...formData, avgBill: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Do you run heavy appliances during off-peak hours?
                </label>
                <select
                  value={formData.offPeakUsage}
                  onChange={(e) => setFormData({ ...formData, offPeakUsage: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                >
                  <option value="Frequently" className="bg-slate-900">Frequently (Night / Off-peak 10pm-6am)</option>
                  <option value="Sometimes" className="bg-slate-900">Sometimes</option>
                  <option value="Rarely" className="bg-slate-900">Rarely / During Daytime Peak Hours</option>
                </select>
              </div>

              {/* Assessment Summary Snapshot */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                  Pre-Audit Assessment Snapshot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <p><strong className="text-slate-400">Residence:</strong> {formData.homeType} ({formData.rooms} Rooms, {formData.occupants} People)</p>
                  <p><strong className="text-slate-400">Rooftop Solar:</strong> {formData.hasSolar ? 'Installed' : 'None'}</p>
                  <p><strong className="text-slate-400">Air Conditioner:</strong> {hasAirConditioner ? `${formData.acUsage} (${formData.acStarRating})` : 'No AC in Inventory'}</p>
                  <p><strong className="text-slate-400">Water Heating:</strong> {formData.heatingType === 'None' ? 'No Water Heating System' : formData.heatingType}</p>
                  <p><strong className="text-slate-400">Lighting:</strong> {formData.lightingType}</p>
                  <p><strong className="text-slate-400">Connected Inventory:</strong> {appliances.length} devices (~{totalMonthlyKwh} kWh/mo)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button
                onClick={prevStep}
                className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-slate-400 hover:bg-white/5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleStartAnalysis}
                disabled={analyzing}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 text-white shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                {analyzing ? 'Evaluating Audit Rules...' : 'Generate Audit Report'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Assessment Report */}
        {step === 4 && report && (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-white/10">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl border text-4xl font-black mb-3 ${
                  report.score >= 80
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : report.score >= 60
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                {report.score}%
              </div>
              <h2 className="text-2xl font-bold text-white">Efficiency Score Rating</h2>
              <p className="text-slate-300 text-sm mt-1">
                Potential Monthly Savings: <span className="text-green-400 font-bold text-lg">₹{report.potentialSavings.toLocaleString()}</span> / month
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Based on {report.connectedAppliancesCount} connected appliances and {formData.homeType} energy modeling.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tailored Energy Reduction Action Plan
              </h3>
              {report.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-left"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-slate-300 hover:bg-white/5 border border-white/10 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retake Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeEnergyAudit;
