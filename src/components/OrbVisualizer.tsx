import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Sparkles, Radio, Power } from "lucide-react";
import type { SessionStatus } from "../services/LiveSession";

interface OrbVisualizerProps {
  status: SessionStatus;
  micVolume: number;
  assistantVolume: number;
  isMuted: boolean;
  onToggleSession: () => void;
  onToggleMute: () => void;
}

export const OrbVisualizer: React.FC<OrbVisualizerProps> = ({
  status,
  micVolume,
  assistantVolume,
  isMuted,
  onToggleSession,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live dynamic waveform rendering on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine active intensity
      const activeVolume = status === "speaking" ? assistantVolume : micVolume;
      const baseRadius = 86 + activeVolume * 38;

      phase += 0.04 + activeVolume * 0.08;

      // Color scheme based on state
      let primaryColor = "rgba(147, 51, 234, 0.7)";
      let glowColor = "rgba(192, 132, 252, 0.4)";

      if (status === "speaking") {
        // Sassy Magenta / Hot Pink
        primaryColor = "rgba(236, 72, 153, 0.85)";
        glowColor = "rgba(244, 114, 182, 0.6)";
      } else if (status === "listening") {
        // Electric Cyan / Neon Teal
        primaryColor = "rgba(6, 182, 212, 0.85)";
        glowColor = "rgba(34, 211, 238, 0.5)";
      } else if (status === "connecting") {
        // Amber / Gold
        primaryColor = "rgba(245, 158, 11, 0.8)";
        glowColor = "rgba(251, 191, 36, 0.5)";
      } else if (status === "interrupted") {
        // Electric Yellow-Red shockwave
        primaryColor = "rgba(239, 68, 68, 0.9)";
        glowColor = "rgba(248, 113, 113, 0.6)";
      }

      // 1. Draw outer energetic acoustic ripples
      const ripples = status === "speaking" ? 4 : status === "listening" ? 3 : 2;
      for (let r = 1; r <= ripples; r++) {
        ctx.beginPath();
        const rippleRadius = baseRadius + r * 18 + Math.sin(phase * 1.5 + r) * (6 + activeVolume * 20);
        ctx.arc(centerX, centerY, Math.max(10, rippleRadius), 0, Math.PI * 2);
        ctx.strokeStyle = glowColor.replace(/[\d.]+\)$/, `${0.22 / r})`);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw organic oscillating soundwave ring
      const points = 72;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave =
          Math.sin(angle * 6 + phase) * (activeVolume * 22) +
          Math.cos(angle * 3 - phase * 1.2) * (activeVolume * 14);
        const radius = baseRadius + wave;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5 + activeVolume * 2;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 18 + activeVolume * 25;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, micVolume, assistantVolume]);

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "Connecting to MAX Neural Core...";
      case "listening":
        return isMuted ? "Mic Muted (Click to Unmute)" : "Hello Boss! MAX is Listening... (Speak freely)";
      case "speaking":
        return "MAX is speaking to Boss...";
      case "interrupted":
        return "Interrupted! Listening to Boss...";
      case "error":
        return "Session Error. Reconnecting...";
      default:
        return "Hello Boss! Tap to Ignite MAX Voice";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "connecting":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
          dot: "bg-amber-400 animate-ping",
          label: "Connecting",
        };
      case "listening":
        return {
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
          dot: "bg-cyan-400 animate-pulse",
          label: "Live & Listening",
        };
      case "speaking":
        return {
          bg: "bg-pink-500/10 border-pink-500/30 text-pink-300",
          dot: "bg-pink-400 animate-pulse",
          label: "Speaking (Sassy)",
        };
      case "interrupted":
        return {
          bg: "bg-red-500/10 border-red-500/30 text-red-300",
          dot: "bg-red-400",
          label: "Interrupted",
        };
      default:
        return {
          bg: "bg-slate-800/60 border-slate-700/50 text-slate-400",
          dot: "bg-slate-500",
          label: "Ready / Idle",
        };
    }
  };

  const badge = getStatusBadge();
  const isLive = status === "listening" || status === "speaking" || status === "interrupted";

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Status Pill Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all duration-300 mb-6 backdrop-blur-md ${badge.bg}`}
      >
        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
        <span className="uppercase font-mono tracking-wider">{badge.label}</span>
      </div>

      {/* Main Holographic Orb Container */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
        {/* Animated Canvas for dynamic acoustic waveforms */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {/* Ambient Backlight Aura */}
        <div
          className={`absolute inset-4 rounded-full blur-3xl transition-all duration-700 ${
            status === "speaking"
              ? "bg-pink-600/30 scale-110"
              : status === "listening"
              ? "bg-cyan-500/25 scale-105"
              : status === "connecting"
              ? "bg-amber-500/20 scale-100"
              : "bg-purple-900/15 scale-90"
          }`}
        />

        {/* Gyroscopic Rotating Rings */}
        <div className="absolute inset-2 border border-purple-500/15 rounded-full animate-rotate-slow pointer-events-none" />
        <div className="absolute inset-6 border border-dashed border-cyan-500/20 rounded-full animate-rotate-reverse pointer-events-none" />
        <div className="absolute inset-10 border border-dotted border-pink-500/15 rounded-full pointer-events-none" />

        {/* Core Glowing Button / Visual Sphere */}
        <button
          onClick={onToggleSession}
          type="button"
          aria-label={isLive ? "Disconnect MAX Voice" : "Connect MAX Voice"}
          className={`group relative z-20 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-500 focus:outline-none cursor-pointer ${
            isLive
              ? status === "speaking"
                ? "bg-gradient-to-tr from-pink-900/80 via-purple-900/60 to-pink-600/80 glow-magenta scale-105 border-2 border-pink-400/60"
                : "bg-gradient-to-tr from-cyan-950/80 via-slate-900/80 to-cyan-700/80 glow-cyan border-2 border-cyan-400/60"
              : status === "connecting"
              ? "bg-gradient-to-tr from-amber-950 via-slate-900 to-amber-700 glow-yellow animate-pulse border-2 border-amber-400/60"
              : "bg-gradient-to-tr from-slate-900 via-purple-950/50 to-slate-800 hover:border-purple-500/50 border border-slate-700/60 shadow-2xl hover:scale-105"
          }`}
        >
          {/* Inner core shimmer */}
          <div className="absolute inset-2 rounded-full bg-radial from-white/10 to-transparent pointer-events-none" />

          {/* Central Icon */}
          <div className="relative flex flex-col items-center justify-center transition-transform group-hover:scale-110">
            {isLive ? (
              status === "speaking" ? (
                <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 text-pink-200 animate-pulse" />
              ) : (
                <Radio className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-200 animate-pulse" />
              )
            ) : status === "connecting" ? (
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-amber-200 animate-spin" />
            ) : (
              <Power className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300 group-hover:text-purple-100 transition-colors" />
            )}

            <span className="mt-2 text-xs font-semibold tracking-wider uppercase text-slate-200 font-mono">
              {isLive ? (status === "speaking" ? "SPEAKING" : "LIVE") : status === "connecting" ? "SYNCING" : "START MAX"}
            </span>
          </div>
        </button>

        {/* Quick Mic Mute Overlay Toggle when Live */}
        {isLive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            className={`absolute bottom-1 right-2 z-30 p-2.5 rounded-full border transition-all shadow-lg backdrop-blur-md cursor-pointer ${
              isMuted
                ? "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500/50"
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
          </button>
        )}
      </div>

      {/* Spoken subtitle / status description */}
      <div className="mt-6 text-center max-w-sm px-4">
        <p className="text-sm text-slate-300 font-medium tracking-wide">
          {getStatusText()}
        </p>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          {isLive
            ? "Continuous audio-to-audio streaming • Tap orb to disconnect"
            : "Requires microphone permission • Speaks Hindi, Hinglish & English"}
        </p>
      </div>
    </div>
  );
};
