import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, User, Bot, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import axios from 'axios';

const QUICK_PROMPTS = [
  'How do I claim the ₹78,000 PM Surya Ghar rooftop solar subsidy?',
  'How much can I save by setting my AC from 18°C to 24°C in India?',
  'Explain how telescopic electricity tariff slabs work in Indian DISCOMs.',
  'Is it worth upgrading my old ceiling fans to BEE 5-star BLDC fans?',
  'What are the best peak vs off-peak electricity habits for Indian homes?'
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Namaste! I am your Smart Household Energy Advisor, calibrated for residential households across India.\n\nI can help you understand your state DISCOM bills (MSEDCL, BESCOM, BSES, TANGEDCO, etc.), optimize appliance consumption, calculate solar ROI under PM Surya Ghar Muft Bijli Yojana, or navigate BEE Star ratings. What would you like to explore today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: queryText }]);
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('/api/ai/chat', {
        message: queryText,
        user_id: parseInt(userId, 10) || 1
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Apologies, I encountered a temporary connection issue. Please make sure the energy service is reachable and try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">Household Energy AI Advisor</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                Pan-India DISCOM Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Powered by Gemini 2.5 • Trained on Indian tariffs, BEE standards & PM Surya Ghar
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-cyan-500 text-white rounded-tr-none shadow-md shadow-cyan-500/10' 
                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none leading-relaxed'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">Analyzing Indian energy tariffs and household data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2 border-t border-white/5 bg-slate-950/40">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-medium">
          <HelpCircle className="w-3 h-3 text-cyan-400" /> Popular Inquiries in India:
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => sendQuery(prompt)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-left disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-900/80">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500"
            placeholder="Ask about electricity bills, solar subsidies, inverter AC savings, or BEE ratings..."
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant;
