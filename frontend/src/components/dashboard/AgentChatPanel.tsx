"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Mic, Send, Bot, Play, Settings2, Loader2, Phone, PhoneOff, MicOff, User, Grid3x3, Paperclip, FileSpreadsheet, Download, ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Agent {
  id: string;
  agent_name: string;
  agent_type: string;
}

interface AgentChatPanelProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  rawFile: File; // stored for FormData uploads
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  attachedFile?: AttachedFile;
  isDataResponse?: boolean;
  chartBase64?: string;              // real PNG from backend
  mockChartData?: { name: string; value: number }[];  // fallback mock
  downloadableFile?: { filename: string; url: string }; // real download link
  pythonCode?: string;               // execution logs / python code
}

// ── Mock chart data for Data Science responses ──────────────────────────────
const MOCK_CHART_DATA = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 3800 },
  { name: "Mar", value: 5100 },
  { name: "Apr", value: 4700 },
  { name: "May", value: 6200 },
  { name: "Jun", value: 5800 },
];

const MOCK_PYTHON_CODE = `import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('data.csv')
df_clean = df.dropna().reset_index(drop=True)
monthly = df_clean.groupby('month')['revenue'].sum()
print(monthly)`;

// ── Data Science AI Response Component ─────────────────────────────────────
function DataScienceResponse({
  content, chartBase64, mockChartData, pythonCode, downloadableFile
}: {
  content: string;
  chartBase64?: string;
  mockChartData?: { name: string; value: number }[];
  pythonCode?: string;
  downloadableFile?: { filename: string; url: string };
}) {
  const [showCode, setShowCode] = useState(false);

  const handleDownload = () => {
    if (downloadableFile?.url) {
      // Real file from backend
      const a = document.createElement("a");
      a.href = `http://127.0.0.1:8000${downloadableFile.url}`;
      a.download = downloadableFile.filename;
      a.click();
    } else {
      // Mock fallback
      const csv = ["month,value", ...(mockChartData || []).map(d => `${d.name},${d.value}`)].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "cleaned_data.csv"; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadLabel = downloadableFile
    ? `⬇️ Download ${downloadableFile.filename}`
    : "⬇️ Download Cleaned Data (.csv)";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-slate-200">{content}</p>

      {/* Chart — real image from backend OR recharts mock */}
      <div className="bg-[#0A0710]/80 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Data Analysis</span>
        </div>
        {chartBase64 ? (
          // Real matplotlib PNG from backend
          <img src={chartBase64} alt="Analysis chart" className="w-full rounded-lg" />
        ) : mockChartData ? (
          // Fallback recharts mock
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#120B20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} cursor={{ fill: "rgba(139,92,246,0.1)" }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        {downloadLabel}
      </button>

      {/* Code Toggle */}
      <button
        onClick={() => setShowCode(s => !s)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {showCode ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        View Python Execution
      </button>
      <AnimatePresence>
        {showCode && (
          <motion.pre
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <code className="block bg-[#0A0710] border border-white/10 rounded-xl p-4 text-xs text-emerald-400 font-mono whitespace-pre overflow-x-auto">{pythonCode}</code>
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}

// Ensure TypeScript knows about webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type CallState = "idle" | "listening" | "thinking" | "speaking";

// ── Util: format bytes ──────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AgentChatPanel({ agent, isOpen, onClose }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"fast" | "deep">("fast");
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Voice Call States
  const [isCalling, setIsCalling] = useState(false);
  const [callState, setCallState] = useState<CallState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, isCalling]);

  // Auto-scroll live transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveTranscript, messages]);

  // Reset chat when opened with a new agent
  useEffect(() => {
    if (isOpen && agent && !isCalling && messages.length === 0) {
      setMessages([
        {
          id: "initial",
          role: "ai",
          content: `Hi, I'm ${agent.agent_name}. I am online and ready to assist you. How can I help?`
        }
      ]);
    }
  }, [isOpen, agent]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      endCall();
    }
    return () => endCall();
  }, [isOpen]);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to pick a decent voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en") && v.name.includes("Female")) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      if (isCalling) setCallState("speaking");
    };
    
    utterance.onend = () => {
      if (isCalling) setCallState("listening");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile({ name: file.name, size: file.size, type: file.type, rawFile: file });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendText = async (text: string = input) => {
    if (!text.trim() && !attachedFile || !agent) return;

    const userMessage = text.trim() || (attachedFile ? `Analyze this file: ${attachedFile.name}` : "");
    const fileSnapshot = attachedFile;
    if (!isCalling) { setInput(""); setAttachedFile(null); }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      attachedFile: fileSnapshot ?? undefined,
    }]);
    
    if (isCalling) {
      setCallState("thinking");
      setLiveTranscript("");
    } else {
      setIsProcessing(true);
    }

    try {
      let aiResponse = "";
      let isDataResponse = false;
      let realChartBase64: string | undefined;
      let realDownloadFile: { filename: string; url: string } | undefined;
      let executionLogs = "";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

      if (fileSnapshot?.rawFile) {
        // ── DATA SCIENCE PATH: send FormData to the Hybrid Engine ────────────
        const formData = new FormData();
        formData.append("file", fileSnapshot.rawFile, fileSnapshot.name);
        formData.append("prompt", userMessage);
        formData.append("agent_id", agent.id);

        const response = await fetch("http://127.0.0.1:8000/api/data-science/chat", {
          method: "POST",
          body: formData,        // No Content-Type header — browser sets multipart boundary
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`API Error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        aiResponse     = data.text_response || "Analysis complete.";
        isDataResponse = data.hasDataVisuals === true;
        realChartBase64  = data.chart_base64 ?? undefined;
        realDownloadFile = data.downloadable_file ?? undefined;
        executionLogs    = data.execution_logs || "";

      } else {
        // ── STANDARD CHAT PATH: regular JSON to /api/chat ────────────────────
        const response = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agent.id, message: userMessage, stream: false }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`API Error ${response.status}: ${errBody || "Failed to connect"}`);
        }

        const data = await response.json();
        aiResponse = data.reply || data.confirmation || data.response || "Task completed.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponse,
        isDataResponse,
        // Use real base64 chart from backend; fall back to mock only if backend said hasDataVisuals but sent no image
        chartBase64: realChartBase64,
        mockChartData: isDataResponse && !realChartBase64 ? MOCK_CHART_DATA : undefined,
        downloadableFile: realDownloadFile,
        pythonCode: isDataResponse ? executionLogs : undefined,
      }]);

      if (isCalling) speakText(aiResponse);

    } catch (error: any) {
      // Use console.log to prevent Next.js dev overlay from taking over the screen
      console.log("Chat error:", error);
      let errMsg = "Error: Could not connect to the agent backend.";
      
      if (error.name === "AbortError") {
        errMsg = "Error: Request timed out (exceeded 120 seconds). The backend might still be processing.";
      } else if (error.message === "Failed to fetch" || error.message === "NetworkError when attempting to fetch resource.") {
        errMsg = "Error: Network or CORS issue. Could not connect to the server at http://127.0.0.1:8000.";
      } else if (error.message && error.message.includes("API Error 500")) {
        errMsg = `Server Error (500): The backend encountered an internal error. Details: ${error.message}`;
      } else if (error.message && error.message.includes("API Error")) {
        errMsg = `Server Error: ${error.message}`;
      } else {
        errMsg = `Error: ${error.message || "Unknown error occurred."}`;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: errMsg }]);
      if (isCalling) speakText(errMsg);
    } finally {
      setIsProcessing(false);
      if (isCalling && callState === "thinking") setCallState("listening");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // --- Voice Call Logic ---

  const startCall = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setIsCalling(true);
    setCallState("listening");
    setIsMuted(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Mic listening...");
    };

    // Barge-in logic: if user speaks, stop AI TTS immediately
    recognition.onspeechstart = () => {
      if (window.speechSynthesis.speaking) {
        console.log("BARGE IN DETECTED: Canceling TTS.");
        window.speechSynthesis.cancel();
        setCallState("listening");
      }
    };

    recognition.onresult = (event: any) => {
      if (isMuted) return;

      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setLiveTranscript(interim);
      }

      if (final) {
        setLiveTranscript("");
        handleSendText(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
    };

    recognition.onend = () => {
      // Auto-restart if we are still in a call and not muted
      if (isCallingRef.current && !isMutedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started errors
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const endCall = () => {
    setIsCalling(false);
    setCallState("idle");
    setLiveTranscript("");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Need refs for the onend closure to access latest state
  const isCallingRef = useRef(isCalling);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isCallingRef.current = isCalling; }, [isCalling]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);


  // --- Nova Orb Animation Variants ---
  const coreVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    listening: { 
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      boxShadow: ["0px 0px 50px rgba(6,182,212,0.5)", "0px 0px 80px rgba(6,182,212,0.8)", "0px 0px 50px rgba(6,182,212,0.5)"],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    },
    thinking: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      boxShadow: ["0px 0px 60px rgba(139,92,246,0.6)", "0px 0px 100px rgba(244,114,182,0.8)", "0px 0px 60px rgba(139,92,246,0.6)"],
      transition: { repeat: Infinity, duration: 1.5, ease: "linear" }
    },
    speaking: {
      scale: [1, 1.2, 0.95, 1.1, 1],
      opacity: [0.9, 1, 0.8, 1, 0.9],
      boxShadow: ["0px 0px 60px rgba(6,182,212,0.6)", "0px 0px 120px rgba(139,92,246,0.9)", "0px 0px 50px rgba(6,182,212,0.5)", "0px 0px 90px rgba(139,92,246,0.8)", "0px 0px 60px rgba(6,182,212,0.6)"],
      transition: { repeat: Infinity, duration: 0.8, ease: "backInOut" }
    }
  };

  const ring1Variants: Variants = {
    idle: { scale: 1, rotate: 0 },
    listening: { scale: [1, 1.05, 1], rotate: 360, transition: { scale: { repeat: Infinity, duration: 2.5 }, rotate: { repeat: Infinity, duration: 20, ease: "linear" } } },
    thinking: { scale: [1, 1.1, 1], rotate: 360, transition: { scale: { repeat: Infinity, duration: 1.5 }, rotate: { repeat: Infinity, duration: 8, ease: "linear" } } },
    speaking: { scale: [1, 1.2, 1], rotate: 360, transition: { scale: { repeat: Infinity, duration: 0.8 }, rotate: { repeat: Infinity, duration: 5, ease: "linear" } } }
  };

  const ring2Variants: Variants = {
    idle: { scale: 1.2, rotate: 0 },
    listening: { scale: [1.2, 1.25, 1.2], rotate: -360, transition: { scale: { repeat: Infinity, duration: 3 }, rotate: { repeat: Infinity, duration: 25, ease: "linear" } } },
    thinking: { scale: [1.2, 1.3, 1.2], rotate: -360, transition: { scale: { repeat: Infinity, duration: 2 }, rotate: { repeat: Infinity, duration: 10, ease: "linear" } } },
    speaking: { scale: [1.2, 1.4, 1.2], rotate: -360, transition: { scale: { repeat: Infinity, duration: 1 }, rotate: { repeat: Infinity, duration: 6, ease: "linear" } } }
  };
  
  const ring3Variants: Variants = {
    idle: { scale: 1.5, rotate: 0 },
    listening: { scale: [1.5, 1.55, 1.5], rotate: 360, transition: { scale: { repeat: Infinity, duration: 3.5 }, rotate: { repeat: Infinity, duration: 30, ease: "linear" } } },
    thinking: { scale: [1.5, 1.6, 1.5], rotate: 360, transition: { scale: { repeat: Infinity, duration: 2.5 }, rotate: { repeat: Infinity, duration: 15, ease: "linear" } } },
    speaking: { scale: [1.5, 1.7, 1.5], rotate: 360, transition: { scale: { repeat: Infinity, duration: 1.2 }, rotate: { repeat: Infinity, duration: 8, ease: "linear" } } }
  };

  return (
    <AnimatePresence>
      {isOpen && agent && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isCalling ? onClose : undefined}
            className="fixed inset-0 bg-[#0A0710]/60 backdrop-blur-sm z-40"
          />
          
          {/* Slide-over Panel */}
          <motion.div 
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-[#120B20]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0710]/90 z-10 relative">
              {/* Top Left */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 border border-white/20 flex items-center justify-center text-white font-bold uppercase shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  {agent.agent_name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-300">Agent: <span className="text-white">{agent.agent_name}</span></h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              </div>
              
              {/* Top Right */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMute}
                  className={`p-2.5 rounded-full transition-all ${isMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Settings2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2.5 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* --- TEXT CHAT MODE --- */}
            <AnimatePresence mode="wait">
              {!isCalling ? (
                <motion.div 
                  key="text-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full overflow-hidden"
                >
                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar relative">
                    {/* Background watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none -z-10">
                      <Bot className="w-64 h-64 text-white" />
                    </div>

                    {messages.map((msg) => (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
                      >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          
                          {/* Avatar */}
                          {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-brand" />
                            </div>
                          )}

                          {/* Bubble */}
                          <div className={`group relative p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user" 
                              ? "bg-gradient-to-br from-purple-600 to-brand text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] rounded-tr-sm" 
                              : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                          }`}>

                            {/* User file attachment badge */}
                            {msg.role === "user" && msg.attachedFile && (
                              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/10 rounded-xl border border-white/20">
                                <FileSpreadsheet className="w-4 h-4 text-cyan-300 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-white truncate">{msg.attachedFile.name}</p>
                                  <p className="text-[10px] text-white/60">{formatBytes(msg.attachedFile.size)}</p>
                                </div>
                              </div>
                            )}

                            {/* AI: Data Science rich response OR plain text */}
                            {msg.role === "ai" && msg.isDataResponse ? (
                              <DataScienceResponse
                                content={msg.content}
                                chartBase64={msg.chartBase64}
                                mockChartData={msg.mockChartData}
                                downloadableFile={msg.downloadableFile}
                                pythonCode={msg.pythonCode}
                              />
                            ) : msg.role === "ai" ? (
                              <span>{msg.content}</span>
                            ) : null}

                            {/* User message content */}
                            {msg.role === "user" && <span>{msg.content}</span>}
                            
                            {/* TTS Icon */}
                            {msg.role === "ai" && (
                              <button onClick={() => speakText(msg.content)} className="absolute -right-10 top-2 p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Processing Indicator */}
                    {isProcessing && (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start w-full">
                        <div className="flex gap-3 max-w-[85%] flex-row">
                          <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-brand" />
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: "300ms" }}></span>
                            {mode === "deep" && <span className="ml-2 text-xs text-brand font-medium tracking-wider">CrewAI Analyzing...</span>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-6 border-t border-white/10 bg-black/40">
                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.json,.txt" onChange={handleFileSelect} className="hidden" />

                    {/* File attachment tag */}
                    <AnimatePresence>
                      {attachedFile && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="flex items-center gap-2 mb-3 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl w-fit max-w-full"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-xs text-cyan-300 font-medium truncate max-w-[200px]">{attachedFile.name}</span>
                          <span className="text-[10px] text-cyan-500/70 shrink-0">{formatBytes(attachedFile.size)}</span>
                          <button onClick={() => setAttachedFile(null)} className="ml-1 text-cyan-500/60 hover:text-cyan-300 transition-colors shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex items-end gap-2 bg-[#0A0710] border border-white/10 rounded-2xl p-2 focus-within:border-brand/50 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all">
                      
                      {/* Text Area */}
                      <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${agent.agent_name}...`}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm resize-none max-h-32 min-h-[44px] py-3 px-3 placeholder:text-slate-600 custom-scrollbar"
                        rows={1}
                      />

                      {/* Actions */}
                      <div className="flex items-center gap-2 mb-1 pr-1 shrink-0">
                        {/* File Upload Button */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-2.5 rounded-xl transition-colors border ${
                            attachedFile
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                              : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/10"
                          }`}
                          title="Attach File"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>

                        {/* Call Agent Button */}
                        <button 
                          onClick={startCall}
                          className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-white transition-colors border border-purple-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                          title="Call Agent"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleSendText()}
                          disabled={(!input.trim() && !attachedFile) || isProcessing}
                          className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:hover:bg-brand transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">AI Agents can make mistakes. Verify important info.</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                
                /* --- ACTIVE CALL MODE (Nova Orb Exact Match) --- */
                <motion.div 
                  key="call-mode"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center justify-between p-8 relative overflow-hidden bg-[#0A0710]"
                >
                  
                  {/* Status Indicator (Optional, hide to match image exactly if preferred, but kept for context) */}
                  <div className="mt-2 text-center z-20">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                      {callState === "listening" && <><Mic className="w-3 h-3 text-cyan-400 animate-pulse" /> Listening</>}
                      {callState === "thinking" && <><Loader2 className="w-3 h-3 text-fuchsia-400 animate-spin" /> Thinking</>}
                      {callState === "speaking" && <><Bot className="w-3 h-3 text-purple-400" /> Speaking</>}
                    </p>
                  </div>

                  {/* The Nova Orb Centerpiece */}
                  <div className="relative w-full h-[400px] flex items-center justify-center -mt-8 flex-1">
                    {/* Deep ambient background glow */}
                    <div className="absolute inset-0 rounded-full bg-blue-600/10 blur-[150px]"></div>
                    
                    {/* Ring 3 (Outer fine dots) */}
                    <motion.div 
                      variants={ring3Variants}
                      animate={callState}
                      className="absolute w-80 h-80 rounded-full border border-dotted border-cyan-400/40 opacity-40 shadow-[0_0_50px_rgba(6,182,212,0.3)_inset]"
                    />

                    {/* Ring 2 (Middle dashed) */}
                    <motion.div 
                      variants={ring2Variants}
                      animate={callState}
                      className="absolute w-64 h-64 rounded-full border-[3px] border-dashed border-blue-500/60 opacity-60 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                    />

                    {/* Ring 1 (Inner intense glow) */}
                    <motion.div 
                      variants={ring1Variants}
                      animate={callState}
                      className="absolute w-48 h-48 rounded-full border-2 border-purple-500/80 opacity-80 shadow-[0_0_60px_rgba(168,85,247,0.6)_inset]"
                    />

                    {/* Core Orb (Dark center with bright edges) */}
                    <motion.div 
                      variants={coreVariants}
                      animate={callState}
                      className="w-36 h-36 rounded-full bg-[#050510] border-[4px] border-cyan-400/90 relative z-10 flex items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.8),_inset_0_0_40px_rgba(139,92,246,0.5)]"
                    >
                      <div className="w-24 h-24 rounded-full bg-blue-900/20 blur-md"></div>
                    </motion.div>
                  </div>

                  {/* Real-time Transcription Box (Overlapping, Exact Match) */}
                  <div className="w-full max-w-xl -mt-24 z-20 px-4">
                    <div className="bg-[#1A1A1E]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 shadow-[0_10px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
                      {/* Top Orb Glow bleeding through */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-blue-500/30 blur-[40px] rounded-full pointer-events-none"></div>
                      
                      <h4 className="text-[13px] font-bold text-white mb-5">Real-time Transcription</h4>
                      
                      <div className="flex flex-col gap-4">
                        {/* Row 1: User */}
                        <div className="flex gap-3 items-center">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-[13px] text-slate-300">
                            <span className="font-semibold text-white mr-1.5">You:</span>
                            [{liveTranscript ? liveTranscript : (messages.filter(m => m.role === "user").pop()?.content || "Listening...")}]
                          </div>
                        </div>

                        {/* Row 2: AI */}
                        <div className="flex gap-3 items-center">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-[13px] text-slate-300">
                            <span className="font-semibold text-white mr-1.5">{agent.agent_name}:</span>
                            [{callState === "thinking" ? "Generating ideas..." : (messages.filter(m => m.role === "ai").pop()?.content || "Waiting...")}] 
                            {callState === "thinking" && <span className="text-[11px] text-slate-500 ml-2">[Generating ideas...]</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls (Exact Match) */}
                  <div className="flex items-center justify-center gap-4 mt-8 pb-4 z-20">
                    
                    {/* End Call Pill */}
                    <button 
                      onClick={endCall}
                      className="h-14 px-8 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white flex items-center justify-center gap-2.5 font-bold shadow-lg transition-colors"
                    >
                      <PhoneOff className="w-5 h-5" />
                      <span>End Call</span>
                    </button>

                    {/* Record Button */}
                    <button 
                      onClick={toggleMute}
                      className="w-14 h-14 rounded-full bg-[#1C1C1E] hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center gap-0.5 transition-colors group relative"
                    >
                      {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <div className="w-3 h-3 rounded-full bg-slate-300 group-hover:bg-white mb-0.5" />}
                      <span className="text-[9px] font-semibold text-slate-400 group-hover:text-slate-300">Record</span>
                    </button>

                    {/* Keypad Button */}
                    <button className="w-14 h-14 rounded-full bg-[#1C1C1E] hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center gap-0.5 transition-colors group">
                      <Grid3x3 className="w-4 h-4 text-slate-300 group-hover:text-white" />
                      <span className="text-[9px] font-semibold text-slate-400 group-hover:text-slate-300">Keypad</span>
                    </button>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
