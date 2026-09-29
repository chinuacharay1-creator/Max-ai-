import React from "react";
import { X, ShieldAlert, Mic, MicOff, Camera, Wifi, CheckCircle2, History, Power, AlertTriangle, Lock } from "lucide-react";
import type { ToolActionLog } from "../services/LiveSession";

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  micLive: boolean;
  isMuted: boolean;
  cameraActive: boolean;
  apiConnected: boolean;
  history: ToolActionLog[];
  onEmergencyStop: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({
  isOpen,
  onClose,
  micLive,
  isMuted,
  cameraActive,
  apiConnected,
  history,
  onEmergencyStop,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-red-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">🕵️ MAX Security Center</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold uppercase">
                  Protected & Audited
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hardware privacy sensors, active permissions & emergency killswitch
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Emergency Stop All Banner */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <h3 className="font-bold text-red-200 text-sm">Emergency Kill Switch</h3>
                <p className="text-[11px] text-red-300/80 mt-0.5">
                  Immediately shuts down microphone streaming, camera feeds, audio playback, and cancels all ongoing tool executions.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onEmergencyStop();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-500/30 cursor-pointer shrink-0"
            >
              <Power className="w-4 h-4" />
              <span>STOP ALL</span>
            </button>
          </div>

          {/* Sensor & Privacy Status Matrix */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3 font-mono uppercase tracking-wider text-[11px]">
              Privacy & Hardware Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mic Sensor */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {micLive && !isMuted ? (
                    <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : (
                    <MicOff className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-200">Microphone</p>
                    <p className="text-[11px] text-slate-400">
                      {micLive ? (isMuted ? "Muted" : "Active (Live PCM)") : "Dormant / Off"}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    micLive && !isMuted ? "bg-cyan-400 animate-ping" : "bg-slate-600"
                  }`}
                />
              </div>

              {/* Camera Sensor */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className={`w-4 h-4 ${cameraActive ? "text-pink-400" : "text-slate-500"}`} />
                  <div>
                    <p className="font-semibold text-slate-200">Camera / Screen</p>
                    <p className="text-[11px] text-slate-400">
                      {cameraActive ? "Vision Streaming" : "Inactive"}
                    </p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-pink-400 animate-ping" : "bg-slate-600"}`} />
              </div>

              {/* API Connection */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wifi className={`w-4 h-4 ${apiConnected ? "text-emerald-400" : "text-amber-400"}`} />
                  <div>
                    <p className="font-semibold text-slate-200">Gemini Live API</p>
                    <p className="text-[11px] text-slate-400">
                      {apiConnected ? "WebSocket Connected" : "Connecting..."}
                    </p>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${apiConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
            </div>
          </div>

          {/* Active Sandboxed Tools */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-2 font-mono uppercase tracking-wider text-[11px]">
              Active Guardrails & Permissions
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Strict URL Sanitization (No arbitrary shell execution)</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Human-in-the-Loop confirmation for external actions</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Zero telemetry leaks / Encrypted client-server link</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Enforced</span>
              </div>
            </div>
          </div>

          {/* Action Log History */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-2 font-mono uppercase tracking-wider text-[11px]">
              Recent Audit Log ({history.length})
            </h3>
            {history.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {history.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300"
                  >
                    <span className="font-mono text-cyan-400">{log.name}</span>
                    <span className="truncate mx-2">{log.resultDescription}</span>
                    <span className="text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 text-center text-slate-500">
                No external actions have been triggered yet.
              </div>
            )}
          </div>
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
