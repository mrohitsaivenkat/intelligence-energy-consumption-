import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Calendar,
  Loader2,
  Upload,
  FileText,
  Plus,
  ShieldCheck,
  Clock,
  Sparkles,
  Download,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import AddReadingModal from '../components/AddReadingModal';
import { useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const API_BASE_URL = '';

const EnergyForecasting = () => {
  const { householdBaseline, saveForecastingData, TARIFF_RATE, downloadMonthlyEnergyCSV } = useHouseholdEnergy();
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isAddReadingModalOpen, setIsAddReadingModalOpen] = useState(false);
  const [readingCount, setReadingCount] = useState(0);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [csvNotice, setCsvNotice] = useState('');

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCsv(true);
      await downloadMonthlyEnergyCSV(1);
      setCsvNotice('Monthly energy consumption summary downloaded successfully as formatted CSV!');
      setTimeout(() => setCsvNotice(''), 5000);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      setCsvNotice('Error generating CSV. Please try again.');
      setTimeout(() => setCsvNotice(''), 5000);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const fetchReadingStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/energy/readings/1`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReadingCount(data.length);
        }
      }
    } catch (e) {
      console.error('Failed to load readings count', e);
    }
  };

  useEffect(() => {
    fetchReadingStats();
    // Auto-generate forecast using household readings on initial mount
    generateForecast();
  }, []);

  const loadSampleDataset = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/sample_energy_data.csv');
      if (!res.ok) throw new Error('Sample data not available');
      const text = await res.blob();
      const sampleFile = new File([text], 'sample_energy_data.csv', { type: 'text/csv' });
      setSelectedFile(sampleFile);
      setForecast(null);
      setSummary(null);
    } catch (e) {
      setError('Could not load sample data.');
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        response = await fetch(
          `${API_BASE_URL}/api/energy/forecast/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
      } else {
        response = await fetch(
          `${API_BASE_URL}/api/energy/forecast/1`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}).`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Forecast generation failed.'
        );
      }

      if (data.status !== 'success') {
        throw new Error('Forecast generation was unsuccessful.');
      }

      const formattedForecast = (data.forecast || []).map((item) => ({
        date: item.date,
        kwh: Number(item.predicted_kwh || item.kwh || 0),
        predicted_kwh: Number(item.predicted_kwh || item.kwh || 0)
      }));

      setForecast(formattedForecast);
      setSummary(data.summary || null);

      // Save to centralized household energy state
      if (selectedFile && data.status === 'success') {
        const histDaily = Number(data.summary?.average_daily_forecast_kwh) || 12.5;
        const histMonthlyKwh = Math.round(histDaily * 30 * 10) / 10;
        saveForecastingData({
          uploaded_file: selectedFile.name,
          uploaded_records: data.uploaded_records || data.summary?.reading_count || 60,
          historicalMonthlyAvgKwh: histMonthlyKwh,
          historicalMonthlyAvgCost: Math.round(histMonthlyKwh * TARIFF_RATE),
          summary: data.summary
        });
      }

    } catch (err) {
      console.error('Forecast error:', err);

      setError(
        err.message ||
        'Unable to generate forecast. Please try again.'
      );

      setForecast(null);
      setSummary(null);

    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
    setForecast(null);
    setSummary(null);
  };

  return (
    <div className="space-y-8">

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">

        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Consumption Forecasting
            </h1>
            <ConnectedDataSourceBadge />
          </div>

          <p className="text-slate-400 text-sm">
            ML-powered predictions based on your household
            energy usage patterns.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <button
            id="forecasting-add-reading-btn"
            type="button"
            onClick={() => setIsAddReadingModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-white"
            title="Log a new electricity meter reading"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Reading</span>
          </button>

          <button
            type="button"
            onClick={loadSampleDataset}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-cyan-300"
            title="Load built-in 60-day household dataset"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Load Sample Data</span>
          </button>

          <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-white">

            <Upload className="w-4 h-4 text-cyan-400" />

            <span>
              {selectedFile
                ? selectedFile.name
                : 'Upload CSV'}
            </span>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />

          </label>

          <button
            id="generate-forecast-submit-btn"
            onClick={generateForecast}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 text-white text-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {loading
              ? 'Generating...'
              : selectedFile
              ? 'Generate from CSV'
              : 'Generate Forecast'}
          </button>

          <button
            id="forecast-download-monthly-csv-btn"
            onClick={handleDownloadCSV}
            disabled={downloadingCsv}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 text-sm disabled:opacity-50"
            title="Download Monthly Energy Consumption Summary as formatted CSV"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingCsv ? 'Exporting CSV...' : 'Download Monthly CSV'}</span>
          </button>
        </div>

      </header>

      {csvNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{csvNotice}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl">
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl">

          <FileText className="w-5 h-5 text-cyan-400" />

          <div>
            <p className="text-sm font-semibold text-white">
              Selected dataset
            </p>

            <p className="text-xs text-slate-400">
              {selectedFile.name}
            </p>
          </div>

        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Actual / Historical Usage */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Historical Consumption</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                  Actual History
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-white">
                  {Math.round(Number(summary.average_daily_forecast_kwh || 12.5) * 30)}
                </span>
                <span className="text-xs font-bold text-slate-500">kWh / mo</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ~{Number(summary.average_daily_forecast_kwh || 0).toFixed(2)} kWh/day • {summary.reading_count || '30+'} records
              </p>
            </motion.div>

            {/* Card 2: Current Household Bill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Household Bill</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Bill
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-white">
                  ₹{householdBaseline.currentBill.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 truncate" title={householdBaseline.sourceLabel}>
                {householdBaseline.sourceLabel}
              </p>
            </motion.div>

            {/* Card 3: Forecasted Consumption */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Forecasted Consumption</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ML Prediction
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-cyan-400">
                  {Number(summary.total_forecast_kwh || 0).toFixed(1)}
                </span>
                <span className="text-xs font-bold text-cyan-400/70">kWh (30d)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Next {summary.forecast_days || 30} days projected usage
              </p>
            </motion.div>

            {/* Card 4: Estimated Future Bill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Future Bill</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Projected
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-3xl font-bold text-purple-300">
                  ₹{Math.round(Number(summary.total_forecast_kwh || 0) * (householdBaseline.tariffRate || TARIFF_RATE)).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">/ 30 days</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                At ₹{householdBaseline.tariffRate || TARIFF_RATE}/kWh tariff
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>
              <strong>Clear distinction:</strong> Historical consumption and current bill are your actual household records. Forecasted consumption and estimated future bill are predictive ML forecasts for the next 30 days.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">

          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">

            <Calendar className="w-6 h-6 text-cyan-400" />

            30-Day Forecast

          </h3>

          <div className="h-[400px]">

            {forecast && forecast.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart data={forecast}>

                  <defs>

                    <linearGradient
                      id="forecastColor"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#06b6d4"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopColor="#06b6d4"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: 'kWh',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#94a3b8'
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #ffffff20',
                      borderRadius: '12px'
                    }}
                    labelStyle={{
                      color: '#cbd5e1'
                    }}
                    formatter={(value) => [
                      `${Number(value).toFixed(3)} kWh`,
                      'Predicted Usage'
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="kwh"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#forecastColor)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">

                <TrendingUp className="w-16 h-16 opacity-10" />

                <p>
                  Upload your energy CSV to generate predictions.
                </p>

              </div>

            )}

          </div>

        </div>

        <div className="space-y-6">

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">

            <h4 className="text-slate-400 text-sm mb-4">
              Historical Data
            </h4>

            {summary ? (

              <>
                <p className="text-2xl font-bold text-white">
                  {summary.last_historical_date}
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  Last date available in your uploaded dataset.
                </p>
              </>

            ) : (

              <p className="text-sm text-slate-500">
                Upload a dataset to view historical information.
              </p>

            )}

          </div>

          {forecast && forecast.length > 0 && (

            <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl">

              <div className="flex items-center gap-2 text-orange-400 mb-3">

                <AlertTriangle className="w-5 h-5" />

                <h4 className="font-bold">
                  Peak Usage
                </h4>

              </div>

              <p className="text-sm text-orange-200/80 leading-relaxed mb-4">
                Your forecast contains higher-consumption
                days. Review the forecast chart to identify
                periods where energy usage is expected to rise.
              </p>

              <div className="p-3 bg-orange-500/20 rounded-xl">

                <p className="text-xs text-orange-300 font-medium">
                  Tip:
                </p>

                <p className="text-xs text-orange-200">
                  Consider shifting flexible appliance usage
                  to lower-consumption periods.
                </p>

              </div>

            </div>

          )}

          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">

            <div className="flex items-center gap-2 mb-4">

              <Zap className="w-5 h-5 text-cyan-400" />

              <h4 className="font-bold text-sm text-slate-300">
                Forecast Insight
              </h4>

            </div>

            {forecast && forecast.length > 0 ? (

              <p className="text-sm text-slate-400 leading-relaxed">
                The forecast is generated from your uploaded
                historical energy-consumption data and provides
                predicted electricity usage for the next 30 days.
              </p>

            ) : (

              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your household energy dataset to generate
                a personalized 30-day consumption forecast.
              </p>

            )}

          </div>

        </div>

      </div>

      {forecast && forecast.length > 0 && (

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">

          <h3 className="text-xl font-bold mb-6">
            Daily Forecast
          </h3>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b border-white/10">

                  <th className="text-left py-4 px-4 text-slate-400 font-semibold">
                    Date
                  </th>

                  <th className="text-right py-4 px-4 text-slate-400 font-semibold">
                    Predicted Consumption
                  </th>

                </tr>

              </thead>

              <tbody>

                {forecast.map((item, index) => (

                  <tr
                    key={`${item.date}-${index}`}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >

                    <td className="py-4 px-4 text-slate-300">
                      {item.date}
                    </td>

                    <td className="py-4 px-4 text-right font-semibold text-cyan-400">
                      {Number(item.predicted_kwh).toFixed(3)} kWh
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* Add Reading Modal */}
      <AddReadingModal
        isOpen={isAddReadingModalOpen}
        onClose={() => setIsAddReadingModalOpen(false)}
        onReadingAdded={() => {
          fetchReadingStats();
          generateForecast();
        }}
      />
    </div>
  );
};

export default EnergyForecasting;