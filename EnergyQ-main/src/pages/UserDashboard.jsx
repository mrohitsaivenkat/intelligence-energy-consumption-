import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Zap, FileText, Sun, MessageSquare, LogOut, TrendingUp, DollarSign, Plus, ShieldCheck,
  Package, Wrench, ClipboardCheck, Calendar, Trash2, ArrowRight, ShoppingBag, Download, CheckCircle2, BarChart3
} from 'lucide-react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AIAssistant from './AIAssistant';
import BillAnalyzer from './BillAnalyzer';
import SolarROI from './SolarROI';
import EnergyForecasting from './EnergyForecasting';
import ApplianceManagement from './ApplianceManagement';
import ServiceProviders from './ServiceProviders';
import HomeEnergyAudit from './HomeEnergyAudit';
import BeforeYouBuy from './BeforeYouBuy';
import AddReadingModal from '../components/AddReadingModal';
import { ApplianceProvider, useHouseholdEnergy } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Appliances', path: '/dashboard/appliances' },
    { icon: ShoppingBag, label: 'Before You Buy', path: '/dashboard/before-you-buy' },
    { icon: FileText, label: 'Bill Analyzer', path: '/dashboard/bills' },
    { icon: TrendingUp, label: 'Forecasting', path: '/dashboard/forecast' },
    { icon: ClipboardCheck, label: 'Energy Audit', path: '/dashboard/audit' },
    { icon: Sun, label: 'Solar ROI', path: '/dashboard/solar' },
    { icon: Wrench, label: 'Services', path: '/dashboard/services' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/dashboard/ai' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-white/10 h-screen fixed left-0 top-0 p-4 flex flex-col z-50">
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="p-2 bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/20"><Zap className="w-6 h-6 text-white" /></div>
        <span className="text-xl font-bold tracking-tight text-white">SMART ENERGY</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm text-inherit">{item.label}</span>
          </Link>
        ))}
      </div>
      <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-auto border-t border-white/5 pt-4">
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">Sign Out</span>
      </Link>
    </div>
  );
};

