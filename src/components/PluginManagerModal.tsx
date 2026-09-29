import React, { useState } from "react";
import { X, Puzzle, CheckCircle2, Eye, Globe, Youtube, FileText, Code2, Gamepad2, Brain, WifiOff } from "lucide-react";

interface PluginManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PluginItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({ isOpen, onClose }) => {
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: "vision",
      name: "MAX Vision AI",
      description: "Real-time webcam inspection, screen capture, OCR, and code error debugger.",
      category: "Vision",
      icon: <Eye className="w-4 h-4 text-cyan-400" />,
      enabled: true,
    },
    {
      id: "agent_mode",
      name: "Autonomous Agent Core",
      description: "Executes multi-step projects ('MAX, mera kaam poora kar do') with verification.",
      category: "Automation",
      icon: <Puzzle className="w-4 h-4 text-pink-400" />,
      enabled: true,
    },
    {
      id: "web_research",
      name: "Web Research Agent",
      description: "Multi-source research synthesizer for Google and YouTube.",
      category: "Intelligence",
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      enabled: true,
    },
    {
      id: "youtube_agent",
      name: "YouTube Agent",
      description: "Direct video, channel, and playlist search with topic extraction.",
      category: "Media",
      icon: <Youtube className="w-4 h-4 text-red-400" />,
      enabled: true,
    },
    {
      id: "file_intel",
      name: "File & PDF Intelligence",
      description: "Deep parsing and executive summaries for PDF, text, and code files.",
      category: "Documents",
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      enabled: true,
    },
    {
      id: "coding_engine",
      name: "Coding Mode Suite",
      description: "Explain code, diagnose errors, and write safe project code.",
      category: "Developer",
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      enabled: true,
    },
    {
      id: "gaming_suite",
      name: "Gaming Mode Profile",
      description: "Low-latency voice HUD, Free Fire / BGMI sensitivity guides & Steam shortcuts.",
      category: "Gaming",
      icon: <Gamepad2 className="w-4 h-4 text-yellow-400" />,
      enabled: true,
    },
    {
      id: "offline_fallback",
      name: "Offline Fallback Core",
      description: "Zero-latency local time, date, calculator math, and notes when disconnected.",
      category: "System",
      icon: <WifiOff className="w-4 h-4 text-amber-400" />,
      enabled: true,
    },
  ]);

  if (!isOpen) return null;

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Puzzle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">🧩 MAX Plugin Architecture</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase font-semibold">
                  Modular Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dynamically enable or configure specialized AI tools & skills
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 text-xs">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                plugin.enabled
                  ? "bg-slate-950 border-slate-800 hover:border-cyan-500/40"
                  : "bg-slate-950/40 border-slate-800/40 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {plugin.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-200">{plugin.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                    {plugin.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer shrink-0 ${
                  plugin.enabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {plugin.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span className="font-mono">Created by Chinu AI • Trimurti Sahi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
