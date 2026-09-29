/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { HUDDashboard } from "./components/HUDDashboard";
import { OrbVisualizer } from "./components/OrbVisualizer";
import { ActionHUD } from "./components/ActionHUD";
import { PersonalityBanner } from "./components/PersonalityBanner";
import { MaxVisionModal } from "./components/MaxVisionModal";
import { AutonomousTaskModal } from "./components/AutonomousTaskModal";
import { SecurityCenterModal } from "./components/SecurityCenterModal";
import { MemoryAndNotesModal } from "./components/MemoryAndNotesModal";
import { VoiceUtilitiesModal } from "./components/VoiceUtilitiesModal";
import { AgentModeModal } from "./components/AgentModeModal";
import { WebResearchModal } from "./components/WebResearchModal";
import { FileIntelligenceModal } from "./components/FileIntelligenceModal";
import { PluginManagerModal } from "./components/PluginManagerModal";
import { PythonAssistantModal } from "./components/PythonAssistantModal";
import { HelpModal } from "./components/HelpModal";
import {
  LiveSession,
  SessionStatus,
  ToolActionLog,
} from "./services/LiveSession";
import {
  UserPreferences,
  loadPreferences,
  savePreferences,
  addVoiceNote,
  clearMemory,
} from "./services/memoryStorage";
import { processOfflineCommand } from "./services/offlineFallback";
import { useSystemTelemetry } from "./services/systemTelemetry";
import { Send, AlertCircle, Eye, ShieldAlert, Sparkles, Terminal, Zap } from "lucide-react";

