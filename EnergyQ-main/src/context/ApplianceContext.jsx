import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export const TARIFF_RATE = 7.5; // Average tariff rate in ₹ per kWh

export const CATEGORIZED_PRESETS = {
  'Cooling & Ventilation': [
    { name: 'Air Conditioner (1.5 Ton Inverter)', power: 1500, hours: 8, category: 'Cooling & Ventilation' },
    { name: 'Air Conditioner (1.5 Ton 3-Star)', power: 1800, hours: 8, category: 'Cooling & Ventilation' },
    { name: 'Split AC (1 Ton)', power: 1100, hours: 6, category: 'Cooling & Ventilation' },
    { name: 'Ceiling Fan', power: 75, hours: 10, category: 'Cooling & Ventilation' },
    { name: 'Air Cooler', power: 200, hours: 6, category: 'Cooling & Ventilation' },
    { name: 'Table / Stand Fan', power: 55, hours: 6, category: 'Cooling & Ventilation' },
    { name: 'Exhaust Fan', power: 45, hours: 3, category: 'Cooling & Ventilation' },
  ],
  'Kitchen': [
    { name: 'Double Door Refrigerator', power: 250, hours: 24, category: 'Kitchen' },
    { name: 'Single Door Refrigerator', power: 160, hours: 24, category: 'Kitchen' },
    { name: 'Microwave Oven', power: 1200, hours: 0.5, category: 'Kitchen' },
    { name: 'Induction Cooktop', power: 1800, hours: 1.5, category: 'Kitchen' },
    { name: 'Electric Kettle', power: 1500, hours: 0.3, category: 'Kitchen' },
    { name: 'Mixer / Grinder', power: 500, hours: 0.5, category: 'Kitchen' },
    { name: 'Dishwasher', power: 1200, hours: 1, category: 'Kitchen' },
  ],
  'Laundry & Cleaning': [
    { name: 'Washing Machine (Front Load)', power: 800, hours: 1, category: 'Laundry & Cleaning' },
    { name: 'Washing Machine (Top Load)', power: 500, hours: 1, category: 'Laundry & Cleaning' },
    { name: 'Clothes Dryer', power: 2000, hours: 1, category: 'Laundry & Cleaning' },
    { name: 'Vacuum Cleaner', power: 1400, hours: 0.5, category: 'Laundry & Cleaning' },
    { name: 'Electric Iron', power: 1000, hours: 0.5, category: 'Laundry & Cleaning' },
  ],
  'Heating & Water': [
    { name: 'Electric Geyser / Water Heater', power: 2000, hours: 1, category: 'Heating & Water' },
    { name: 'Instant Water Heater', power: 3000, hours: 0.3, category: 'Heating & Water' },
    { name: 'Solar Water Heater Backup', power: 1500, hours: 0.5, category: 'Heating & Water' },
    { name: 'Immersion Rod Heater', power: 1500, hours: 0.5, category: 'Heating & Water' },
    { name: 'Water Purifier / RO', power: 60, hours: 4, category: 'Heating & Water' },
    { name: 'Water Submersible Pump', power: 750, hours: 1, category: 'Heating & Water' },
    { name: 'Room Heater', power: 1500, hours: 3, category: 'Heating & Water' },
  ],
  'Entertainment & Computing': [
    { name: 'Smart LED TV 55"', power: 100, hours: 4, category: 'Entertainment & Computing' },
    { name: 'Smart LED TV 32"-43"', power: 65, hours: 5, category: 'Entertainment & Computing' },
    { name: 'Set Top Box / DTH', power: 20, hours: 6, category: 'Entertainment & Computing' },
    { name: 'Desktop Computer', power: 200, hours: 5, category: 'Entertainment & Computing' },
    { name: 'Laptop', power: 65, hours: 6, category: 'Entertainment & Computing' },
    { name: 'Wi-Fi Router', power: 15, hours: 24, category: 'Entertainment & Computing' },
  ],
  'Lighting': [
    { name: 'LED Bulbs & Panels', power: 9, hours: 6, category: 'Lighting' },
    { name: 'Smart LED Bulb', power: 10, hours: 5, category: 'Lighting' },
    { name: 'Fluorescent Tube Light', power: 40, hours: 6, category: 'Lighting' },
    { name: 'CFL Bulb', power: 18, hours: 5, category: 'Lighting' },
    { name: 'Incandescent / Halogen Bulb', power: 60, hours: 4, category: 'Lighting' },
  ],
  'Other': [
    { name: 'Other Custom Appliance', power: 100, hours: 2, category: 'Other' },
  ]
};

