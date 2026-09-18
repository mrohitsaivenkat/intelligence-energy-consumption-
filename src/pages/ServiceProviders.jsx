import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Briefcase, ChevronRight, ShieldCheck, 
  Search, Clock, CheckCircle, Award, 
  X, Send, Wrench, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CITIES = [
  'All India',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kochi',
  'Chandigarh'
];

const CATEGORIES = [
  'All Specialties',
  'Solar Installation',
  'AC Service',
  'Electrical Maintenance',
  'Energy Audit'
];

const ServiceProviders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' or 'bookings'
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [selectedCategory, setSelectedCategory] = useState('All Specialties');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    service_type: 'Solar Installation & Assessment',
    description: '',
    requested_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time_slot: 'Morning (09:00 AM - 12:00 PM)',
    address: 'Flat 402, Green Heights, Andheri West, Mumbai 400053',
    contact_phone: '+91 98765 43210'
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // User's own service requests
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch providers from backend
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's bookings
  const fetchMyRequests = async () => {
    if (!user?.id) return;
    try {
      setRequestsLoading(true);
      const res = await fetch(`/api/service-requests/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchMyRequests();
    }
  }, [activeTab, user?.id]);

  const openBookingModal = (provider) => {
    setSelectedProvider(provider);
    setBookingForm(prev => ({
      ...prev,
      service_type: provider.categories.split(',')[0].trim(),
      description: `Requesting inspection and service for ${provider.categories}. Household energy audit and optimization.`
    }));
    setBookingModalOpen(true);
    setBookingSuccess(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    try {
      setBookingSubmitting(true);
      const payload = {
        user_id: user?.id || 1,
        provider_id: selectedProvider.id,
        service_type: bookingForm.service_type,
        description: `${bookingForm.description} [Preferred Slot: ${bookingForm.time_slot}] [Phone: ${bookingForm.contact_phone}]`,
        requested_date: bookingForm.requested_date,
        address: bookingForm.address,
      };

      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setBookingSuccess(created);
        fetchMyRequests();
      } else {
        alert('Could not submit booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Network error while booking. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Filter providers
  const filteredProviders = providers.filter(p => {
    const matchesCity = selectedCity === 'All India' || p.location.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCategory = selectedCategory === 'All Specialties' || p.categories.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-white">Certified Energy Service Providers</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
              Pan-India Network
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Empanelled solar installers, BEE-certified energy auditors, and state DISCOM-approved electrical contractors across India.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'directory' 
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Find Technicians ({providers.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookings' 
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Bookings
            {myRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">
                {myRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {activeTab === 'directory' ? (
        <>
          {/* Search and Filters Bar */}
          <div className="bg-slate-900/70 border border-white/10 p-5 rounded-3xl backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative md:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by name, skill, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                />
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c === 'All India' ? 'All Indian Cities' : `${c} Metro`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-3 py-2.5 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Accreditation Badge Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Verified Standards:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-400 font-medium">
                ✓ MNRE Empanelled Solar Vendors
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-400 font-medium">
                ✓ BEE Certified Energy Auditors
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-400 font-medium">
                ✓ State DISCOM Licensed Electricians
              </span>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading verified technicians across India...
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-slate-400">
              <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="font-bold text-white text-base">No providers match your filter criteria</p>
              <p className="text-xs mt-1">Try selecting "All India" or clear your search term.</p>
              <button
                onClick={() => { setSelectedCity('All India'); setSelectedCategory('All Specialties'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-bold transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider) => (
                <motion.div 
                  key={provider.id} 
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      {provider.verified && (
                        <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5" /> Empanelled
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {provider.business_name}
                    </h3>
                    <p className="text-xs text-cyan-400/90 font-medium mb-3">
                      {provider.categories}
                    </p>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {provider.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-white">{provider.rating}</span>
                        <span className="text-[10px] text-slate-500">(150+ jobs)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-white font-medium">{provider.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>{provider.experience_years} Yrs Experience</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{provider.availability_status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Estimated Charge</p>
                      <p className="font-bold text-white text-xs">{provider.base_price}</p>
                    </div>
                    <button 
                      onClick={() => openBookingModal(provider)}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Service</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Bookings Tab */
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Your Scheduled & Past Service Requests</h3>
                <p className="text-xs text-slate-400 mt-1">Track certified technician dispatch, consultation status, and inspection results.</p>
              </div>
              <button
                onClick={fetchMyRequests}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-slate-300 rounded-xl font-medium border border-white/10"
              >
                Refresh Status
              </button>
            </div>

            {requestsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading your service records...</div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-bold text-sm">You haven't requested any services yet</p>
                <p className="text-slate-400 text-xs mt-1 mb-4">Browse certified solar EPC vendors, AC servicing engineers, and electricians in the directory.</p>
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  Explore Directory
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5 text-left">Service & Provider</th>
                      <th className="px-6 py-3.5 text-left">Appointment Date</th>
                      <th className="px-6 py-3.5 text-left">Location Address</th>
                      <th className="px-6 py-3.5 text-left">Status</th>
                      <th className="px-6 py-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{req.service_type}</div>
                          <div className="text-cyan-400 text-[11px]">{req.provider_name} • {req.provider_location}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5 max-w-xs truncate">{req.description}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-mono">
                          {req.requested_date}
                        </td>
                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                          {req.address}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            req.status === 'Pending' 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : req.status === 'Accepted' || req.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[11px] text-slate-500">
                            Ticket #{req.id}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModalOpen && selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setBookingModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {bookingSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Service Request Confirmed!</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Your service ticket <span className="font-mono font-bold text-cyan-400">#{bookingSuccess.id}</span> has been dispatched to <span className="font-semibold text-white">{selectedProvider.business_name}</span>. The technician will contact you on your registered phone number.
                  </p>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheduled Date:</span>
                      <span className="font-bold text-white">{bookingForm.requested_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Preferred Slot:</span>
                      <span className="font-bold text-white">{bookingForm.time_slot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="font-bold text-white truncate max-w-[200px]">{bookingForm.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setBookingModalOpen(false);
                        setActiveTab('bookings');
                      }}
                      className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
                    >
                      View in My Bookings
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4" /> Certified Technician Appointment
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedProvider.business_name}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedProvider.location} • {selectedProvider.categories} • {selectedProvider.experience_years} yrs exp.
                    </p>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Service Type</label>
                      <select
                        value={bookingForm.service_type}
                        onChange={(e) => setBookingForm({ ...bookingForm, service_type: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                      >
                        <option value="Solar Rooftop Assessment & PM Surya Ghar">Solar Rooftop Assessment & PM Surya Ghar Subsidy</option>
                        <option value="Inverter AC Maintenance & Deep Coil Clean">Inverter AC Maintenance & Deep Coil Clean</option>
                        <option value="Home Electrical Safety & Earthing Audit">Home Electrical Safety & Earthing Audit</option>
                        <option value="Smart Energy Meter Installation">Smart Energy Meter Installation</option>
                        <option value="BLDC Motor Fan & Energy Appliance Upgrade">BLDC Motor Fan & Energy Appliance Upgrade</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Date</label>
                        <input
                          type="date"
                          required
                          value={bookingForm.requested_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, requested_date: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Time Slot</label>
                        <select
                          value={bookingForm.time_slot}
                          onChange={(e) => setBookingForm({ ...bookingForm, time_slot: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                        >
                          <option value="Morning (09:00 AM - 12:00 PM)">Morning (9 AM - 12 PM)</option>
                          <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12 PM - 4 PM)</option>
                          <option value="Evening (04:00 PM - 08:00 PM)">Evening (4 PM - 8 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Service Address (Pan-India)</label>
                      <input
                        type="text"
                        required
                        placeholder="House / Flat No., Society / Street, City & Pincode"
                        value={bookingForm.address}
                        onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone Number (+91)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={bookingForm.contact_phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, contact_phone: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Issue Description / Instructions</label>
                      <textarea
                        rows="3"
                        required
                        value={bookingForm.description}
                        onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                        placeholder="Describe what needs repair, inspection, or quotation..."
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 px-4 text-white text-xs focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none"
                      />
                    </div>

                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-between text-xs">
                      <span className="text-slate-300">Base Price Benchmark:</span>
                      <span className="font-bold text-cyan-400">{selectedProvider.base_price}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {bookingSubmitting ? (
                        <span>Submitting Ticket...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Confirm & Book Appointment</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceProviders;
