"use client";

import { User as UserIcon, Mail, CreditCard, Key, Activity, Shield, Zap, ArrowRight, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string>("Loading...");
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        // Extract name from email (e.g., john.doe@gmail.com -> John Doe)
        const namePart = user.email.split('@')[0];
        const formattedName = namePart.split(/[\.\-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        setUserName(formattedName);
      } else {
        setUserEmail("Not logged in");
        setUserName("Guest User");
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Account Settings
          <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <SettingsIcon className="w-4 h-4" />
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile, usage, and API keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Profile & Plan) */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Profile Card */}
          <div className="bg-[#120B20] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -z-10 group-hover:bg-purple-500/20 transition-all"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{userName}</h3>
                <a href={`mailto:${userEmail}`} className="flex items-center gap-1.5 text-sm text-slate-400 mt-1 hover:text-brand transition-colors w-max">
                  <Mail className="w-3.5 h-3.5" /> {userEmail}
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={() => alert('Edit Profile modal opening...')} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
                Edit Profile
              </button>
              <button onClick={() => alert('Change Password flow initiating...')} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
                Change Password
              </button>
            </div>
          </div>

          {/* Current Plan Card */}
          <div className="bg-gradient-to-b from-[#1A102C] to-[#120B20] border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Current Plan</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-1">Pro Tier</h3>
            <p className="text-sm text-slate-400 mb-6">$49/month (Billed annually)</p>

            <button onClick={() => alert('Opening Stripe Billing Portal...')} className="w-full py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
              Manage Subscription
            </button>
          </div>

        </div>

        {/* Right Column (Usage & API Keys) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Usage Metrics Card */}
          <div className="bg-[#120B20] border border-white/5 rounded-3xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Usage Dashboard</h3>
                <p className="text-sm text-slate-400">Your API usage and limits for the current billing cycle.</p>
              </div>
              <Activity className="w-6 h-6 text-purple-400 opacity-50" />
            </div>

            <div className="space-y-8">
              
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">API Requests</span>
                  <span className="text-white font-bold">45,200 <span className="text-slate-500 font-normal">/ 100,000</span></span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-brand w-[45%] rounded-full relative">
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Active Agents</span>
                  <span className="text-white font-bold">4 <span className="text-slate-500 font-normal">/ 10</span></span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[40%] rounded-full relative"></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">Vector Storage (RAG)</span>
                  <span className="text-white font-bold">1.2 GB <span className="text-slate-500 font-normal">/ 5 GB</span></span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 w-[24%] rounded-full relative"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Small icon helper
function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