const DEFAULT_APPLIANCES = [
  { id: 1, name: 'Air Conditioner (1.5 Ton)', category: 'Cooling & Ventilation', power: 1800, quantity: 1, hours: 8, days: 30, monthlyKwh: 432, cost: 3240 },
  { id: 2, name: 'Double Door Refrigerator', category: 'Kitchen', power: 350, quantity: 1, hours: 24, days: 30, monthlyKwh: 252, cost: 1890 },
  { id: 3, name: 'Washing Machine (Front Load)', category: 'Laundry & Cleaning', power: 800, quantity: 1, hours: 1, days: 20, monthlyKwh: 16, cost: 120 },
  { id: 4, name: 'Smart LED TV 55"', category: 'Entertainment & Computing', power: 120, quantity: 2, hours: 5, days: 30, monthlyKwh: 36, cost: 270 }
];

const LOCAL_STORAGE_KEY = 'smart_household_appliances_inventory';
const UPLOADED_BILL_STORAGE_KEY = 'smart_household_uploaded_bill';
const FORECASTING_STORAGE_KEY = 'smart_household_forecasting_data';
const PREFERRED_SOURCE_STORAGE_KEY = 'smart_household_preferred_source';

const ApplianceContext = createContext(null);

export const ApplianceProvider = ({ children }) => {
  const [appliances, setAppliances] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved appliances from localStorage:', e);
    }
    return DEFAULT_APPLIANCES;
  });

  // Uploaded electricity bill from Bill Analyzer
  const [uploadedBill, setUploadedBill] = useState(() => {
    try {
      const saved = localStorage.getItem(UPLOADED_BILL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved uploaded bill:', e);
    }
    return null;
  });

  // Manual meter readings state
  const [manualReadings, setManualReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(false);

  // Monthly Energy Summary state
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loadingMonthlySummary, setLoadingMonthlySummary] = useState(false);

  // Uploaded CSV / ML forecasting data
  const [forecastingData, setForecastingData] = useState(() => {
    try {
      const saved = localStorage.getItem(FORECASTING_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved forecasting data:', e);
    }
    return null;
  });

  // User preference for data source: 'auto' | 'uploaded_bill' | 'manual_reading' | 'uploaded_csv' | 'appliance_inventory'
  const [preferredSource, setPreferredSourceState] = useState(() => {
    try {
      return localStorage.getItem(PREFERRED_SOURCE_STORAGE_KEY) || 'auto';
    } catch {
      return 'auto';
    }
  });

  const setPreferredSource = (srcKey) => {
    setPreferredSourceState(srcKey);
    try {
      localStorage.setItem(PREFERRED_SOURCE_STORAGE_KEY, srcKey);
    } catch {}
  };

  // Fetch initial readings and remote bill from server
  const fetchReadings = async () => {
    try {
      setLoadingReadings(true);
      const res = await fetch('/api/energy/readings/1');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setManualReadings(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch energy readings:', err);
    } finally {
      setLoadingReadings(false);
    }
  };

  // Fetch initial bill from server if not in localStorage
  useEffect(() => {
    fetchReadings();

    fetch('/api/household/1/bill')
      .then((res) => (res.ok ? res.json() : null))
      .then((remoteBill) => {
        if (remoteBill && (!uploadedBill || !uploadedBill.amount)) {
          setUploadedBill(remoteBill);
          try {
            localStorage.setItem(UPLOADED_BILL_STORAGE_KEY, JSON.stringify(remoteBill));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Keep localStorage in sync for appliances
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appliances));
    } catch (e) {
      console.warn('Failed to save appliances to localStorage:', e);
    }
  }, [appliances]);

  // Keep localStorage in sync for uploaded bill
  useEffect(() => {
    try {
      if (uploadedBill) {
        localStorage.setItem(UPLOADED_BILL_STORAGE_KEY, JSON.stringify(uploadedBill));
      } else {
        localStorage.removeItem(UPLOADED_BILL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save bill to localStorage:', e);
    }
  }, [uploadedBill]);

  // Keep localStorage in sync for forecasting data
  useEffect(() => {
    try {
      if (forecastingData) {
        localStorage.setItem(FORECASTING_STORAGE_KEY, JSON.stringify(forecastingData));
      } else {
        localStorage.removeItem(FORECASTING_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save forecasting data to localStorage:', e);
    }
  }, [forecastingData]);

  // Save / Update Uploaded Bill (called by BillAnalyzer)
  const saveUploadedBill = (billData) => {
    const formatted = {
      amount: Math.round(Number(billData.amount || billData.totalAmount || 0)),
      units: Math.round(Number(billData.units || billData.unitsConsumed || 0)),
      billingPeriod: billData.period || billData.billingPeriod || 'Current Utility Bill',
      tariffRate: Number(billData.tariffRate) || TARIFF_RATE,
      fixedCharges: Number(billData.fixedCharges) || 0,
      taxes: Number(billData.taxes) || 0,
      otherCharges: Number(billData.otherCharges) || 0,
      discom: billData.discom || 'State Electricity Board',
      breakdown: billData.breakdown || [],
      ai_insight: billData.ai_insight || '',
      updatedAt: new Date().toISOString(),
      source: 'bill_analyzer'
    };

    setUploadedBill(formatted);

    // Sync with server
    fetch('/api/household/1/bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    }).catch(() => {});

    return formatted;
  };

  const clearUploadedBill = () => {
    setUploadedBill(null);
    fetch('/api/household/1/bill', { method: 'DELETE' }).catch(() => {});
  };

  // Add a manual reading
  const addManualReading = async (reading) => {
    try {
      const res = await fetch('/api/energy/readings/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reading)
      });
      if (res.ok) {
        const saved = await res.json();
        setManualReadings((prev) => [...prev, saved]);
        return saved;
      }
    } catch (err) {
      console.error('Failed to add manual reading:', err);
    }
    // Fallback optimistic local addition
    const fallback = {
      id: Date.now(),
      household_id: 1,
      date: reading.date || new Date().toISOString().split('T')[0],
      kwh: Number(reading.kwh) || 0,
      source: reading.source || 'Grid Meter',
      notes: reading.notes || ''
    };
    setManualReadings((prev) => [...prev, fallback]);
    return fallback;
  };

  const deleteManualReading = async (id) => {
    try {
      await fetch(`/api/energy/readings/${id}`, { method: 'DELETE' });
    } catch {}
    setManualReadings((prev) => prev.filter((r) => r.id !== id));
    fetchMonthlySummary();
  };

  // Fetch formatted monthly summary from backend
  const fetchMonthlySummary = async (householdId = 1) => {
    try {
      setLoadingMonthlySummary(true);
      const res = await fetch(`/api/energy/monthly-summary/${householdId}?tariff_rate=${TARIFF_RATE}&include_forecast=true`);
      if (res.ok) {
        const data = await res.json();
        setMonthlySummary(data);
        return data;
      }
    } catch (err) {
      console.warn('Failed to fetch monthly summary from API:', err);
    } finally {
      setLoadingMonthlySummary(false);
    }
    return null;
  };

  // Client-side fallback generator
  const generateClientSideMonthlyCSV = (readings, tariffRate) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const groups = {};
    (readings || []).forEach((r) => {
      if (!r.date) return;
      const parts = r.date.split('-');
      if (parts.length >= 2) {
        const mKey = `${parts[0]}-${parts[1]}`;
        if (!groups[mKey]) groups[mKey] = [];
        groups[mKey].push(r);
      }
    });

    const lines = [
      '# ==========================================================================================',
      '# SMART HOUSEHOLD ENERGY MANAGEMENT SYSTEM - MONTHLY CONSUMPTION SUMMARY REPORT',
      `# Report Generated: ${new Date().toLocaleString()} | Currency: INR (₹) | Tariff Rate: ₹${tariffRate.toFixed(2)}/kWh`,
      '# ==========================================================================================',
      'Month,Year,Total Consumption (kWh),Avg Daily Usage (kWh/day),Peak Day Date,Peak Day (kWh),Lowest Day Date,Lowest Day (kWh),Days Recorded,Estimated Cost (INR),Tariff Rate (INR/kWh),Status,Notes'
    ];

    let totalKwhAll = 0;
    let totalCostAll = 0;
    let totalDaysAll = 0;

    Object.keys(groups).sort().forEach((mKey) => {
      const list = groups[mKey];
      const [yearStr, monthNumStr] = mKey.split('-');
      const mNum = parseInt(monthNumStr, 10);
      const mName = `${monthNames[mNum - 1] || mKey} ${yearStr}`;
      const totalKwh = list.reduce((s, item) => s + Number(item.kwh || 0), 0);
      const count = list.length;
      const avgDaily = count > 0 ? totalKwh / count : 0;
      const peak = list.reduce((max, item) => (item.kwh > max.kwh ? item : max), list[0] || { kwh: 0, date: '—' });
      const low = list.reduce((min, item) => (item.kwh < min.kwh ? item : min), list[0] || { kwh: 0, date: '—' });
      const cost = totalKwh * tariffRate;

      totalKwhAll += totalKwh;
      totalCostAll += cost;
      totalDaysAll += count;

      lines.push([
        `"${mName}"`,
        yearStr,
        totalKwh.toFixed(2),
        avgDaily.toFixed(2),
        peak.date,
        Number(peak.kwh).toFixed(2),
        low.date,
        Number(low.kwh).toFixed(2),
        count,
        cost.toFixed(2),
        tariffRate.toFixed(2),
        '"Recorded Month"',
        `"${count} meter readings logged"`
      ].join(','));
    });

    lines.push('');
    const overallAvg = totalDaysAll > 0 ? totalKwhAll / totalDaysAll : 0;
    lines.push([
      '"TOTAL / CUMULATIVE"',
      '"—"',
      totalKwhAll.toFixed(2),
      overallAvg.toFixed(2),
      '"—"',
      '"—"',
      '"—"',
      '"—"',
      totalDaysAll,
      totalCostAll.toFixed(2),
      tariffRate.toFixed(2),
      '"Combined Total"',
      `"Cumulative summary across recorded months"`
    ].join(','));

    lines.push('# ==========================================================================================');
    lines.push(`# Total Recorded Consumption: ${totalKwhAll.toFixed(2)} kWh`);
    lines.push(`# Cumulative Estimated Cost: ₹${totalCostAll.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`);
    lines.push('# ==========================================================================================');

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly_energy_consumption_summary_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Download formatted monthly energy consumption summary CSV
  const downloadMonthlyEnergyCSV = async (householdId = 1) => {
    try {
      const res = await fetch(`/api/energy/monthly-summary/csv/${householdId}?tariff_rate=${TARIFF_RATE}&include_forecast=true`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const todayStr = new Date().toISOString().split('T')[0];
        a.download = `monthly_energy_consumption_summary_household_${householdId}_${todayStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend CSV download endpoint failed, using client-side generator:', err);
    }

    // Client-side fallback
    generateClientSideMonthlyCSV(manualReadings, TARIFF_RATE);
    return { success: true, fallback: true };
  };

  // Save Forecasting Data (called by EnergyForecasting)
  const saveForecastingData = (data) => {
    const formatted = {
      uploadedCsvName: data.uploaded_file || data.uploadedCsvName || 'energy_dataset.csv',
      historicalDataCount: Number(data.uploaded_records || data.historicalDataCount || 0),
      lastHistoricalDate: data.summary?.last_historical_date || data.lastHistoricalDate || new Date().toISOString().split('T')[0],
      historicalMonthlyAvgKwh: Number(data.historicalMonthlyAvgKwh || 0),
      historicalMonthlyAvgCost: Number(data.historicalMonthlyAvgCost || 0),
      forecastSummary: data.summary || null,
      updatedAt: new Date().toISOString()
    };
    setForecastingData(formatted);
    return formatted;
  };

  // Calculations for appliances inventory
  const totalMonthlyKwh = Math.round(appliances.reduce((sum, item) => sum + item.monthlyKwh, 0) * 10) / 10;
  const totalMonthlyCost = appliances.reduce((sum, item) => sum + item.cost, 0);
  const highestConsumer = appliances.length > 0
    ? [...appliances].sort((a, b) => b.cost - a.cost)[0]
    : null;

  // ================= UNIFIED HOUSEHOLD BASELINE =================
  // Prioritizes actual data while keeping all components perfectly aligned:
  // 1. Uploaded Utility Bill (most authoritative)
  // 2. Manual Meter Readings (recent logged usage)
  // 3. Uploaded Consumption CSV (historical average)
  // 4. Appliance Inventory (calculated estimate)
  const allSources = useMemo(() => {
    const list = [];

    // 1. Uploaded Bill
    if (uploadedBill && (uploadedBill.amount > 0 || uploadedBill.units > 0)) {
      list.push({
        key: 'uploaded_bill',
        label: 'Based on your latest uploaded bill',
        shortLabel: 'Uploaded Bill',
        isActual: true,
        bill: Number(uploadedBill.amount) || 0,
        kwh: Number(uploadedBill.units) || 0,
        tariff: Number(uploadedBill.tariffRate) || TARIFF_RATE,
        detail: `${uploadedBill.billingPeriod || 'Recent Utility Bill'} • ${uploadedBill.discom || 'Electricity Bill'}`,
        updatedAt: uploadedBill.updatedAt
      });
    }

    // 2. Manual Readings
    if (manualReadings && manualReadings.length > 0) {
      const totalKwh = manualReadings.reduce((sum, r) => sum + (Number(r.kwh) || 0), 0);
      const count = manualReadings.length;
      let monthlyKwh = Math.round(totalKwh * 10) / 10;
      if (count < 30 && count > 0) {
        const dailyAvg = totalKwh / count;
        monthlyKwh = Math.round(dailyAvg * 30 * 10) / 10;
      }
      const monthlyCost = Math.round(monthlyKwh * TARIFF_RATE);

      list.push({
        key: 'manual_reading',
        label: 'Based on your manual reading',
        shortLabel: 'Manual Readings',
        isActual: true,
        bill: monthlyCost,
        kwh: monthlyKwh,
        tariff: TARIFF_RATE,
        detail: `${count} meter reading${count > 1 ? 's' : ''} logged (~${Math.round((totalKwh / count) * 10) / 10} kWh/day)`
      });
    }

    // 3. Uploaded Consumption Data (from Forecasting CSV)
    if (forecastingData && (forecastingData.historicalMonthlyAvgKwh > 0 || forecastingData.historicalDataCount > 0)) {
      const kwh = Number(forecastingData.historicalMonthlyAvgKwh) || 385;
      const bill = Number(forecastingData.historicalMonthlyAvgCost) || Math.round(kwh * TARIFF_RATE);
      list.push({
        key: 'uploaded_csv',
        label: 'Based on your uploaded consumption data',
        shortLabel: 'Uploaded CSV',
        isActual: true,
        bill: bill,
        kwh: kwh,
        tariff: TARIFF_RATE,
        detail: `${forecastingData.uploadedCsvName || 'CSV Dataset'} (${forecastingData.historicalDataCount || '30+'} records)`
      });
    }

    // 4. Appliance Inventory Calculation
    list.push({
      key: 'appliance_inventory',
      label: 'Estimated from your appliance inventory',
      shortLabel: 'Appliance Inventory',
      isActual: false,
      bill: totalMonthlyCost > 0 ? totalMonthlyCost : 3240,
      kwh: totalMonthlyKwh > 0 ? totalMonthlyKwh : 412,
      tariff: TARIFF_RATE,
      detail: `${appliances.length} active household appliance${appliances.length > 1 ? 's' : ''}`
    });

    return list;
  }, [uploadedBill, manualReadings, forecastingData, totalMonthlyKwh, totalMonthlyCost, appliances.length]);

  const householdBaseline = useMemo(() => {
    let active = allSources[0]; // Highest priority by default
    if (preferredSource !== 'auto') {
      const found = allSources.find((s) => s.key === preferredSource);
      if (found) active = found;
    }

    return {
      currentBill: active.bill,
      currentKwh: active.kwh,
      tariffRate: active.tariff || TARIFF_RATE,
      sourceKey: active.key,
      sourceLabel: active.label,
      sourceShortLabel: active.shortLabel,
      sourceDetail: active.detail,
      isActual: active.isActual,
      allSources,
      preferredSource,
      setPreferredSource
    };
  }, [allSources, preferredSource]);

  // Helper to compute calculated fields
  const computeMetrics = (power, hours, quantity, days = 30) => {
    const p = Math.max(1, Number(power) || 100);
    const h = Math.max(0.1, Number(hours) || 1);
    const q = Math.max(1, Number(quantity) || 1);
    const d = Math.max(1, Math.min(31, Number(days) || 30));
    const dailyKwh = (p * h * q) / 1000;
    const monthlyKwh = Math.round(dailyKwh * d * 10) / 10;
    const cost = Math.round(monthlyKwh * TARIFF_RATE);
    return { power: p, hours: h, quantity: q, days: d, monthlyKwh, cost };
  };

  const addAppliance = (item) => {
    const { power, hours, quantity, days, monthlyKwh, cost } = computeMetrics(
      item.power,
      item.hours,
      item.quantity,
      item.days
    );
    const newApp = {
      id: item.id || Date.now(),
      name: (item.name || 'Custom Appliance').trim(),
      category: item.category || 'Other',
      power,
      quantity,
      hours,
      days,
      monthlyKwh,
      cost
    };

    setAppliances((prev) => [newApp, ...prev]);

    // Optional background sync with server
    fetch('/api/household/1/appliances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newApp.id,
        name: newApp.name,
        category: newApp.category,
        quantity: newApp.quantity,
        power_rating_watts: newApp.power,
        usage_hours_per_day: newApp.hours
      })
    }).catch(() => {});

    return newApp;
  };

  const updateAppliance = (id, updatedFields) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const merged = { ...app, ...updatedFields };
        const metrics = computeMetrics(merged.power, merged.hours, merged.quantity, merged.days);
        const updated = {
          ...merged,
          ...metrics,
          name: (merged.name || app.name).trim(),
          category: merged.category || app.category
        };

        // Background sync
        fetch(`/api/household/1/appliances/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: updated.name,
            category: updated.category,
            quantity: updated.quantity,
            power_rating_watts: updated.power,
            usage_hours_per_day: updated.hours
          })
        }).catch(() => {});

        return updated;
      })
    );
  };

  const removeAppliance = (id) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));

    fetch(`/api/household/1/appliances/${id}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  // Appliance Inventory Detection Helpers for Energy Audit
  const acKeywords = ['air conditioner', 'ac', 'cooler', 'split ac', 'inverter ac', 'window ac'];
  const detectedAirConditioners = appliances.filter((a) => {
    const cat = (a.category || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    return (
      (cat.includes('cooling') && (acKeywords.some(kw => name.includes(kw)) || !name.includes('fan'))) ||
      acKeywords.some(kw => name.includes(kw))
    );
  });
  const hasAirConditioner = detectedAirConditioners.length > 0;
  const detectedAcHours = hasAirConditioner
    ? detectedAirConditioners.reduce((sum, a) => sum + (a.hours || 6), 0) / detectedAirConditioners.length
    : 0;

  const waterHeaterKeywords = ['geyser', 'water heater', 'immersion', 'boiler'];
  const detectedWaterHeaters = appliances.filter((a) => {
    const cat = (a.category || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    return (
      (cat.includes('heating') && waterHeaterKeywords.some(kw => name.includes(kw))) ||
      waterHeaterKeywords.some(kw => name.includes(kw))
    );
  });
  const hasWaterHeater = detectedWaterHeaters.length > 0;

  const lightingKeywords = ['led', 'bulb', 'light', 'cfl', 'tube', 'halogen', 'lamp'];
  const detectedLighting = appliances.filter((a) => {
    const cat = (a.category || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    return cat === 'lighting' || lightingKeywords.some(kw => name.includes(kw));
  });
  const hasLightingInInventory = detectedLighting.length > 0;

  const otherAppliances = appliances.filter(
    (a) => !detectedAirConditioners.some((ac) => ac.id === a.id) && !detectedWaterHeaters.some((wh) => wh.id === a.id)
  );

  return (
    <ApplianceContext.Provider
      value={{
        // Appliances
        appliances,
        setAppliances,
        addAppliance,
        updateAppliance,
        removeAppliance,
        TARIFF_RATE,
        CATEGORIZED_PRESETS,
        totalMonthlyKwh,
        totalMonthlyCost,
        highestConsumer,

        // Uploaded Bill Management
        uploadedBill,
        saveUploadedBill,
        clearUploadedBill,

        // Manual Readings Management
        manualReadings,
        loadingReadings,
        fetchReadings,
        addManualReading,
        deleteManualReading,

        // Forecasting Data Management
        forecastingData,
        saveForecastingData,

        // Monthly Summary & CSV Download
        monthlySummary,
        loadingMonthlySummary,
        fetchMonthlySummary,
        downloadMonthlyEnergyCSV,

        // Unified Household Baseline
        householdBaseline,
        allSources,
        preferredSource,
        setPreferredSource,

        // Audit detection helpers
        hasAirConditioner,
        detectedAirConditioners,
        detectedAcHours,
        hasWaterHeater,
        detectedWaterHeaters,
        hasLightingInInventory,
        detectedLighting,
        otherAppliances
      }}
    >
      {children}
    </ApplianceContext.Provider>
  );
};

export const useAppliances = () => {
  const context = useContext(ApplianceContext);
  if (!context) {
    throw new Error('useAppliances must be used within an ApplianceProvider');
  }
  return context;
};

// Convenient alias for components focusing on energy data
export const useHouseholdEnergy = () => {
  return useAppliances();
};
