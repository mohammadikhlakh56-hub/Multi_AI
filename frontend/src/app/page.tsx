import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0710] text-[#F4F4F9] selection:bg-brand/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>

      <footer className="border-t border-white/5 bg-[#0A0710] py-12 mt-20">
        <div className="max-w-[90rem] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © 2026 Multi AI. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
