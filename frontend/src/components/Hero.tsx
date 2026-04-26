"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, ArrowUpRight, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 overflow-hidden bg-[#0A0710] min-h-[90vh] flex flex-col justify-center">
      
      {/* Background Purple/Magenta Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Massive BACKGROUND Text "INTELLIGENT" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none opacity-[0.03]">
        <h1 className="text-[15vw] font-black tracking-tighter text-white whitespace-nowrap">INTELLIGENT</h1>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 relative z-10 w-full flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/3 flex flex-col items-start z-20">
          <div className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-semibold text-purple-300 mb-8 backdrop-blur-md">
            Autonomous AI Workforce
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6">
            Boost Efficiency,<br />
            Maximize <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Profits.</span>
          </h1>
        </div>

        {/* Center 3D Orb */}
        <div className="w-full lg:w-1/3 h-[400px] md:h-[500px] relative flex items-center justify-center my-12 lg:my-0 z-30">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
          <Image 
            src="/purple_orb.png" 
            alt="3D Abstract Purple Orb" 
            fill 
            className="object-cover mix-blend-screen [mask-image:radial-gradient(circle_at_center,black_30%,transparent_50%)]"
            priority
          />
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/3 flex flex-col items-end text-right z-20">
          
          <div className="flex flex-col gap-6 mb-12 w-full max-w-[280px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-sm text-slate-300">Future-Ready<br/>Strategies</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-sm text-slate-300">24/7 Customer<br/>Support</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-[280px]">
            Use our AI platform to automate tasks, cut costs, and enhance your bottom line with intelligent agents.
          </p>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
            <Link href="/login" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Play className="w-4 h-4 text-white fill-current ml-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Metrics Bar */}
      <div className="max-w-[90rem] mx-auto px-6 mt-20 relative z-20 w-full">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          <div className="flex-1 bg-[#120B20]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex justify-between items-center w-full">
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-white mb-1">125k⁺</div>
              <div className="text-xs text-slate-400">Happy Client</div>
            </div>
            <Link href="/login" className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand text-white text-xs font-bold shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 transition-all flex items-center justify-center text-center leading-tight">
              Join<br/>Now
            </Link>
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-xs text-slate-400">Growth</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl font-bold text-white mb-1">25</div>
              <div className="text-xs text-slate-400">Years</div>
            </div>
          </div>

          <div className="flex-1 bg-[#120B20]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex items-center justify-between w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-400 pb-1">Trusted by.</span>
            <div className="flex items-center gap-6 opacity-60 grayscale">
              <span className="font-bold text-white tracking-wider">Niscala.io</span>
              <span className="font-bold text-white tracking-wider">SAMTIV</span>
              <span className="font-bold text-white tracking-wider">IEA.</span>
              <span className="font-bold text-white tracking-wider">BOKING</span>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
