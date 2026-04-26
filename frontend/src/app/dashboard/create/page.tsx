"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles, Bot, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    agent_name: "",
    agent_type: "Sales Outreach",
    model_choice: "llama-3.1-8b-instant",
    system_prompt: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      // Route back to dashboard to see the new agent
      router.push("/dashboard");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Build New Agent
            <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure your AI agent's personality and capabilities.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#120B20] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agent Name</label>
              <input 
                required
                name="agent_name"
                value={formData.agent_name}
                onChange={handleChange}
                type="text" 
                placeholder="e.g. Atlas, SupportBot, DataPro"
                className="w-full bg-[#0A0710] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Agent Role / Type</label>
              <div className="relative">
                <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  name="agent_type"
                  value={formData.agent_type}
                  onChange={handleChange}
                  className="w-full bg-[#0A0710] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none transition-all cursor-pointer"
                >
                  <option value="Sales Outreach">Sales Outreach</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Data Analyzer">Data Analyzer</option>
                  <option value="Research Assistant">Research Assistant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Language Model</label>
              <select 
                name="model_choice"
                value={formData.model_choice}
                onChange={handleChange}
                className="w-full bg-[#0A0710] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none transition-all cursor-pointer"
              >
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Smart)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Complex)</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between items-end">
              System Prompt
              <span className="text-xs text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded text-opacity-80">Core Instructions</span>
            </label>
            <textarea 
              required
              name="system_prompt"
              value={formData.system_prompt}
              onChange={handleChange}
              placeholder="You are a helpful AI assistant. Your goal is to..."
              className="w-full flex-1 min-h-[200px] bg-[#0A0710] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600 resize-none font-mono text-sm leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-white/5 flex justify-end gap-4">
          <Link href="/dashboard" className="px-6 py-3 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white font-bold rounded-full shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Deploy Agent
          </button>
        </div>

      </form>

    </div>
  );
}
