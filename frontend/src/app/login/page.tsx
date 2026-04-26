import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0710] text-[#F4F4F9] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="bg-[#120B20]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-10 w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to your Multi AI account</p>
        </div>

        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-[#0A0710] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full bg-[#0A0710] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <Link href="/dashboard" className="w-full bg-gradient-to-r from-purple-500 to-brand hover:from-purple-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl mt-4 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center">
            Sign In
          </Link>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account? <Link href="#" className="text-brand hover:text-white transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