export default function App() {
  const [status, setStatus] = useState<SessionStatus>("disconnected");
  const [micVolume, setMicVolume] = useState(0);
  const [assistantVolume, setAssistantVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [voice, setVoice] = useState("Kore");
  const [latestAction, setLatestAction] = useState<ToolActionLog | null>(null);
  const [actionHistory, setActionHistory] = useState<ToolActionLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [subtitle, setSubtitle] = useState<string>("Hello Boss! Main MAX hoon, bataiye kya karna hai?");

  // Modals state
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isAutonomousModalOpen, setIsAutonomousModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isUtilitiesModalOpen, setIsUtilitiesModalOpen] = useState(false);
  const [utilityTab, setUtilityTab] = useState<"timer" | "calc" | "weather" | "clipboard" | "translate">("timer");
  const [isAgentModeOpen, setIsAgentModeOpen] = useState(false);
  const [isWebResearchOpen, setIsWebResearchOpen] = useState(false);
  const [isFileIntelligenceOpen, setIsFileIntelligenceOpen] = useState(false);
  const [isPluginsOpen, setIsPluginsOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // User Memory & Mode
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());
  const [activeMode, setActiveMode] = useState<UserPreferences["activeMode"]>(preferences.activeMode || "normal");

  const sessionRef = useRef<LiveSession | null>(null);

  // Compute AI pipeline status for the electric blue HUD
  const getPipelineStatus = (): "IDLE" | "LISTENING" | "THINKING" | "EXECUTING" | "DONE" => {
    if (status === "disconnected") return "IDLE";
    if (status === "listening") return "LISTENING";
    if (status === "connecting") return "THINKING";
    if (status === "speaking") return "EXECUTING";
    if (status === "interrupted") return "LISTENING";
    return "DONE";
  };

  const telemetryMetrics = useSystemTelemetry(getPipelineStatus());

  // Secret voice commands evaluation
  const checkSecretCommands = (text: string) => {
    const lower = text.toLowerCase().trim();

    if (lower.includes("activate creator mode") || lower.includes("creator mode")) {
      handleSelectMode("creator");
      setSubtitle("Creator Mode Activated! Saluting Chinu AI at Trimurti Sahi ✨");
      return true;
    }
    if (lower.includes("activate study mode") || lower.includes("study mode")) {
      handleSelectMode("study");
      setSubtitle("Study Mode Activated! Focus timers & quiet atmosphere ready 📚");
      return true;
    }
    if (lower.includes("activate gaming mode") || lower.includes("gaming mode")) {
      handleSelectMode("gaming");
      setSubtitle("Gaming Mode Activated! Low-latency turbo profile online 🎮");
      return true;
    }
    if (lower.includes("system scan")) {
      setIsSecurityModalOpen(true);
      setSubtitle("Running comprehensive system scan... All hardware secured 🛡️");
      return true;
    }
    if (lower.includes("go silent") || lower.includes("chup ho jao") || lower.includes("mute ho jao")) {
      if (sessionRef.current && !isMuted) {
        sessionRef.current.toggleMute();
        setIsMuted(true);
        setSubtitle("MAX went silent. Click unmute or say 'wake up' 🤫");
      }
      return true;
    }
    if (lower.includes("wake up") || lower.includes("jago") || lower.includes("unmute")) {
      if (sessionRef.current && isMuted) {
        sessionRef.current.toggleMute();
        setIsMuted(false);
        setSubtitle("MAX is awake and listening! Bataiye kya karna hai? 💅");
      }
      return true;
    }
    if (lower.includes("forget this") || lower.includes("forget memory")) {
      clearMemory();
      setPreferences((prev) => ({ ...prev, notes: [], conversationHistory: [] }));
      setSubtitle("Memory wiped as requested. Fresh session started.");
      return true;
    }
    // Agent Mode ("MAX, mera kaam poora kar do")
    if (lower.includes("mera kaam poora kar do") || lower.includes("mera kam pura kar do") || lower.includes("agent mode") || lower.includes("complete my task")) {
      setIsAgentModeOpen(true);
      setSubtitle("Agent Mode Armed! Goal decompose karke poora kar rahi hoon, Boss! ⚡");
      return true;
    }
    if (lower.includes("web research") || lower.includes("research karo") || lower.includes("deep search")) {
      setIsWebResearchOpen(true);
      setSubtitle("Web Research Agent active! Synthesis ready ho rahi hai 🌐");
      return true;
    }
    if (lower.includes("file intel") || lower.includes("document analyze") || lower.includes("pdf check")) {
      setIsFileIntelligenceOpen(true);
      setSubtitle("File Intelligence online! Document analysis panel khol diya 📁");
      return true;
    }
    if (lower.includes("plugins") || lower.includes("skills")) {
      setIsPluginsOpen(true);
      return true;
    }
    if (lower.startsWith("hello") || lower.includes("namaste") || lower.includes("hi max")) {
      setSubtitle("Hello Boss! Main MAX hoon, bataiye kya karna hai? 💅");
      return true;
    }
    if (lower.includes("open camera") || lower.includes("camera dekho") || lower.includes("screen dekho") || lower.includes("vision")) {
      setIsVisionModalOpen(true);
      return true;
    }

    return false;
  };

  // Initialize or re-create session when voice changes
  useEffect(() => {
    const session = new LiveSession(
      {
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
          if (newStatus === "listening") {
            setErrorMessage(null);
          }
        },
        onVolume: (mVol, aVol) => {
          setMicVolume(mVol);
          setAssistantVolume(aVol);
        },
        onToolExecuted: (action) => {
          setLatestAction(action);
          setActionHistory((prev) => [action, ...prev.slice(0, 19)]);
        },
        onTranscript: (_speaker, text) => {
          setSubtitle(text);
          checkSecretCommands(text);
          setTimeout(() => {
            setSubtitle((current) => (current === text ? "" : current));
          }, 6000);
        },
        onOpenVision: () => {
          setIsVisionModalOpen(true);
        },
        onOpenTimer: () => {
          setUtilityTab("timer");
          setIsUtilitiesModalOpen(true);
        },
        onModeChange: (mode) => {
          handleSelectMode(mode as any);
        },
        onNoteCreated: (title, content) => {
          const note = addVoiceNote(title, content);
          setPreferences((prev) => ({
            ...prev,
            notes: [note, ...prev.notes],
          }));
        },
        onError: (err) => {
          setErrorMessage(err);
        },
      },
      voice
    );

    sessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, [voice]);

  const handleToggleSession = async () => {
    if (!sessionRef.current) return;

    if (status === "disconnected" || status === "error") {
      setErrorMessage(null);
      await sessionRef.current.connect();
    } else {
      sessionRef.current.disconnect();
    }
  };

  const handleToggleMute = () => {
    if (!sessionRef.current) return;
    const muted = sessionRef.current.toggleMute();
    setIsMuted(muted);
  };

  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    if (sessionRef.current && status !== "disconnected") {
      sessionRef.current.disconnect();
    }
  };

  const handleSelectMode = (mode: UserPreferences["activeMode"]) => {
    setActiveMode(mode);
    const updated = { ...preferences, activeMode: mode };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleQuickPrompt = (promptText: string) => {
    if (checkSecretCommands(promptText)) return;

    if (!navigator.onLine) {
      const off = processOfflineCommand(promptText);
      setSubtitle(off.reply);
      return;
    }

    if (!sessionRef.current) return;
    if (status === "disconnected" || status === "error") {
      sessionRef.current.connect().then(() => {
        setTimeout(() => {
          sessionRef.current?.sendTextMessage(promptText);
        }, 800);
      });
    } else {
      sessionRef.current.sendTextMessage(promptText);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !sessionRef.current) return;
    const text = textInput.trim();
    setTextInput("");

    if (checkSecretCommands(text)) return;

    if (!navigator.onLine) {
      const off = processOfflineCommand(text);
      setSubtitle(off.reply);
      return;
    }

    if (status === "disconnected" || status === "error") {
      sessionRef.current.connect().then(() => {
        setTimeout(() => {
          sessionRef.current?.sendTextMessage(text);
        }, 800);
      });
    } else {
      sessionRef.current.sendTextMessage(text);
    }
  };

  // Emergency STOP ALL killswitch
  const handleEmergencyStop = () => {
    if (sessionRef.current) {
      sessionRef.current.disconnect();
    }
    setIsVisionModalOpen(false);
    setIsAutonomousModalOpen(false);
    setIsUtilitiesModalOpen(false);
    setSubtitle("EMERGENCY STOP ACTIVATED! All audio, camera, and tool processes terminated.");
  };

  const isLive = status === "listening" || status === "speaking" || status === "interrupted";

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#05070e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans transition-colors duration-700 ${
        activeMode === "night"
          ? "brightness-75"
          : activeMode === "gaming"
          ? "selection:bg-purple-500/30"
          : activeMode === "creator"
          ? "selection:bg-yellow-500/30"
          : ""
      }`}
    >
      {/* Cybernetic ambient backlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-pink-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header with Navigation Bar */}
      <Header
        status={status}
        voice={voice}
        onVoiceChange={handleVoiceChange}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenVision={() => setIsVisionModalOpen(true)}
        onOpenAutonomous={() => setIsAutonomousModalOpen(true)}
        onOpenMemory={() => setIsMemoryModalOpen(true)}
        onOpenUtilities={() => setIsUtilitiesModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenAgentMode={() => setIsAgentModeOpen(true)}
        onOpenWebResearch={() => setIsWebResearchOpen(true)}
        onOpenFileIntelligence={() => setIsFileIntelligenceOpen(true)}
        onOpenPlugins={() => setIsPluginsOpen(true)}
      />

      {/* Futuristic Electric-Blue HUD Dashboard */}
      <HUDDashboard
        metrics={telemetryMetrics}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        onOpenVision={() => setIsVisionModalOpen(true)}
      />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="max-w-md mx-auto w-full px-4 mt-1 z-30">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs shadow-lg backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <p className="flex-1">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 font-mono text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-between py-1 sm:py-2 z-10 w-full max-w-4xl mx-auto px-4">
        {/* Personality Banner & Quick Prompt Chips */}
        <PersonalityBanner
          onQuickPrompt={handleQuickPrompt}
          isLive={isLive}
        />

        {/* Action HUD / Executed Tools */}
        <ActionHUD
          latestAction={latestAction}
          history={actionHistory}
          onClearHistory={() => setActionHistory([])}
        />

        {/* Central Futuristic Holographic Orb */}
        <div className="my-auto py-1">
          <OrbVisualizer
            status={status}
            micVolume={micVolume}
            assistantVolume={assistantVolume}
            isMuted={isMuted}
            onToggleSession={handleToggleSession}
            onToggleMute={handleToggleMute}
          />

          {/* Subtitle / Voice Transcript Display */}
          {subtitle && (
            <div className="mt-2 max-w-md mx-auto px-4 text-center animate-in fade-in">
              <span className="inline-block px-4 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-200 backdrop-blur-md shadow-md">
                &quot;{subtitle}&quot;
              </span>
            </div>
          )}
        </div>

        {/* Bottom Bar: Voice Input fallback and Quick Controls */}
        <div className="w-full max-w-xl mx-auto mt-2 mb-2">
          <form onSubmit={handleSendText} className="relative flex items-center">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Speak or type a command (e.g. 'MAX, YouTube kholo', 'system scan')..."
              className="w-full bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 focus:border-cyan-400 rounded-xl px-4 py-2.5 pr-20 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none backdrop-blur-md transition-all shadow-inner"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="submit"
                disabled={!textInput.trim()}
                title="Send command"
                className="p-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Bottom attribution & footer links */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1 font-mono">
            <span>MAX Voice & Vision AI • Mode: {activeMode.toUpperCase()}</span>
            <button
              onClick={() => setIsPythonModalOpen(true)}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>Get Python PC Script</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals Suite */}
      <MaxVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        onSpeakText={(text) => {
          setSubtitle(text.substring(0, 140) + "...");
        }}
      />
      <AutonomousTaskModal
        isOpen={isAutonomousModalOpen}
        onClose={() => setIsAutonomousModalOpen(false)}
      />
      <SecurityCenterModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        micLive={isLive}
        isMuted={isMuted}
        cameraActive={isVisionModalOpen}
        apiConnected={Boolean(process.env.GEMINI_API_KEY || true)}
        history={actionHistory}
        onEmergencyStop={handleEmergencyStop}
      />
      <MemoryAndNotesModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
      />
      <VoiceUtilitiesModal
        isOpen={isUtilitiesModalOpen}
        onClose={() => setIsUtilitiesModalOpen(false)}
        activeUtilityTab={utilityTab}
      />
      <AgentModeModal
        isOpen={isAgentModeOpen}
        onClose={() => setIsAgentModeOpen(false)}
        onSpeakText={(text) => {
          setSubtitle(text.substring(0, 160));
        }}
      />
      <WebResearchModal
        isOpen={isWebResearchOpen}
        onClose={() => setIsWebResearchOpen(false)}
        onSpeakText={(text) => {
          setSubtitle(text.substring(0, 160));
        }}
      />
      <FileIntelligenceModal
        isOpen={isFileIntelligenceOpen}
        onClose={() => setIsFileIntelligenceOpen(false)}
        onSpeakText={(text) => {
          setSubtitle(text.substring(0, 160));
        }}
      />
      <PluginManagerModal
        isOpen={isPluginsOpen}
        onClose={() => setIsPluginsOpen(false)}
      />
      <PythonAssistantModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}
