import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ClipboardList, Calendar, Users, 
  CreditCard, Bell, User, LogOut, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { Link, Routes, Route } from 'react-router-dom';

const ProviderSidebar = ({ activePath }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '' },
    { icon: ClipboardList, label: 'Requests', path: 'requests' },
    { icon: Calendar, label: 'Schedule', path: 'schedule' },
    { icon: Users, label: 'Customers', path: 'customers' },
    { icon: CreditCard, label: 'Earnings', path: 'earnings' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-white/10 h-screen fixed left-0 top-0 p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 mb-10 text-cyan-400">
        <Users className="w-8 h-8" />
        <span className="text-xl font-bold text-white">PROVIDER PRO</span>
      </div>
      
      <div className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.label} 
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activePath === item.path ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-auto">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

const ProviderHome = () => {
  const [requests, setRequests] = useState([
    { id: 1, customer: 'Amit Sharma', service: 'AC Maintenance', date: '2023-11-25', status: 'Pending' },
    { id: 2, customer: 'Priya Patel', service: 'Electrical Repair', date: '2023-11-26', status: 'Scheduled' },
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
        <p className="text-slate-400">Manage your service requests and appointments.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Earnings', value: '₹24,500', icon: CreditCard, color: 'text-green-400' },
          { label: 'Pending Requests', value: '12', icon: Clock, color: 'text-yellow-400' },
          { label: 'Completed Jobs', value: '48', icon: CheckCircle, color: 'text-cyan-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold">Recent Requests</h3>
          <Link to="requests" className="text-cyan-400 text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Service</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{req.customer}</td>
                  <td className="px-6 py-4 text-slate-300">{req.service}</td>
                  <td className="px-6 py-4 text-slate-400">{req.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-cyan-500/10 text-cyan-500'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-colors">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                      <XCircle className="w-5 h-5" />
                    </button>
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
