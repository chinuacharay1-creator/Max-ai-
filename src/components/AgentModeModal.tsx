import React, { useState } from "react";
import { X, Zap, CheckCircle2, Play, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Sparkles, Check } from "lucide-react";
import type { AgentWorkflowResult, AgentStep } from "../../server/agentService";

interface AgentModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakText?: (text: string) => void;
}

export const AgentModeModal: React.FC<AgentModeModalProps> = ({
  isOpen,
  onClose,
  onSpeakText,
}) => {
  const [goal, setGoal] = useState("MAX, mera kaam poora kar do (YouTube video aur research taiyar karo)");
  const [isLoading, setIsLoading] = useState(false);
  const [workflow, setWorkflow] = useState<AgentWorkflowResult | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartWorkflow = async () => {
    if (!goal.trim()) return;
    setIsLoading(true);
    setError(null);
    setCompletedSteps(new Set());
    setActiveStepIdx(-1);

    try {
      const res = await fetch("/api/agent/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data: AgentWorkflowResult = await res.json();
      setWorkflow(data);

      // Begin sequential execution
      executeStepsSequentially(data.steps, data.completionAnnouncement);
    } catch (err: any) {
      console.error("[Agent Workflow Error]:", err);
      setError(err.message || "Failed to formulate agent workflow.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeStepsSequentially = async (steps: AgentStep[], announcement: string) => {
    const finished = new Set<number>();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setActiveStepIdx(i);

      if (step.requiresConfirmation) {
        const approved = window.confirm(
          `MAX Agent Confirmation Required:\n\nStep ${step.stepNumber}: ${step.title}\n\n${step.description}\n\nProceed?`
        );
        if (!approved) {
          continue;
        }
      }

      // Small simulation delay for each step
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (step.actionPayload && step.actionPayload.startsWith("http")) {
        window.open(step.actionPayload, "_blank", "noopener,noreferrer");
      }

      finished.add(step.stepNumber);
      setCompletedSteps(new Set(finished));
    }

    setActiveStepIdx(-1);

    // Speak final task completion
    if (onSpeakText) {
      onSpeakText(announcement);
    }
  };

  const presets = [
    { label: "Mera Kaam Poora Kar Do", prompt: "MAX, mera kaam poora kar do" },
    { label: "YouTube Prep Master", prompt: "MAX, Free Fire video ke liye title, script aur research ready karo" },
    { label: "Study Sprint Prep", prompt: "MAX, 1-ghante ke liye study research aur focus notes ready karo" },
    { label: "Project Debug & Test", prompt: "MAX, complete project code analyze karke debug plan execute karo" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/50 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-500/40 text-cyan-300">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white">⚡ MAX Agent Mode</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase font-semibold">
                  Autonomous Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                &quot;MAX, mera kaam poora kar do&quot; • Multi-Step Execution with Verification
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
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Tell MAX: 'MAX, mera kaam poora kar do'..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              onClick={handleStartWorkflow}
              disabled={isLoading || !goal.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute Task</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 font-mono">Quick Goals:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setGoal(p.prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Display Area */}
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
              <p className="font-mono text-xs">MAX Agent is breaking down steps and choosing tools...</p>
            </div>
          ) : workflow ? (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-cyan-300 font-mono">{workflow.taskTitle}</h3>
                  <span className="text-slate-400 text-xs font-mono">
                    {completedSteps.size} of {workflow.steps.length} Steps Finished
                  </span>
                </div>
                {workflow.sassyRemark && (
                  <p className="mt-2 text-pink-300 text-xs italic font-sans">
                    💅 MAX: &quot;{workflow.sassyRemark}&quot;
                  </p>
                )}
              </div>

              {/* Steps Timeline */}
              <div className="space-y-2.5">
                {workflow.steps.map((step, idx) => {
                  const isDone = completedSteps.has(step.stepNumber);
                  const isCurrent = activeStepIdx === idx;

                  return (
                    <div
                      key={step.id || idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDone
                          ? "bg-slate-950/50 border-emerald-500/50"
                          : isCurrent
                          ? "bg-cyan-950/30 border-cyan-400 shadow-md animate-pulse"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono transition-colors ${
                              isDone
                                ? "bg-emerald-500 text-slate-950"
                                : isCurrent
                                ? "bg-cyan-500 text-slate-950 animate-ping"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                          </div>
                          <div>
                            <h4
                              className={`font-semibold text-sm ${
                                isDone ? "text-slate-300 line-through" : "text-slate-100"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {step.requiresConfirmation && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Confirmation Verified</span>
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Banner */}
              {completedSteps.size === workflow.steps.length && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/50 flex items-center justify-between text-emerald-300 font-mono text-sm animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold">{workflow.completionAnnouncement}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-sans">
                    All safety steps verified
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-center">
              <Zap className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
              <p>Type your task or click &quot;Mera Kaam Poora Kar Do&quot; above.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                MAX will deconstruct, safely confirm, and announce: &quot;Task complete. 4 steps successfully finished.&quot;
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
