"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <section className="py-32 bg-[#0A0710] relative">
      <div className="max-w-[90rem] mx-auto px-6">
        
        {/* Section 1: About Us / Workflow */}
        <div className="flex flex-col lg:flex-row gap-12 mb-32 items-center">
          {/* Left Graphic */}
          <div className="w-full lg:w-1/2 relative h-[400px] rounded-3xl overflow-hidden group">
            <Image 
              src="/purple_flow.png" 
              alt="Purple Flow Abstract" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay Glass Box */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[80%] bg-[#120B20]/80 backdrop-blur-md border border-white/10 p-8 rounded-l-2xl shadow-2xl">
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Leverage our AI agents to automate repetitive tasks, reduce costs, and improve your bottom line seamlessly.
              </p>
              <button className="flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-hover transition-colors">
                <span className="border-b border-brand pb-0.5">Service</span>
                <ArrowDown className="w-4 h-4 bg-brand text-white rounded-full p-0.5" />
              </button>
            </div>
          </div>

          {/* Right Text */}
          <div className="w-full lg:w-1/2 lg:pl-12">
            <h4 className="text-brand text-xs font-bold tracking-widest uppercase mb-4">About Us</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Automate Everything.</span><br/>
              Deploy intelligent agents that work tirelessly for you.
            </h2>
          </div>
        </div>

        {/* Section 2: Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          
          {/* Card 1 */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-[#120B20] border border-white/5 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between min-h-[350px] shadow-lg"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/20 rounded-full blur-[60px] -z-10 group-hover:bg-brand/30 transition-all"></div>
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold text-white max-w-[150px]">Workflow Automation</h3>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-brand"></div>
              </div>
            </div>
            
            <div className="relative h-32 mt-8 w-full rounded-xl overflow-hidden mb-8">
               <Image src="/purple_waves.png" alt="Waves" fill className="object-cover opacity-60" />
            </div>

            <div className="flex justify-between items-center w-full">
              <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-full hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all">
                Get Started
              </Link>
              <span className="text-xs text-slate-500 border border-white/10 rounded-full px-3 py-1">Productivity</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-[#120B20] border border-white/5 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between min-h-[350px] items-center text-center shadow-lg"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Generate AI<br/>Agents</h3>
            
            <div className="flex gap-2 mb-8">
              <div className="w-8 h-12 bg-white rounded-md"></div>
              <div className="w-8 h-12 bg-purple-200 rounded-md"></div>
              <div className="w-8 h-12 bg-purple-400 rounded-md"></div>
              <div className="w-8 h-12 bg-brand rounded-md shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
              <div className="w-8 h-12 bg-purple-900 rounded-md"></div>
            </div>

            <Link href="/login" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all w-full text-center">
              Get Started
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-[#120B20] border border-white/5 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between min-h-[350px] text-center shadow-lg"
          >
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-brand/10 to-transparent -z-10"></div>
            <h3 className="text-2xl font-bold text-white mb-8">Cost<br/>Optimization</h3>
            
            <Link href="/login" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all mx-auto mb-8 text-center">
              Get Started
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto">
              Cut operational costs by automating and streamlining processes with intelligent agents.
            </p>
          </motion.div>

        </div>

        {/* Section 3: How it Works */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-1/3">
            <h4 className="text-brand text-xs font-bold tracking-widest uppercase mb-4">How It Works</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Accelerate</span> Business Performance.
            </h2>
          </div>
          
          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row items-center gap-6 justify-end">
             <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all">
               Get Started
             </Link>
             <Link href="/login" className="w-14 h-14 rounded-full border border-white/10 bg-[#120B20] flex items-center justify-center hover:bg-white/5 hover:scale-105 transition-all group shadow-[0_0_15px_rgba(255,255,255,0.05)]">
               <Play className="w-5 h-5 text-brand fill-current ml-1 group-hover:scale-110 transition-transform" />
             </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