const DashboardHome = () => {
  const [isAddReadingModalOpen, setIsAddReadingModalOpen] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [csvNotice, setCsvNotice] = useState('');

  const { 
    manualReadings, 
    deleteReading, 
    refreshManualReadings, 
    householdBaseline,
    downloadMonthlyEnergyCSV,
    monthlySummary,
    loadingMonthlySummary,
    fetchMonthlySummary,
  } = useHouseholdEnergy();

  const readings = manualReadings || [];

  useEffect(() => {
    if (fetchMonthlySummary) {
      fetchMonthlySummary(1);
    }
  }, [readings.length]);

  const handleDownloadCSV = async () => {
    try {
      setDownloadingCsv(true);
      await downloadMonthlyEnergyCSV(1);
      setCsvNotice('Monthly energy consumption summary downloaded successfully as CSV!');
      setTimeout(() => setCsvNotice(''), 5000);
    } catch (err) {
      console.error('Failed to download CSV:', err);
      setCsvNotice('Error generating CSV. Please try again.');
      setTimeout(() => setCsvNotice(''), 5000);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleDeleteReading = async (id) => {
    try {
      await deleteReading(id);
      if (fetchMonthlySummary) {
        fetchMonthlySummary(1);
      }
    } catch (err) {
      console.error('Failed to delete reading:', err);
    }
  };

  // Compute 7-day chart data from recent readings or fallback
  const last7Readings = readings.slice(-7);
  const chartData = last7Readings.length >= 3
    ? last7Readings.map((r) => {
        const d = new Date(r.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const name = !isNaN(d.getTime()) ? dayNames[d.getDay()] : r.date;
        return { name, value: r.kwh, fullDate: r.date };
      })
    : [
        { name: 'Mon', value: 12 },
        { name: 'Tue', value: 15 },
        { name: 'Wed', value: 11 },
        { name: 'Thu', value: 18 },
        { name: 'Fri', value: 14 },
        { name: 'Sat', value: 10 },
        { name: 'Sun', value: 9 },
      ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Good Evening!</h1>
            <ConnectedDataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm">
            Unified household energy profile • {householdBaseline.sourceLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="header-download-monthly-csv-btn"
            onClick={handleDownloadCSV}
            disabled={downloadingCsv}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-60"
            title="Download Monthly Energy Consumption Summary as formatted CSV"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingCsv ? 'Preparing CSV...' : 'Download Monthly CSV'}</span>
          </button>
          <Link
            to="/dashboard/forecast"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all text-cyan-400"
          >
            <TrendingUp className="w-4 h-4" /> View Forecast
          </Link>
          <button 
            id="open-add-reading-modal-btn"
            onClick={() => setIsAddReadingModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 text-white"
          >
            <Plus className="w-5 h-5" /> Add Reading
          </button>
        </div>
      </header>

      {csvNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm animate-fade-in shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{csvNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Monthly Usage', 
            value: `${householdBaseline.currentMonthlyKwh} kWh`, 
            sub: `~${Math.round((householdBaseline.currentMonthlyKwh / 30) * 10) / 10} kWh / day`,
            icon: Zap, 
            color: 'text-cyan-400' 
          },
          { 
            label: 'Current Bill', 
            value: `₹${householdBaseline.currentBill.toLocaleString()}`, 
            sub: householdBaseline.sourceLabel,
            icon: DollarSign, 
            color: 'text-green-400' 
          },
          { 
            label: 'Est. Savings', 
            value: `₹${Math.round(householdBaseline.currentBill * 0.16).toLocaleString()}`, 
            sub: 'Available via Audit recommendations',
            icon: TrendingUp, 
            color: 'text-blue-400' 
          },
          { 
            label: 'Efficiency Score', 
            value: '82%', 
            sub: 'Top 25% of efficient homes',
            icon: ShieldCheck, 
            color: 'text-purple-400' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:border-white/20 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 ${stat.color} flex items-center justify-center mb-4`}><stat.icon className="w-6 h-6" /></div>
            <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            {stat.sub && (
              <p className="text-[11px] text-slate-400 mt-1 truncate" title={stat.sub}>{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Before You Buy Banner */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/20 p-6 rounded-3xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Planning to buy a new AC, Refrigerator, or Geyser?</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                New
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate monthly bill increases, compare 5-star BEE energy ratings, and view 5-year running costs before you purchase.
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/before-you-buy"
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 shrink-0"
        >
          <span>Open Calculator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Consumption Overview Chart */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Consumption Overview</h3>
            <p className="text-xs text-slate-400">Daily kWh usage from your latest electricity meter readings</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
            7-Day Recent Trend
          </span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} unit=" kWh" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }} 
                formatter={(value) => [`${value} kWh`, 'Energy Usage']}
              />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={4} fill="url(#colorV)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Energy Consumption Summary & Formatted CSV Export */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Monthly Energy Consumption Summary</h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
                Official Report
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated monthly consumption, peak demand tracking, and billing cost estimates formatted for audit & CSV export.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="summary-download-csv-btn"
              onClick={handleDownloadCSV}
              disabled={downloadingCsv}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-60"
              title="Download Monthly Energy Consumption Summary CSV"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingCsv ? 'Exporting CSV...' : 'Download CSV Report'}</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats banner */}
        {monthlySummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <span className="text-slate-400 text-xs block mb-1">Total Recorded Energy</span>
              <div className="text-lg sm:text-xl font-bold text-white">
                {monthlySummary.total_historical_kwh?.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
              </div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <span className="text-slate-400 text-xs block mb-1">Total Estimated Cost</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-400">
                ₹{monthlySummary.total_historical_cost?.toLocaleString()}
              </div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <span className="text-slate-400 text-xs block mb-1">Standard Tariff</span>
              <div className="text-lg sm:text-xl font-bold text-cyan-400">
                ₹{monthlySummary.tariff_rate?.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ kWh</span>
              </div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
              <span className="text-slate-400 text-xs block mb-1">Tracked Monthly Periods</span>
              <div className="text-lg sm:text-xl font-bold text-white">
                {monthlySummary.months_count || (monthlySummary.months?.length || 0)} <span className="text-xs font-normal text-slate-400">Months</span>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Summary Table */}
        {loadingMonthlySummary && !monthlySummary ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Loading monthly energy consumption summary...
          </div>
        ) : monthlySummary?.months && monthlySummary.months.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs">
                  <th className="text-left py-3 px-4 font-semibold">Month & Period</th>
                  <th className="text-left py-3 px-4 font-semibold">Total Usage</th>
                  <th className="text-left py-3 px-4 font-semibold">Daily Avg</th>
                  <th className="text-left py-3 px-4 font-semibold">Peak Day</th>
                  <th className="text-left py-3 px-4 font-semibold">Lowest Day</th>
                  <th className="text-left py-3 px-4 font-semibold">Days Logged</th>
                  <th className="text-left py-3 px-4 font-semibold">Est. Cost</th>
                  <th className="text-right py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.months.map((m, idx) => {
                  const isForecast = m.status?.includes('Forecast') || m.status?.includes('Projected');
                  const isCurrent = m.status?.includes('Current');
                  return (
                    <tr key={m.month_key || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">
                        <div className="flex items-center gap-2">
                          <span>{m.month_name}</span>
                          {isForecast && (
                            <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-medium">
                              ML Forecast
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block">{m.notes}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-400">
                        {Number(m.total_kwh).toFixed(2)} <span className="text-xs font-normal text-slate-400">kWh</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {Number(m.avg_daily_kwh).toFixed(2)} <span className="text-xs text-slate-500">kWh/d</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-medium text-amber-400">{Number(m.peak_kwh).toFixed(2)} kWh</div>
                        <span className="text-[11px] text-slate-500">{m.peak_date}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-medium text-slate-300">{Number(m.lowest_kwh).toFixed(2)} kWh</div>
                        <span className="text-[11px] text-slate-500">{m.lowest_date}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {m.days_recorded} days
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        ₹{Number(m.estimated_cost).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-block ${
                          isForecast
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : isCurrent
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-white/10 font-semibold text-slate-200">
                  <td className="py-3.5 px-4 text-white">Cumulative Total</td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold">
                    {monthlySummary.months.reduce((s, x) => s + Number(x.total_kwh || 0), 0).toFixed(2)} kWh
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {(
                      monthlySummary.months.reduce((s, x) => s + Number(x.total_kwh || 0), 0) /
                      Math.max(1, monthlySummary.months.reduce((s, x) => s + Number(x.days_recorded || 0), 0))
                    ).toFixed(2)} kWh/d
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {monthlySummary.months.reduce((s, x) => s + Number(x.days_recorded || 0), 0)} days
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    ₹{monthlySummary.months.reduce((s, x) => s + Number(x.estimated_cost || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={handleDownloadCSV}
                      disabled={downloadingCsv}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download CSV
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">
            No monthly summary data recorded yet.
          </div>
        )}
      </div>

      {/* Recent Energy Readings Table & Management */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Recent Energy Readings
            </h3>
            <p className="text-xs text-slate-400">
              Logged meter readings saved to your household profile and used for ML forecasting.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard/forecast"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              Generate 30-Day Forecast <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              id="table-add-reading-btn"
              onClick={() => setIsAddReadingModalOpen(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" /> Add Reading
            </button>
          </div>
        </div>

        {readings.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No electricity readings recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Reading" to log your first meter reading.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Reading (kWh)</th>
                  <th className="text-left py-3 px-4 font-semibold">Source / Meter</th>
                  <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  <th className="text-right py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {readings.slice(-10).reverse().map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-medium">{r.date}</td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">{Number(r.kwh).toFixed(2)} kWh</td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
                        {r.source || 'Grid Meter'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs max-w-xs truncate">{r.notes || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        title="Delete reading"
                        onClick={() => handleDeleteReading(r.id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Reading Modal */}
      <AddReadingModal
        isOpen={isAddReadingModalOpen}
        onClose={() => setIsAddReadingModalOpen(false)}
        onReadingAdded={async () => {
          await refreshManualReadings();
        }}
      />
    </div>
  );
};

const UserDashboard = () => {
  return (
    <ApplianceProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <main className="pl-64 min-h-screen p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/bills" element={<BillAnalyzer />} />
            <Route path="/solar" element={<SolarROI />} />
            <Route path="/forecast" element={<EnergyForecasting />} />
            <Route path="/appliances" element={<ApplianceManagement />} />
            <Route path="/before-you-buy" element={<BeforeYouBuy />} />
            <Route path="/services" element={<ServiceProviders />} />
            <Route path="/audit" element={<HomeEnergyAudit />} />
          </Routes>
        </main>
      </div>
    </ApplianceProvider>
  );
};

export default UserDashboard;
