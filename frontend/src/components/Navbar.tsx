"use client";

import Link from "next/link";
import { Sparkles, Menu, ChevronDown, CircleUserRound, X, ArrowRight, Book, Users, MessageSquare, DollarSign, HelpCircle, Bot, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-6 px-6">
      <div className="max-w-[90rem] mx-auto">
        <div className="bg-[#120B20]/80 backdrop-blur-xl border border-white/5 rounded-full px-6 h-16 flex items-center justify-between shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          
          {/* Left: Empty to maintain center alignment of logo */}
          <div className="hidden md:flex items-center gap-4 w-[120px]"></div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Multi AI
            </span>
          </Link>

          {/* Right: Menu & CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#0A0710] text-sm font-bold hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Menu
              <Menu className="w-4 h-4 text-brand" />
            </button>
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all"
            >
              <CircleUserRound className="w-4 h-4" />
              Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Slide-over Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-[#0A0710]/80 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-[#120B20] border-l border-white/10 z-50 p-8 flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold tracking-tight text-white">Navigation</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links List */}
              <div className="flex flex-col gap-4 mb-12">
                <Link href="#" className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white hover:translate-x-2 transition-all p-2 rounded-lg hover:bg-white/5">
                  <DollarSign className="w-5 h-5 text-brand" /> Pricing
                </Link>
                <Link href="#" className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white hover:translate-x-2 transition-all p-2 rounded-lg hover:bg-white/5">
                  <Book className="w-5 h-5 text-brand" /> Documentation
                </Link>
                <Link href="#" className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white hover:translate-x-2 transition-all p-2 rounded-lg hover:bg-white/5">
                  <Users className="w-5 h-5 text-brand" /> About Us
                </Link>
                <Link href="#" className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white hover:translate-x-2 transition-all p-2 rounded-lg hover:bg-white/5">
                  <MessageSquare className="w-5 h-5 text-brand" /> Blog
                </Link>
                <Link href="#" className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white hover:translate-x-2 transition-all p-2 rounded-lg hover:bg-white/5">
                  <HelpCircle className="w-5 h-5 text-brand" /> Contact Support
                </Link>
              </div>

              {/* Our Services Section */}
              <div className="mt-auto">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-white/10 pb-4">Our Services</h4>
                
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Autonomous Agents</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Self-learning AI that handles support, sales, and data entry automatically.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Predictive Analytics</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Advanced models to predict trends and optimize business strategies.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Enterprise Security</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">Bank-grade encryption ensures your proprietary data remains safe.</p>
                    </div>
                  </div>
                </div>

                <Link href="/login" className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all">
                  Start Building <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </nav>
  );
}
