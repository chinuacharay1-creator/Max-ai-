import React from "react";
import { X, Search, Youtube, Globe, Clock, Calendar, MessageSquare, UserCheck, ShieldCheck } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const commands = [
    {
      category: "Google Search",
      icon: <Search className="w-4 h-4 text-cyan-400" />,
      example: '"MAX, Google par Free Fire sensitivity search karo"',
      action: "Extracts query, URL-encodes safely, opens search results, speaks sassy confirmation.",
    },
    {
      category: "YouTube Search",
      icon: <Youtube className="w-4 h-4 text-red-400" />,
      example: '"MAX, YouTube par Free Fire videos search karo"',
      action: "Extracts query, opens YouTube results in browser, speaks confirmation.",
    },
    {
      category: "Open Website",
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      example: '"MAX, Instagram kholo" or "MAX, YouTube kholo"',
      action: "Opens the requested website directly in the default browser.",
    },
    {
      category: "Time & Date",
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      example: '"MAX, time kya hua?" or "MAX, aaj ki date kya hai?"',
      action: "Returns current local PC time or date with casual conversational flair.",
    },
    {
      category: "Creator Attribution",
      icon: <UserCheck className="w-4 h-4 text-purple-400" />,
      example: '"MAX, tumhe kisne banaya hai?"',
      action: 'Responds: "Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi."',
    },
    {
      category: "Casual Chit-Chat & Attitude",
      icon: <MessageSquare className="w-4 h-4 text-pink-400" />,
      example: '"MAX, aaj ka mood kaisa hai?" or "Give me a sassy comeback"',
      action: "Responds in a young, playful, flirty, slightly teasing tone like a close girlfriend.",
    },
    {
      category: "Session Interruption",
      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
      example: "Just start speaking while MAX is talking",
      action: "Instant interruption detection stops MAX's speech immediately so she listens to you.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-bold">Voice Commands Guide</h2>
            <p className="text-xs text-slate-400">What you can say to MAX in Hindi, Hinglish, or English</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-3">
          {commands.map((cmd, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {cmd.icon}
                <span className="font-semibold text-xs text-slate-200">{cmd.category}</span>
              </div>
              <p className="text-sm font-medium text-pink-300 font-mono mb-1">
                {cmd.example}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cmd.action}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
