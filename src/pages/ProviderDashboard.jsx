import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, Calendar, Users, 
  CreditCard, Bell, User, LogOut, CheckCircle, XCircle, Clock, ShieldCheck
} from 'lucide-react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProviderSidebar = ({ activePath }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '' },
    { icon: ClipboardList, label: 'Requests', path: 'requests' },
    { icon: Calendar, label: 'Schedule', path: 'schedule' },
    { icon: Users, label: 'Customers', path: 'customers' },
    { icon: CreditCard, label: 'Earnings', path: 'earnings' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-white/10 h-screen fixed left-0 top-0 p-4 flex flex-col z-50">
      <div className="flex items-center gap-2 px-2 mb-8 text-cyan-400">
        <Users className="w-7 h-7" />
        <span className="text-xl font-bold text-white tracking-tight">PROVIDER PRO</span>
      </div>
      
      <div className="flex-1 space-y-1.5">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activePath === item.path ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Provider Profile & Sign Out */}
      <div className="mt-auto border-t border-white/5 pt-4 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/30">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user?.full_name || 'Rajesh Kumar'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || 'provider@example.com'}</div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          id="provider-sign-out-btn"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const ProviderHome = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([
    { id: 1, customer: 'Amit Sharma (Mumbai)', service: 'AC Maintenance & Coil Cleaning', date: 'Today, 2:30 PM', status: 'Pending' },
    { id: 2, customer: 'Priya Patel (Delhi NCR)', service: 'Sub-meter & Smart Inverter Inspection', date: 'Tomorrow, 10:00 AM', status: 'Scheduled' },
    { id: 3, customer: 'Rohit Mulaparthi (Bengaluru)', service: '5kW Rooftop Solar Efficiency Audit', date: 'Next Monday, 4:00 PM', status: 'Pending' },
  ]);

  // Fetch provider requests from API if available
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const providerId = user?.id || 1;
        const res = await fetch(`/api/service-requests/provider/${providerId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(d => ({
              id: d.id,
              customer: `Household #${d.user_id} (${d.address})`,
              service: `${d.service_type} - ${d.description}`,
              date: d.requested_date,
              status: d.status
            }));
            setRequests(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching provider requests:', err);
      }
    };
    fetchRequests();
  }, [user?.id]);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/service-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
    }
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <header>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.full_name || 'Rajesh Kumar'}!</h1>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified Partner
          </span>
        </div>
        <p className="text-slate-400 text-sm">Manage household service appointments, technician schedules, and energy repair requests.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Earnings', value: '₹24,500', icon: CreditCard, color: 'text-green-400' },
          { label: 'Pending Requests', value: String(requests.filter(r => r.status === 'Pending').length), icon: Clock, color: 'text-yellow-400' },
          { label: 'Completed Jobs', value: '48', icon: CheckCircle, color: 'text-cyan-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Active Service Requests</h3>
          <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Real-time queue</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Service Requested</th>
                <th className="px-6 py-4 text-left">Preferred Slot</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{req.customer}</td>
                  <td className="px-6 py-4 text-slate-300">{req.service}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{req.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Pending' 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                        : req.status === 'Accepted' || req.status === 'Scheduled'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {req.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => updateStatus(req.id, 'Accepted')}
                          title="Accept request"
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(req.id, 'Declined')}
                          title="Decline request"
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Updated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProviderDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ProviderSidebar activePath="" />
      <main className="pl-64 p-8">
        <Routes>
          <Route path="/" element={<ProviderHome />} />
        </Routes>
      </main>
    </div>
  );
};

export default ProviderDashboard;
