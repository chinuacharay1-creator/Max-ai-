import React, { useState } from "react";
import { X, Search, Youtube, Globe, Sparkles, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";

interface WebResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakText?: (text: string) => void;
}

export const WebResearchModal: React.FC<WebResearchModalProps> = ({
  isOpen,
  onClose,
  onSpeakText,
}) => {
  const [query, setQuery] = useState("Free Fire latest sensitivity and pro graphics settings");
  const [isLoading, setIsLoading] = useState(false);
  const [researchData, setResearchData] = useState<{ query: string; summary: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResearchData(data);

      if (onSpeakText && data.summary) {
        onSpeakText(data.summary.substring(0, 160) + "...");
      }
    } catch (err: any) {
      console.error("[Web Research Error]:", err);
      setError(err.message || "Failed to complete web research.");
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogle = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  const openYouTube = () => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
  };

  const copyResults = () => {
    if (!researchData?.summary) return;
    navigator.clipboard.writeText(researchData.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">🌐 Web & YouTube Research Agent</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase font-semibold">
                  Multi-Source Synthesizer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deep web search, video discovery & intelligent synthesis
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

        {/* Search Bar & Direct Launchers */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research topic, question, or video query..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={handleResearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Research</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={openGoogle}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-[11px] cursor-pointer"
              >
                <Search className="w-3 h-3 text-cyan-400" />
                <span>Open in Google</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>

              <button
                onClick={openYouTube}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 font-mono text-[11px] cursor-pointer"
              >
                <Youtube className="w-3 h-3 text-red-400" />
                <span>Open in YouTube</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>

            {researchData && (
              <button
                onClick={copyResults}
                className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Synthesis"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="font-mono text-xs">Researching web & YouTube sources...</p>
            </div>
          ) : researchData ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
              {researchData.summary}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 text-center">
              <Globe className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
              <p>Type any topic or question to synthesize findings across the web and YouTube.</p>
            </div>
          )}
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
