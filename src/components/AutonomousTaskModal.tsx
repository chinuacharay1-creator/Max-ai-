import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Play, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

interface TaskStep {
  stepNumber: number;
  title: string;
  description: string;
  details: string[];
  requiresConfirmation: boolean;
  actionType: "browser" | "clipboard" | "note" | "none";
  actionPayload: string;
}

interface AutonomousTaskPlan {
  projectTitle: string;
  summary: string;
  sassyRemark: string;
  steps: TaskStep[];
}

interface AutonomousTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (type: string, payload: string) => void;
}

export const AutonomousTaskModal: React.FC<AutonomousTaskModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
}) => {
  const [prompt, setPrompt] = useState("MAX, mere liye YouTube video ki taiyari karo");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<AutonomousTaskPlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setCompletedSteps(new Set());

    try {
      const res = await fetch("/api/autonomous/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskPrompt: prompt }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      setPlan(data);
    } catch (err: any) {
      console.error("[Autonomous Task Plan Error]:", err);
      setError(err.message || "Failed to generate autonomous task workflow.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStep = (stepNumber: number, step: TaskStep) => {
    const nextSet = new Set(completedSteps);
    if (nextSet.has(stepNumber)) {
      nextSet.delete(stepNumber);
    } else {
      nextSet.add(stepNumber);
      // If action is requested, trigger it
      if (step.actionType === "browser" && step.actionPayload) {
        if (!step.requiresConfirmation || window.confirm(`MAX is asking: Open ${step.actionPayload}?`)) {
          window.open(step.actionPayload, "_blank", "noopener,noreferrer");
          if (onExecuteAction) onExecuteAction(step.actionType, step.actionPayload);
        }
      }
    }
    setCompletedSteps(nextSet);
  };

  const presets = [
    { label: "YouTube Video Prep", prompt: "MAX, mere liye YouTube video ki taiyari karo (Topic: Free Fire Tips & AI Tech)" },
    { label: "Study Sprint Plan", prompt: "MAX, 2 ghante ka focused study sprint plan banao" },
    { label: "Bug & Code Debug", prompt: "MAX, Python voice assistant ke PyAudio errors troubleshoot karne ki plan banao" },
    { label: "Gaming Setup", prompt: "MAX, live gaming stream aur Discord setup karo" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">⚙️ Autonomous Task Mode</h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-mono uppercase font-semibold">
                  Multi-Step Workflow
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end task decomposition with safe human-in-the-loop confirmation
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

        {/* Input Bar & Presets */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell MAX what autonomous project to prepare..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Plan Task</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 font-mono">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p.prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="font-mono text-xs">MAX is researching, planning, and organizing your workflow...</p>
            </div>
          ) : plan ? (
            <div className="space-y-4">
              {/* Plan Header */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-cyan-300 font-mono">{plan.projectTitle}</h3>
                  <span className="text-slate-400 text-[11px] font-mono">
                    Progress: {completedSteps.size} / {plan.steps.length}
                  </span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed">{plan.summary}</p>
                {plan.sassyRemark && (
                  <p className="mt-2 text-pink-300 italic font-sans text-[11px]">
                    💅 MAX: &quot;{plan.sassyRemark}&quot;
                  </p>
                )}
              </div>

              {/* Step Checklist */}
              <div className="space-y-2.5">
                {plan.steps.map((step) => {
                  const isDone = completedSteps.has(step.stepNumber);

                  return (
                    <div
                      key={step.stepNumber}
                      onClick={() => handleToggleStep(step.stepNumber, step)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isDone
                          ? "bg-slate-950/50 border-emerald-500/40 opacity-75"
                          : "bg-slate-950 border-slate-800 hover:border-cyan-500/50 shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono transition-colors ${
                              isDone
                                ? "bg-emerald-500 text-slate-950"
                                : "bg-slate-800 text-cyan-300 border border-slate-700"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                          </div>
                          <div>
                            <h4
                              className={`font-semibold text-sm ${
                                isDone ? "text-slate-400 line-through" : "text-slate-100"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              {step.description}
                            </p>

                            {/* Details / Bullets */}
                            {step.details && step.details.length > 0 && (
                              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                                {step.details.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        {/* Confirmation Badge / External Action */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {step.requiresConfirmation && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Needs Confirmation</span>
                            </span>
                          )}

                          {step.actionType === "browser" && (
                            <span className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline">
                              <span>Open Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-center">
              <Sparkles className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
              <p>Type a task prompt or pick a preset above, then click &quot;Plan Task&quot;.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                MAX will formulate a step-by-step strategy with ideas, scripts, and safe browser launches!
              </p>
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
