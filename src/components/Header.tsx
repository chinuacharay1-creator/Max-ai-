import React from "react";
import { Sparkles, Terminal, Volume2, HelpCircle, Radio, Settings2 } from "lucide-react";
import type { SessionStatus } from "../services/LiveSession";

interface HeaderProps {
  status: SessionStatus;
  voice: string;
  onVoiceChange: (voice: string) => void;
  onOpenPythonModal: () => void;
  onOpenHelpModal: () => void;
  onOpenVision: () => void;
  onOpenAutonomous: () => void;
  onOpenMemory: () => void;
  onOpenUtilities: () => void;
  onOpenSecurity: () => void;
  onOpenAgentMode: () => void;
  onOpenWebResearch: () => void;
  onOpenFileIntelligence: () => void;
  onOpenPlugins: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  voice,
  onVoiceChange,
  onOpenPythonModal,
  onOpenHelpModal,
  onOpenVision,
  onOpenAutonomous,
  onOpenMemory,
  onOpenUtilities,
  onOpenSecurity,
  onOpenAgentMode,
  onOpenWebResearch,
  onOpenFileIntelligence,
  onOpenPlugins,
}) => {
  const voices = [
    { id: "Kore", label: "Kore (Sassy Girlfriend)", style: "Female • Energetic & Sassy" },
    { id: "Aoede", label: "Aoede (Flirty & Bright)", style: "Female • Playful & Melodic" },
    { id: "Zephyr", label: "Zephyr (Smooth & Cool)", style: "Enthusiastic & Chill" },
    { id: "Puck", label: "Puck (Witty Maverick)", style: "Spunky & Sarcastic" },
    { id: "Fenrir", label: "Fenrir (Bold & Direct)", style: "Deep & Confident" },
  ];

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo and Name */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 tracking-tighter text-base sm:text-lg font-mono">
                M
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold tracking-tight text-slate-100 text-base sm:text-lg font-mono">
                MAX
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 font-mono uppercase tracking-wider">
                ULTRA HUD
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden md:block">
              Vision • Audio • Autonomous Agent • Security
            </p>
          </div>
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* ⚡ Agent Mode ("Mera Kaam Poora Kar Do") */}
          <button
            onClick={onOpenAgentMode}
            title="Agent Mode (Mera Kaam Poora Kar Do)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/25 to-purple-500/25 border border-pink-500/40 text-pink-200 text-xs font-medium transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            <span className="text-xs">⚡</span>
            <span className="hidden sm:inline font-mono font-bold">Agent Mode</span>
          </button>

          {/* Vision Button */}
          <button
            onClick={onOpenVision}
            title="Open MAX Vision"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="text-xs">🧿</span>
            <span className="hidden md:inline font-mono">Vision</span>
          </button>

          {/* Web Research Agent */}
          <button
            onClick={onOpenWebResearch}
            title="Open Web & YouTube Research Agent"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="text-xs">🌐</span>
            <span className="hidden lg:inline font-mono">Research</span>
          </button>

          {/* File Intelligence */}
          <button
            onClick={onOpenFileIntelligence}
            title="Open File & Document Intelligence"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="text-xs">📁</span>
            <span className="hidden lg:inline font-mono">Files</span>
          </button>

          {/* Utilities (Timer, Calc, Weather) */}
          <button
            onClick={onOpenUtilities}
            title="Open Voice Utilities"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="text-xs">🛠️</span>
            <span className="hidden xl:inline font-mono">Tools</span>
          </button>

          {/* Plugin Architecture */}
          <button
            onClick={onOpenPlugins}
            title="Open Plugins Manager"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
          >
            <span className="text-xs">🧩</span>
            <span className="hidden xl:inline ml-1 font-mono">Plugins</span>
          </button>

          {/* Security Center */}
          <button
            onClick={onOpenSecurity}
            title="Open Security Center"
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="text-xs">🕵️</span>
          </button>

          {/* Voice Selector */}
          <div className="relative hidden xl:flex items-center">
            <select
              value={voice}
              onChange={(e) => onVoiceChange(e.target.value)}
              disabled={status === "speaking" || status === "listening"}
              className="appearance-none bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 pr-7 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-60 transition-all font-mono"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                  {v.label}
                </option>
              ))}
            </select>
            <Volume2 className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* PC Python Assistant button */}
          <button
            onClick={onOpenPythonModal}
            title="Get Python PC Script"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-mono">PC Code</span>
          </button>

          {/* Help modal */}
          <button
            onClick={onOpenHelpModal}
            title="Voice Commands Guide"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

