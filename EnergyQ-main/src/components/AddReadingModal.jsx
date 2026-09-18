import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Calendar, Tag, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useHouseholdEnergy } from '../context/ApplianceContext';

const AddReadingModal = ({ isOpen, onClose, onReadingAdded, householdId = 1 }) => {
  const { refreshManualReadings } = useHouseholdEnergy();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [kwh, setKwh] = useState('');
  const [source, setSource] = useState('Grid Meter');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(kwh);
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid positive kWh consumption reading.');
      return;
    }
    if (!date) {
      setError('Please select a reading date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/energy/readings/${householdId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          kwh: val,
          date,
          source,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save electricity reading.');
      }

      const newRecord = await res.json();
      setSuccess(true);
      await refreshManualReadings();
      if (onReadingAdded) {
        onReadingAdded(newRecord);
      }

      setTimeout(() => {
        setSuccess(false);
        setKwh('');
        setNotes('');
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'An error occurred while saving reading.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="add-reading-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target.id === 'add-reading-modal-backdrop') onClose();
        }}
      >
        <motion.div
          id="add-reading-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add Energy Reading</h3>
                <p className="text-xs text-slate-400">Log electricity consumption for forecasting</p>
              </div>
            </div>
            <button
              id="close-add-reading-modal-btn"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-2xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-300 text-xs p-3 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Reading saved successfully! Updating charts...
            </div>
          )}

          {/* Form */}
          <form id="add-reading-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Reading Date
              </label>
              <input
                id="reading-date-input"
                type="date"
                required
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> Energy Consumption (kWh / Units)
              </label>
              <input
                id="reading-kwh-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 14.5"
                required
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" /> Meter / Source
              </label>
              <select
                id="reading-source-select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
              >
                <option value="Grid Meter" className="bg-slate-900 text-white">Grid Meter (Main)</option>
                <option value="Solar Inverter" className="bg-slate-900 text-white">Solar Inverter</option>
                <option value="Sub-Meter" className="bg-slate-900 text-white">Sub-Meter (Floor / AC)</option>
                <option value="Backup Generator" className="bg-slate-900 text-white">Backup Generator</option>
                <option value="Manual Entry" className="bg-slate-900 text-white">Manual Utility Bill Entry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes (Optional)
              </label>
              <input
                id="reading-notes-input"
                type="text"
                placeholder="e.g. Heavy AC usage, guests stayed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                id="cancel-add-reading-btn"
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-3 rounded-2xl text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                id="submit-add-reading-btn"
                type="submit"
                disabled={loading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white py-3 rounded-2xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Saving...' : 'Save Reading'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddReadingModal;
