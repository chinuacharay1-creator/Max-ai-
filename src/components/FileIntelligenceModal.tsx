import React, { useState } from "react";
import { X, FileText, Upload, Sparkles, RefreshCw, FileCode, CheckCircle2, Volume2 } from "lucide-react";

interface FileIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakText?: (text: string) => void;
}

export const FileIntelligenceModal: React.FC<FileIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onSpeakText,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text || "");
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!fileContent.trim()) {
      setError("Please upload a file or paste text first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/files/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileName || "Pasted Document",
          content: fileContent,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalysisResult(data.analysis);

      if (onSpeakText && data.analysis) {
        onSpeakText(data.analysis.substring(0, 160) + "...");
      }
    } catch (err: any) {
      console.error("[File Intelligence Error]:", err);
      setError(err.message || "Failed to analyze document.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-purple-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">📁 MAX File Intelligence</h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono uppercase font-semibold">
                  Document QA & Summary
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PDF, code, and document deep parsing & key takeaways
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

        {/* Upload bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-md">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Document / Code File</span>
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".txt,.md,.pdf,.json,.js,.ts,.py,.html,.css" />
            </label>

            {fileName && (
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span>{fileName}</span>
              </span>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !fileContent.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Analyze File</span>
          </button>
        </div>

        {/* Content & Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-purple-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="font-mono text-xs">Parsing document and distilling insights...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Analysis for {fileName || "Document"}:</span>
                {onSpeakText && (
                  <button
                    onClick={() => onSpeakText(analysisResult)}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak Overview</span>
                  </button>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {analysisResult}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-400">Or paste your text / code directly below:</p>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Paste contract, notes, research paper, or Python/React code snippet here..."
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 resize-none"
              />
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
