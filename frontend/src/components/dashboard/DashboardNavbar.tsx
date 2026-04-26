"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, PlusCircle, Settings, User } from "lucide-react";

export default function DashboardNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pt-6 px-6">
      <div className="max-w-[90rem] mx-auto">
        <div className="bg-[#120B20]/80 backdrop-blur-xl border border-white/5 rounded-full px-6 h-16 flex items-center justify-between shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          
          {/* Left: Navigation Links */}
          <div className="hidden md:flex items-center gap-2 w-[300px]">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <LayoutDashboard className="w-4 h-4 text-brand" />
              Overview
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-400 text-sm font-medium hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Multi AI
            </span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 w-[300px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-brand flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 text-sm font-medium rounded-full hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}
