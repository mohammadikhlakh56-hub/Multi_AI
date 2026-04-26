"use client";

import { Plus, Bot, Sparkles, Activity, Clock, Zap, ArrowRight, MoreHorizontal, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import AgentChatPanel from "@/components/dashboard/AgentChatPanel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/agents")
      .then(res => {
        if (!res.ok) throw new Error("Server error " + res.status);
        return res.json();
      })
      .then(data => {
        if (data && data.data) {
          setAgents(data.data);
        }
      })
      .catch(err => {
        console.log("Could not fetch agents. Is the backend running?", err.message);
        setError("Backend connection failed.");
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <motion.div 
      className="animate-fade-in-up"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-brand">Creator</span>
          </h1>
          <p className="text-slate-400 text-sm">Manage your autonomous agents and monitor performance.</p>
        </div>
        
        {/* Primary CTA */}
        <Link href="/dashboard/create" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white text-sm font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          Create AI Agent
        </Link>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Create Agent Card & Stats */}
        <div className="xl:col-span-1 flex flex-col gap-8">
          
          {/* Create Agent Highlight Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-[#120B20] border border-white/10 rounded-3xl p-8 relative overflow-hidden group shadow-lg"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand/20 rounded-full blur-[60px] -z-10 group-hover:bg-brand/30 transition-all"></div>
            
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand text-white flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">Generate Agent</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Use our AI builder to automatically generate a custom agent based on your specific requirements.
            </p>
            
            <Link href="/dashboard/create" className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white text-[#0A0710] text-sm font-bold rounded-full hover:bg-slate-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-[#120B20]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Activity className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium uppercase tracking-wider">Requests</span>
              </div>
              <div className="text-2xl font-bold text-white">45.2k</div>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-[#120B20]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
              </div>
              <div className="text-2xl font-bold text-white">112ms</div>
            </motion.div>
          </div>

        </div>

        {/* Right Column: Active Agents Table */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="bg-[#120B20] border border-white/5 rounded-3xl overflow-hidden h-full flex flex-col">
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand" /> Active Agents
              </h3>
              <button className="text-xs font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white px-3 py-1.5 rounded-full transition-all">
                View All
              </button>
            </div>
            
            <div className="flex-1 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase tracking-widest border-b border-white/5">
                      <th className="pb-4 font-medium px-4">Agent Name</th>
                      <th className="pb-4 font-medium px-4">Role</th>
                      <th className="pb-4 font-medium px-4">Status</th>
                      <th className="pb-4 font-medium px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand" />
                          <p className="animate-pulse">Loading active agents...</p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-md mx-auto shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <Bot className="w-10 h-10 text-red-400 mx-auto mb-3 opacity-80" />
                            <p className="font-bold text-red-400 mb-1">Failed to Connect to Server</p>
                            <p className="text-sm text-red-400/80 mb-4">We couldn't fetch your active agents.</p>
                            <div className="bg-black/30 rounded-lg p-3 text-xs text-left font-mono text-red-300">
                              Please ensure the FastAPI backend is running on port 8000:<br/>
                              <span className="text-white">python main.py</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : agents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto border-dashed">
                            <Bot className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-300 font-medium mb-2">No active agents found</p>
                            <p className="text-sm text-slate-500 mb-6">Create your first AI agent to start automating tasks.</p>
                            <Link href="/dashboard/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition-colors">
                              <Plus className="w-4 h-4" /> Create Agent
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      agents.map((agent: any) => (
                        <tr 
                          key={agent.id} 
                          onClick={() => setSelectedAgent(agent)}
                          className="hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:scale-105 group-hover:bg-purple-500/20 transition-all uppercase shadow-sm">
                                {agent.agent_name.substring(0, 2)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white group-hover:text-brand transition-colors">{agent.agent_name}</div>
                                <div className="text-xs text-slate-500">ID: {agent.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400">{agent.agent_type}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                              <span className="text-xs font-medium text-emerald-400">Online</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}
                              className="text-brand hover:text-white hover:bg-brand rounded-lg transition-colors p-2 border border-brand/30 hover:border-brand shadow-[0_0_10px_rgba(139,92,246,0.1)] flex items-center gap-2 ml-auto text-xs font-bold"
                            >
                              <MessageSquare className="w-4 h-4" /> Chat
                            </button>
                          </td>
                        </tr>
                      ))
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Agent Chat Playground Modal */}
      <AgentChatPanel 
        agent={selectedAgent} 
        isOpen={!!selectedAgent} 
        onClose={() => setSelectedAgent(null)} 
      />

    </motion.div>
  );
}
