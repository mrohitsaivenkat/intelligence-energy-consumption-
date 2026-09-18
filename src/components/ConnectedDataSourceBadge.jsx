import React, { useState } from 'react';
import { 
  FileText, 
  Zap, 
  TrendingUp, 
  Layers, 
  ChevronDown, 
  CheckCircle2, 
  Info, 
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useHouseholdEnergy } from '../context/ApplianceContext';

const ConnectedDataSourceBadge = ({ compact = false, showSwitcher = true }) => {
  const { householdBaseline, allSources, preferredSource, setPreferredSource } = useHouseholdEnergy();
  const [modalOpen, setModalOpen] = useState(false);

  if (!householdBaseline) return null;

  const getSourceIcon = (key) => {
    switch (key) {
      case 'uploaded_bill':
        return FileText;
      case 'manual_reading':
        return Zap;
      case 'uploaded_csv':
        return TrendingUp;
      default:
        return Layers;
    }
  };

  const Icon = getSourceIcon(householdBaseline.sourceKey);

  return (
    <>
      <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-sm text-xs">
        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-semibold">{householdBaseline.sourceLabel}</span>
        </div>

        <span className="text-slate-600">•</span>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          householdBaseline.isActual 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {householdBaseline.isActual ? 'Actual Bill' : 'Estimated'}
        </span>

        {showSwitcher && (
          <button
            onClick={() => setModalOpen(true)}
            title="View or change baseline data source"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 ml-1 font-semibold"
          >
            <span>{preferredSource !== 'auto' ? 'Customized' : 'Source Info'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Source Inspector & Switcher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Household Energy Data Source</h3>
                  <p className="text-xs text-slate-400">Connected across Dashboard, Before You Buy, Solar, & Audit</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-500/20 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-200/90 leading-relaxed">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                To avoid conflicting bills, all calculators throughout the application use the same single baseline bill (currently <strong className="text-white">₹{householdBaseline.currentBill.toLocaleString()} / mo</strong>). You can keep automatic priority (recommended) or choose a specific source below.
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Household Sources</p>

              {/* Automatic Mode Option */}
              <div
                onClick={() => setPreferredSource('auto')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  preferredSource === 'auto'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">Automatic Priority (Recommended)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">Default</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Auto-selects: Latest Uploaded Bill → Manual Readings → Uploaded CSV → Appliance Inventory
                    </p>
                  </div>
                </div>
                {preferredSource === 'auto' && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
              </div>

              {/* List all concrete sources */}
              {allSources.map((source) => {
                const ItemIcon = getSourceIcon(source.key);
                const isCurrentActive = householdBaseline.sourceKey === source.key;

                return (
                  <div
                    key={source.key}
                    onClick={() => setPreferredSource(source.key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      preferredSource === source.key || (preferredSource === 'auto' && isCurrentActive)
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{source.shortLabel}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full ${
                            source.isActual 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {source.isActual ? 'Actual' : 'Estimated'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{source.detail}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">₹{source.bill.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{source.kwh} kWh/mo</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectedDataSourceBadge;
