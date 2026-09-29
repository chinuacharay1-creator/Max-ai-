import React from "react";
import { Cpu, HardDrive, BatteryCharging, Battery, Wifi, Shield, Flame, BookOpen, Gamepad2, Moon, VolumeX, Eye } from "lucide-react";
import type { SystemMetrics } from "../services/systemTelemetry";

interface HUDDashboardProps {
  metrics: SystemMetrics;
  activeMode: "normal" | "creator" | "study" | "gaming" | "night" | "silent";
  onSelectMode: (mode: "normal" | "creator" | "study" | "gaming" | "night" | "silent") => void;
  onOpenVision: () => void;
}

export const HUDDashboard: React.FC<HUDDashboardProps> = ({
  metrics,
  activeMode,
  onSelectMode,
  onOpenVision,
}) => {
  const pipelineSteps: Array<"LISTENING" | "THINKING" | "EXECUTING" | "DONE"> = [
    "LISTENING",
    "THINKING",
    "EXECUTING",
    "DONE",
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "LISTENING":
        return 0;
      case "THINKING":
        return 1;
      case "EXECUTING":
        return 2;
      case "DONE":
        return 3;
      default:
        return -1;
    }
  };

  const currentIdx = getStepIndex(metrics.aiPipelineStatus);

  const modes = [
    { id: "normal", label: "Normal", icon: <Flame className="w-3 h-3 text-pink-400" /> },
    { id: "creator", label: "Creator Mode", icon: <Flame className="w-3 h-3 text-yellow-400" /> },
    { id: "study", label: "Study Mode", icon: <BookOpen className="w-3 h-3 text-emerald-400" /> },
    { id: "gaming", label: "Gaming Mode", icon: <Gamepad2 className="w-3 h-3 text-purple-400" /> },
    { id: "night", label: "Night Mode", icon: <Moon className="w-3 h-3 text-blue-400" /> },
    { id: "silent", label: "Silent Mode", icon: <VolumeX className="w-3 h-3 text-red-400" /> },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-1 mb-2">
      <div className="rounded-2xl border border-cyan-500/25 bg-slate-950/70 backdrop-blur-md p-3.5 shadow-2xl relative overflow-hidden">
        {/* Futuristic cyan scanline aesthetic */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        {/* Top Telemetry Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-2.5 border-b border-slate-800/80">
          {/* Hardware & Network Metrics */}
          <div className="flex items-center gap-4 text-slate-300">
            {/* CPU */}
            <div className="flex items-center gap-1.5" title="CPU Utilization">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU: {metrics.cpuLoad}%</span>
            </div>

            {/* RAM */}
            <div className="flex items-center gap-1.5" title="Memory Allocation">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              <span>RAM: {metrics.memoryUsageMb} MB</span>
            </div>

            {/* Battery */}
            <div className="flex items-center gap-1.5" title="Battery Level">
              {metrics.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{metrics.batteryLevel !== null ? `${metrics.batteryLevel}%` : "AC"}</span>
            </div>

            {/* Network */}
            <div className="flex items-center gap-1.5" title="Network Connection">
              <Wifi className={`w-3.5 h-3.5 ${metrics.isOnline ? "text-cyan-400" : "text-red-400"}`} />
              <span className="hidden sm:inline">{metrics.networkType}</span>
            </div>
          </div>

          {/* Quick Vision Trigger & Security Status */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVision}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-sans font-medium transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Eye className="w-3.5 h-3.5 animate-pulse" />
              <span>MAX Vision (Camera/Screen)</span>
            </button>

            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <Shield className="w-3 h-3" />
              <span>Secured</span>
            </div>
          </div>
        </div>

        {/* Middle: AI Execution Pipeline Steps (LISTENING -> THINKING -> EXECUTING -> DONE) */}
        <div className="py-2.5 flex items-center justify-between gap-1 overflow-x-auto">
          {pipelineSteps.map((step, idx) => {
            const isActive = idx === currentIdx;
            const isCompleted = idx < currentIdx;

            return (
              <div key={step} className="flex-1 flex items-center min-w-[70px]">
                <div
                  className={`w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-102"
                      : isCompleted
                      ? "bg-slate-800/80 text-cyan-300 border border-cyan-500/30"
                      : "bg-slate-900/40 text-slate-600 border border-slate-800/60"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-slate-950 animate-ping" : isCompleted ? "bg-cyan-400" : "bg-slate-600"}`} />
                  <span>{step}</span>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div
                    className={`h-[1px] w-3 mx-1 transition-colors duration-300 ${
                      isCompleted ? "bg-cyan-400" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom: Specialized Mode Selector */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            System Modes:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  activeMode === m.id
                    ? "bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm"
                    : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
