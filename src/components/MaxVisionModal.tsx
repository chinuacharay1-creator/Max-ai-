import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Monitor, Sparkles, RefreshCw, Upload, Volume2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface MaxVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpeakText?: (text: string) => void;
}

export const MaxVisionModal: React.FC<MaxVisionModalProps> = ({ isOpen, onClose, onSpeakText }) => {
  const [streamType, setStreamType] = useState<"camera" | "screen" | "upload">("camera");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start media stream when modal opens or stream type changes
  useEffect(() => {
    if (!isOpen || streamType === "upload") {
      stopMediaStream();
      return;
    }

    startMediaStream(streamType);

    return () => {
      stopMediaStream();
    };
  }, [isOpen, streamType]);

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startMediaStream = async (type: "camera" | "screen") => {
    stopMediaStream();
    setError(null);

    try {
      let stream: MediaStream;
      if (type === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false,
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "browser" },
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("[Vision Stream Error]:", err);
      setError(
        type === "camera"
          ? "Camera permission denied or camera not found."
          : "Screen capture was cancelled or permission denied."
      );
    }
  };

  const captureFrame = (): string | null => {
    if (streamType === "upload" && capturedImage) {
      return capturedImage;
    }
    if (!videoRef.current) return null;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(dataUrl);
    return dataUrl;
  };

  const handleAnalyze = async (mode: "camera" | "screen" | "error_debug" | "ocr" = "camera") => {
    setError(null);
    let image = captureFrame();

    if (!image) {
      setError("Please capture or upload an image first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image,
          mode,
          prompt: customPrompt || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data.description);

      if (onSpeakText && data.description) {
        onSpeakText(data.description);
      }
    } catch (err: any) {
      console.error("[Vision analysis failed]:", err);
      setError(err.message || "Failed to analyze image with MAX Vision.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setStreamType("upload");
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-mono">🧿 MAX Vision Core</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase font-semibold">
                  Multimodal AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Camera Inspection • Screen OCR • Bug & Error Debugger
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

        {/* Source Switcher Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCapturedImage(null);
                setStreamType("camera");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                streamType === "camera"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Webcam Vision</span>
            </button>

            <button
              onClick={() => {
                setCapturedImage(null);
                setStreamType("screen");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                streamType === "screen"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Screen / Window</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-400 hover:text-slate-200 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local stream • Secure processing</span>
          </div>
        </div>

        {/* Viewport & Result Section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Video or Snapshot Canvas */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {streamType !== "upload" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured frame"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs font-mono">
                  No image selected. Upload a screenshot or switch to webcam.
                </div>
              )}

              {/* HUD reticle overlay */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 m-3 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-cyan-400/50 absolute top-0 left-0" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-cyan-400/50 absolute top-0 right-0" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-cyan-400/50 absolute bottom-0 left-0" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-cyan-400/50 absolute bottom-0 right-0" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                disabled={isAnalyzing}
                onClick={() => handleAnalyze("camera")}
                className="px-2.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                👁️ Identify Scene
              </button>
              <button
                disabled={isAnalyzing}
                onClick={() => handleAnalyze("ocr")}
                className="px-2.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                📜 Read OCR Text
              </button>
              <button
                disabled={isAnalyzing}
                onClick={() => handleAnalyze("error_debug")}
                className="px-2.5 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-pink-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                🐞 Debug Error
              </button>
              <button
                disabled={isAnalyzing}
                onClick={() => handleAnalyze("screen")}
                className="px-2.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                🖥️ Screen Summary
              </button>
            </div>

            {/* Custom Question input */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask MAX something specific about this image..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleAnalyze("camera")}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Ask
              </button>
            </div>
          </div>

          {/* AI Response Panel */}
          <div className="flex flex-col rounded-xl bg-slate-950/70 border border-slate-800 p-4 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                  MAX Vision Analysis
                </span>
              </div>
              {analysisResult && onSpeakText && (
                <button
                  onClick={() => onSpeakText(analysisResult)}
                  title="Speak out loud"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speak</span>
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 mb-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto text-xs leading-relaxed text-slate-300 font-sans space-y-2">
              {isAnalyzing ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-cyan-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="font-mono text-xs">MAX is inspecting the visual feed...</span>
                </div>
              ) : analysisResult ? (
                <div className="whitespace-pre-wrap p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-200 leading-relaxed">
                  {analysisResult}
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center p-6">
                  <Camera className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                  <p>Click any analysis button or ask a specific question above.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    MAX can recognize objects, read code errors, extract text, and give witty commentary!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span className="font-mono">Created by Chinu AI • Trimurti Sahi</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
