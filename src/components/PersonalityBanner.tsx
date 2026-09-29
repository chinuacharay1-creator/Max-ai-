import React from "react";
import { Sparkles, MessageSquareHeart, Terminal, MapPin, UserCheck, Flame } from "lucide-react";

interface PersonalityBannerProps {
  onQuickPrompt: (text: string) => void;
  isLive: boolean;
}

export const PersonalityBanner: React.FC<PersonalityBannerProps> = ({ onQuickPrompt, isLive }) => {
  const samplePrompts = [
    { label: "Tumhe kisne banaya hai?", prompt: "MAX, tumhe kisne banaya hai?" },
    { label: "Google Free Fire sensitivity", prompt: "MAX, Google par Free Fire sensitivity search karo" },
    { label: "YouTube kholo", prompt: "MAX, YouTube kholo" },
    { label: "Time kya hua?", prompt: "MAX, time kya hua?" },
    { label: "Tell me something witty", prompt: "MAX, give me a sassy witty comeback" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-2">
      {/* Persona Card */}
      <div className="rounded-2xl border border-purple-500/20 bg-slate-900/40 backdrop-blur-md p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  MAX AI
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-[10px] font-semibold text-pink-300 uppercase tracking-wider font-mono">
                  Sassy Girlfriend Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Flirty, witty, confident & fast • Hindi, Hinglish & English
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-purple-300">
              <UserCheck className="w-3 h-3 text-purple-400" /> Chinu AI
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-[10px]">
              <MapPin className="w-2.5 h-2.5" /> Trimurti Sahi
            </span>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400" />
              Try voice commands or tap below:
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Real-time Live Audio</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onQuickPrompt(item.prompt)}
                title={`Send prompt: "${item.prompt}"`}
                className="px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 hover:border-pink-500/40 text-xs text-slate-300 hover:text-pink-200 transition-all cursor-pointer font-sans"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
