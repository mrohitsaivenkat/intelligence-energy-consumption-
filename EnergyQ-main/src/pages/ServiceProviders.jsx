import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Briefcase, Calendar, ChevronRight, ShieldCheck, Filter } from 'lucide-react';

const ServiceProviders = () => {
  const [providers, setProviders] = useState([
    { id: 1, name: 'CoolAir Solutions', category: 'AC Service', rating: 4.8, experience: 12, location: 'Mumbai', price: '₹500 - ₹2000', verified: true },
    { id: 2, name: 'Sparky Electricals', category: 'Electrical Maintenance', rating: 4.9, experience: 8, location: 'Delhi', price: '₹300 - ₹1500', verified: true },
    { id: 3, name: 'SolarEdge Systems', category: 'Solar Installation', rating: 4.7, experience: 15, location: 'Pune', price: 'Contact for Quote', verified: true },
  ]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Service Providers</h1>
          <p className="text-slate-400 text-sm">Find certified energy experts and maintenance professionals near you.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all text-white">
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <motion.div 
            key={provider.id} 
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:border-cyan-500/50 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <Briefcase className="w-7 h-7" />
              </div>
              {provider.verified && (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{provider.name}</h3>
            <p className="text-sm text-slate-400 mb-4">{provider.category}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-white">{provider.rating}</span> (120+ reviews)
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <MapPin className="w-4 h-4" />
                {provider.location}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Calendar className="w-4 h-4" />
                {provider.experience} Years Exp.
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Base Price</p>
                <p className="font-bold text-white">{provider.price}</p>
              </div>
              <button className="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white transition-all shadow-lg shadow-cyan-500/20">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ServiceProviders;
