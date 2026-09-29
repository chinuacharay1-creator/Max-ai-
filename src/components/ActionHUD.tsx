import React from "react";
import { ExternalLink, Search, Youtube, Globe, Clock, Calendar, CheckCircle2, History } from "lucide-react";
import type { ToolActionLog } from "../services/LiveSession";

interface ActionHUDProps {
  latestAction: ToolActionLog | null;
  history: ToolActionLog[];
  onClearHistory: () => void;
}

export const ActionHUD: React.FC<ActionHUDProps> = ({ latestAction, history, onClearHistory }) => {
  const [showHistory, setShowHistory] = React.useState(false);

  const getToolIcon = (name: string) => {
    switch (name) {
      case "searchGoogle":
        return <Search className="w-4 h-4 text-cyan-400" />;
      case "searchYoutube":
        return <Youtube className="w-4 h-4 text-red-400" />;
      case "openWebsite":
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case "getTime":
        return <Clock className="w-4 h-4 text-amber-400" />;
      case "getDate":
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 my-2">
      {/* Latest Active Action Toast/HUD */}
      {latestAction && (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900/90 backdrop-blur-md p-3.5 shadow-xl transition-all animate-float">
          {/* Subtle cyber scanline */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 shrink-0">
                {getToolIcon(latestAction.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-cyan-400">
                    Action Executed
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{latestAction.timestamp}</span>
                </div>
                <p className="text-sm font-medium text-slate-100 truncate">
                  {latestAction.resultDescription}
                </p>
              </div>
            </div>

            {latestAction.url && (
              <a
                href={latestAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* History Toggle Bar */}
      {history.length > 0 && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400 px-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-mono cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>
              {showHistory ? "Hide Action History" : `Action History (${history.length})`}
            </span>
          </button>
          {showHistory && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Collapsible Action History List */}
      {showHistory && history.length > 0 && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getToolIcon(item.name)}
                <span className="truncate">{item.resultDescription}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
