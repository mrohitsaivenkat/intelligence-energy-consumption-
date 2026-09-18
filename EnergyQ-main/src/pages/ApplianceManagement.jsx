import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Zap, X, Info, Sliders, ShoppingBag } from 'lucide-react';
import { useAppliances, CATEGORIZED_PRESETS, TARIFF_RATE } from '../context/ApplianceContext';
import ConnectedDataSourceBadge from '../components/ConnectedDataSourceBadge';

const ApplianceManagement = () => {
  const {
    appliances,
    addAppliance,
    updateAppliance,
    removeAppliance,
    totalMonthlyKwh,
    totalMonthlyCost,
    highestConsumer
  } = useAppliances();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);

  // Add form state
  const [selectedCategory, setSelectedCategory] = useState('Cooling & Ventilation');
  const [selectedPreset, setSelectedPreset] = useState('Air Conditioner (1.5 Ton Inverter)');
  const [isCustom, setIsCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Air Conditioner (1.5 Ton Inverter)',
    category: 'Cooling & Ventilation',
    power: 1500,
    quantity: 1,
    hours: 8,
    days: 30
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Cooling & Ventilation',
    power: 1000,
    quantity: 1,
    hours: 6,
    days: 30
  });

  const categories = Object.keys(CATEGORIZED_PRESETS);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'Other') {
      setIsCustom(true);
      setFormData((prev) => ({
        ...prev,
        category: 'Other',
        name: '',
        power: 100,
        hours: 2
      }));
    } else {
      const presets = CATEGORIZED_PRESETS[category] || [];
      if (presets.length > 0) {
        setIsCustom(false);
        const first = presets[0];
        setSelectedPreset(first.name);
        setFormData((prev) => ({
          ...prev,
          category,
          name: first.name,
          power: first.power,
          hours: first.hours
        }));
      }
    }
  };

  const handlePresetSelect = (presetName) => {
    setSelectedPreset(presetName);
    if (presetName === 'ADD_OTHER') {
      setIsCustom(true);
      setFormData((prev) => ({
        ...prev,
        name: '',
        power: 100,
        hours: 2
      }));
    } else {
      setIsCustom(false);
      const presets = CATEGORIZED_PRESETS[selectedCategory] || [];
      const found = presets.find((p) => p.name === presetName);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          name: found.name,
          category: found.category,
          power: found.power,
          hours: found.hours
        }));
      }
    }
  };

  const openAddModal = () => {
    setSelectedCategory('Cooling & Ventilation');
    const first = CATEGORIZED_PRESETS['Cooling & Ventilation'][0];
    setSelectedPreset(first.name);
    setIsCustom(false);
    setFormData({
      name: first.name,
      category: 'Cooling & Ventilation',
      power: first.power,
      quantity: 1,
      hours: first.hours,
      days: 30
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const finalName = formData.name.trim();
    if (!finalName) return;

    addAppliance({
      name: finalName,
      category: formData.category,
      power: Number(formData.power) || 100,
      quantity: Number(formData.quantity) || 1,
      hours: Number(formData.hours) || 1,
      days: Number(formData.days) || 30
    });

    setIsAddModalOpen(false);
  };

  const openEditModal = (app) => {
    setEditingAppliance(app);
    setEditFormData({
      name: app.name,
      category: app.category,
      power: app.power,
      quantity: app.quantity,
      hours: app.hours,
      days: app.days || 30
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingAppliance || !editFormData.name.trim()) return;

    updateAppliance(editingAppliance.id, {
      name: editFormData.name.trim(),
      category: editFormData.category,
      power: Number(editFormData.power) || 100,
      quantity: Number(editFormData.quantity) || 1,
      hours: Number(editFormData.hours) || 1,
      days: Number(editFormData.days) || 30
    });

    setIsEditModalOpen(false);
    setEditingAppliance(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white">Household Appliance Inventory</h1>
            <ConnectedDataSourceBadge />
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Track and manage electrical devices, power consumption, and operating schedules across your home.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/dashboard/before-you-buy"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-cyan-400 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" /> Before You Buy
          </Link>
          <button
            id="btn-add-appliance-main"
            onClick={openAddModal}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 text-white cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add Appliance
          </button>
        </div>
      </header>

      {/* Main Inventory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appliances List */}
        <div className="lg:col-span-2 space-y-4">
          {appliances.length === 0 ? (
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center">
              <Zap className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Appliances Registered</h3>
              <p className="text-slate-400 text-sm mb-6">
                Add your household devices to calculate consumption and unlock custom efficiency audits.
              </p>
              <button
                onClick={openAddModal}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-bold cursor-pointer"
              >
                Add First Appliance
              </button>
            </div>
          ) : (
            appliances.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{app.name}</h3>
                      {app.quantity > 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                          x{app.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="text-cyan-300">{app.category}</span> • {app.power}W • {app.hours} hrs/day ({app.days || 30} days/mo)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Monthly Est.</p>
                    <p className="text-base font-bold text-white">
                      {app.monthlyKwh} kWh <span className="text-cyan-400">/ ₹{app.cost.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(app)}
                      className="p-2 hover:bg-cyan-500/10 rounded-xl text-slate-400 hover:text-cyan-400 transition-all border border-transparent hover:border-cyan-500/20 cursor-pointer"
                      title="Edit Appliance"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeAppliance(app.id)}
                      className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                      title="Delete Appliance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Stats Summary Sidebar */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm h-fit space-y-6">
          <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4 flex items-center justify-between">
            <span>Inventory Overview</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </h3>

          {highestConsumer && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
              <p className="text-xs text-cyan-300 font-medium mb-1">Top Energy Consumer</p>
              <p className="text-lg font-bold text-white">{highestConsumer.name}</p>
              <p className="text-xs text-cyan-400 font-semibold mt-1">
                ₹{highestConsumer.cost} / mo ({Math.round((highestConsumer.cost / (totalMonthlyCost || 1)) * 100)}% of appliance load)
              </p>
            </div>
          )}

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Total Appliance Units</span>
              <span className="text-white font-bold">{appliances.reduce((s, a) => s + (a.quantity || 1), 0)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Combined Consumption</span>
              <span className="text-cyan-400 font-bold font-mono">{totalMonthlyKwh.toFixed(1)} kWh/mo</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Est. Total Cost (@ ₹{TARIFF_RATE}/kWh)</span>
              <span className="text-green-400 font-bold text-lg">₹{totalMonthlyCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              These appliances automatically synchronize with your <strong>Energy Audit</strong> for tailored room and appliance recommendations.
            </span>
          </div>
        </div>
      </div>

      {/* Add Appliance Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6 relative my-8"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" /> Add Household Appliance
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">1. Select Category</label>
                  <select
                    id="modal-category-select"
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Appliance Preset or Custom */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">2. Specific Appliance</label>
                    <button
                      type="button"
                      onClick={() => handlePresetSelect('ADD_OTHER')}
                      className={`text-xs underline cursor-pointer ${isCustom ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      + Add Other Appliance
                    </button>
                  </div>

                  {!isCustom && selectedCategory !== 'Other' ? (
                    <select
                      id="modal-preset-select"
                      value={selectedPreset}
                      onChange={(e) => handlePresetSelect(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    >
                      {(CATEGORIZED_PRESETS[selectedCategory] || []).map((preset) => (
                        <option key={preset.name} value={preset.name} className="bg-slate-900">
                          {preset.name} ({preset.power}W)
                        </option>
                      ))}
                      <option value="ADD_OTHER" className="bg-slate-900 font-bold text-cyan-400">
                        + Add Other Appliance (Custom)
                      </option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        id="modal-custom-name-input"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Air Purifier, Espresso Machine, Dehumidifier"
                        className="w-full bg-slate-950 border border-cyan-500/40 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-300">Custom appliance mode</span>
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(selectedCategory === 'Other' ? 'Kitchen' : selectedCategory)}
                          className="text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Switch back to presets
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Power Rating */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Power Rating (Watts)</label>
                  <input
                    id="modal-power-input"
                    type="number"
                    required
                    min="1"
                    max="15000"
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: Number(e.target.value) })}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>

                {/* Quantity, Hours, Days */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity</label>
                    <input
                      id="modal-qty-input"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hours / Day</label>
                    <input
                      id="modal-hours-input"
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="24"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Days / Mo</label>
                    <input
                      id="modal-days-input"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Calculation Preview */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-xs space-y-1">
                  <p className="text-slate-300">
                    Estimated Monthly Energy: <strong className="text-cyan-400">
                      {Math.round(((formData.power * formData.hours * formData.quantity) / 1000) * formData.days * 10) / 10} kWh
                    </strong>
                  </p>
                  <p className="text-slate-300">
                    Estimated Monthly Cost: <strong className="text-green-400">
                      ₹{Math.round(((formData.power * formData.hours * formData.quantity) / 1000) * formData.days * TARIFF_RATE).toLocaleString()}
                    </strong>
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-submit-add-btn"
                    type="submit"
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Save to Inventory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Appliance Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingAppliance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6 relative my-8"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-cyan-400" /> Edit Appliance
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Appliance Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Power Rating (Watts)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="15000"
                    value={editFormData.power}
                    onChange={(e) => setEditFormData({ ...editFormData, power: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={editFormData.quantity}
                      onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hours / Day</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="24"
                      value={editFormData.hours}
                      onChange={(e) => setEditFormData({ ...editFormData, hours: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Days / Mo</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={editFormData.days}
                      onChange={(e) => setEditFormData({ ...editFormData, days: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Calculation Preview */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-xs space-y-1">
                  <p className="text-slate-300">
                    Updated Monthly Energy: <strong className="text-cyan-400">
                      {Math.round(((editFormData.power * editFormData.hours * editFormData.quantity) / 1000) * editFormData.days * 10) / 10} kWh
                    </strong>
                  </p>
                  <p className="text-slate-300">
                    Updated Monthly Cost: <strong className="text-green-400">
                      ₹{Math.round(((editFormData.power * editFormData.hours * editFormData.quantity) / 1000) * editFormData.days * TARIFF_RATE).toLocaleString()}
                    </strong>
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Update Appliance
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplianceManagement;
