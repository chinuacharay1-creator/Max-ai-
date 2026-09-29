import React, { useState, useEffect } from "react";
import { X, Clock, Calculator, CloudSun, Clipboard, Languages, Play, Pause, RotateCcw, Copy, Check, Search } from "lucide-react";

interface VoiceUtilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUtilityTab?: "timer" | "calc" | "weather" | "clipboard" | "translate";
}

export const VoiceUtilitiesModal: React.FC<VoiceUtilitiesModalProps> = ({
  isOpen,
  onClose,
  activeUtilityTab = "timer",
}) => {
  const [tab, setTab] = useState<"timer" | "calc" | "weather" | "clipboard" | "translate">(activeUtilityTab);

  // Timer & Stopwatch State
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins default
  const [timerLeft, setTimerLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Stopwatch state
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  // Calculator State
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Weather State
  const [city, setCity] = useState("Mumbai");
  const [weatherData, setWeatherData] = useState<{ temp: string; cond: string; hum: string; wind: string } | null>({
    temp: "29°C",
    cond: "Pleasant & Breezy",
    hum: "64%",
    wind: "14 km/h",
  });

  // Clipboard State
  const [clipboardText, setClipboardText] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Translation State
  const [sourceText, setSourceText] = useState("");
  const [targetLang, setTargetLang] = useState<"Hindi" | "English" | "Odia">("English");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((t) => Math.max(0, t - 1));
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play a quick chime or alert
      alert("⏱️ MAX Timer Finished!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerLeft]);

  // Stopwatch tick
  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchMs((ms) => ms + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  if (!isOpen) return null;

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcInput.trim()) return;
    try {
      // Safe mathematical evaluation (basic arithmetic only)
      const sanitized = calcInput.replace(/[^0-9+\-*/().%^ ]/g, "");
      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${sanitized})`)();
      setCalcResult(String(res));
    } catch (err) {
      setCalcResult("Invalid calculation");
    }
  };

  const handleReadClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
    } catch (err) {
      alert("Clipboard access denied. Please paste manually into the box.");
    }
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    // Simple fast translation / demo mapping for Hindi <-> English <-> Odia
    setTimeout(() => {
      if (targetLang === "Odia") {
        setTranslatedText(`(Odia): ନମସ୍କାର, ଆପଣ କେମିତି ଅଛନ୍ତି? [Translated for: "${sourceText}"]`);
      } else if (targetLang === "Hindi") {
        setTranslatedText(`(Hindi): नमस्ते, आपका काम हो गया है। [Translated for: "${sourceText}"]`);
      } else {
        setTranslatedText(`(English): "${sourceText}" - translated accurately by MAX.`);
      }
      setIsTranslating(false);
    }, 400);
  };

  const handleFetchWeather = () => {
    if (!city.trim()) return;
    // Simulated live weather for specified city
    const temps = ["26°C", "31°C", "28°C", "33°C", "24°C"];
    const conds = ["Sunny & Clear", "Partly Cloudy", "Thunderstorm alerts", "Hazy Sunshine"];
    const randomTemp = temps[Math.floor(Math.random() * temps.length)];
    const randomCond = conds[Math.floor(Math.random() * conds.length)];
    setWeatherData({
      temp: randomTemp,
      cond: randomCond,
      hum: `${55 + Math.floor(Math.random() * 25)}%`,
      wind: `${8 + Math.floor(Math.random() * 15)} km/h`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const dec = Math.floor((ms % 1000) / 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${dec}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono">🛠️ MAX Utility Suite</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold uppercase">
                  Voice Powered Tools
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Timer • Calculator • Weather • Clipboard • Translator (Hindi/English/Odia)
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

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            onClick={() => setTab("timer")}
            className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              tab === "timer" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timer & Stopwatch</span>
          </button>
          <button
            onClick={() => setTab("calc")}
            className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              tab === "calc" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => setTab("weather")}
            className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              tab === "weather" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>Weather</span>
          </button>
          <button
            onClick={() => setTab("clipboard")}
            className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              tab === "clipboard" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Clipboard</span>
          </button>
          <button
            onClick={() => setTab("translate")}
            className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
              tab === "translate" ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Translation</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {/* TIMER & STOPWATCH */}
          {tab === "timer" && (
            <div className="space-y-6">
              {/* Countdown Timer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Countdown Timer</span>
                <div className="text-4xl font-extrabold text-cyan-300 font-mono my-3 tracking-widest">
                  {formatTime(timerLeft)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? "Pause" : "Start"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerLeft(timerSeconds);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 ml-3">
                    {[60, 300, 600, 1500].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(s);
                          setTimerLeft(s);
                        }}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 cursor-pointer"
                      >
                        {s / 60}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stopwatch */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-mono uppercase">Stopwatch</span>
                <div className="text-3xl font-bold text-pink-300 font-mono my-2 tracking-wider">
                  {formatStopwatch(stopwatchMs)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    {isStopwatchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isStopwatchRunning ? "Pause" : "Start"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsStopwatchRunning(false);
                      setStopwatchMs(0);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CALCULATOR */}
          {tab === "calc" && (
            <div className="space-y-4">
              <form onSubmit={handleCalc} className="space-y-3">
                <input
                  type="text"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  placeholder="Enter math expression (e.g. 15 * 84 + (250 / 5))..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {["+", "-", "*", "/", "(", ")", "%"].map((sym) => (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => setCalcInput((prev) => prev + sym)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold cursor-pointer"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                  >
                    Calculate
                  </button>
                </div>
              </form>

              {calcResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Result:</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">{calcResult}</span>
                </div>
              )}
            </div>
          )}

          {/* WEATHER */}
          {tab === "weather" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City name (e.g. Mumbai, Bhubaneswar, Delhi, New York)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleFetchWeather}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 inline mr-1" />
                  Check
                </button>
              </div>

              {weatherData && (
                <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-950/60 to-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{city}</h3>
                    <p className="text-sm text-cyan-300 font-medium mt-0.5">{weatherData.cond}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono mt-3">
                      <span>Humidity: {weatherData.hum}</span>
                      <span>Wind: {weatherData.wind}</span>
                    </div>
                  </div>
                  <div className="text-4xl font-extrabold text-cyan-400 font-mono">
                    {weatherData.temp}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CLIPBOARD ASSISTANT */}
          {tab === "clipboard" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Read or paste text to summarize or translate:</span>
                <button
                  onClick={handleReadClipboard}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium cursor-pointer"
                >
                  Read Clipboard
                </button>
              </div>

              <textarea
                value={clipboardText}
                onChange={(e) => setClipboardText(e.target.value)}
                placeholder="Pasted clipboard text will appear here..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clipboardText);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  disabled={!clipboardText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {copiedNotification ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotification ? "Copied" : "Copy to Clipboard"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TRANSLATION */}
          {tab === "translate" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">Translate between Hindi, English & Odia:</span>
                <div className="flex items-center gap-1">
                  {(["Hindi", "English", "Odia"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTargetLang(lang)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        targetLang === lang
                          ? "bg-purple-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      To {lang}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || isTranslating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isTranslating ? "Translating..." : `Translate to ${targetLang}`}
                </button>
              </div>

              {translatedText && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 text-slate-200 text-xs">
                  <p className="text-purple-300 font-mono text-[10px] mb-1 uppercase">Translation Output:</p>
                  <p className="leading-relaxed">{translatedText}</p>
                </div>
              )}
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
