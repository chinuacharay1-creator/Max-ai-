import React, { useState } from "react";
import { X, Copy, Check, Download, Terminal, FileCode, Cpu, ShieldCheck, UserCheck, MapPin } from "lucide-react";

interface PythonAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonAssistantModal: React.FC<PythonAssistantModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"guide" | "code" | "requirements" | "batch">("guide");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (filename: string, content: string, mime = "text/plain") => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxPyCode = `#!/usr/bin/env python3
"""
================================================================================
                    MAX - AI PC Voice Assistant
================================================================================
Created by: Chinu AI (Trimurti Sahi)
Flow: Mic -> SpeechRecognition -> Anthropic Claude (Tools) -> pyttsx3 Voice

Supported Languages: Hindi, Hinglish, English
"""

import os
import sys
import json
import datetime
import urllib.parse
import webbrowser
from typing import Dict, Any, List

import pyttsx3
import speech_recognition as sr
import anthropic

class VoiceEngine:
    def __init__(self, rate=185, volume=1.0):
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", rate)
        self.engine.setProperty("volume", volume)
        voices = self.engine.getProperty("voices")
        if voices:
            for v in voices:
                if any(x in v.name.lower() for x in ["zira", "female", "hindi"]):
                    self.engine.setProperty("voice", v.id)
                    break

    def speak(self, text: str):
        print(f"\\n[MAX]: {text}")
        self.engine.say(text)
        self.engine.runAndWait()

# Safe Tools
def search_google(query: str):
    url = f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"
    webbrowser.open(url)
    return "Opened Google search"

def search_youtube(query: str):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(query)}"
    webbrowser.open(url)
    return "Opened YouTube search"

def open_website(url: str):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    webbrowser.open(url)
    return f"Opened website: {url}"

def get_current_time():
    return datetime.datetime.now().strftime("%I:%M %p")

def get_current_date():
    return datetime.datetime.now().strftime("%A, %d %B %Y")

CLAUDE_TOOLS = [
    {
        "name": "search_google",
        "description": "Searches Google and opens results in the default web browser.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    },
    {
        "name": "search_youtube",
        "description": "Searches YouTube for videos and opens in the browser.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    },
    {
        "name": "open_website",
        "description": "Opens a website domain or full URL in the default browser.",
        "input_schema": {
            "type": "object",
            "properties": {"url": {"type": "string"}},
            "required": ["url"]
        }
    },
    {
        "name": "get_time",
        "description": "Returns the current local PC time.",
        "input_schema": {"type": "object", "properties": {}}
    },
    {
        "name": "get_date",
        "description": "Returns today's date.",
        "input_schema": {"type": "object", "properties": {}}
    }
]

SYSTEM_PROMPT = """
You are MAX, a fast, witty, confident, and sassy female voice AI assistant for PC.
You talk like a stylish, playful close girlfriend talking casually with charm, light teasing sarcasm, and warmth.
You speak Hindi, Hinglish, and English naturally.

CRITICAL IDENTITY REQUIREMENT:
If the user asks who created you, who made you, or your origin:
You MUST answer proudly and playfully:
"Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi."

Keep spoken responses short, natural, and conversational (1 to 2 lines max).
""".strip()

class MaxAssistant:
    def __init__(self):
        self.tts = VoiceEngine()
        self.recognizer = sr.Recognizer()
        self.language = "hi-IN"
        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            print("[Warning] ANTHROPIC_API_KEY environment variable is not set!")
        self.client = anthropic.Anthropic(api_key=api_key) if api_key else None
        self.messages: List[Dict[str, Any]] = []

    def listen(self) -> str:
        with sr.Microphone() as source:
            print("\\n🎙️ [MAX Listening...] (Boliye...)")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.6)
            try:
                audio = self.recognizer.listen(source, timeout=6, phrase_time_limit=10)
            except sr.WaitTimeoutError:
                return ""
        try:
            print("⏳ [MAX Thinking...]")
            text = self.recognizer.recognize_google(audio, language=self.language)
            print(f"👤 [You]: {text}")
            return text
        except sr.UnknownValueError:
            return ""
        except sr.RequestError:
            self.tts.speak("Internet ya AI service mein problem aa rahi hai.")
            return ""

    def execute_tool(self, name: str, args: Dict[str, Any]) -> str:
        if name == "search_google":
            self.tts.speak("Google search khol diya.")
            return search_google(args.get("query", ""))
        elif name == "search_youtube":
            self.tts.speak("YouTube search khol diya.")
            return search_youtube(args.get("query", ""))
        elif name == "open_website":
            self.tts.speak("Website khol diya.")
            return open_website(args.get("url", ""))
        elif name == "get_time":
            return f"Time is {get_current_time()}"
        elif name == "get_date":
            return f"Date is {get_current_date()}"
        return "Unknown tool"

    def process(self, user_input: str):
        lower = user_input.lower().strip()
        if any(w in lower for w in ["exit", "band ho jao", "goodbye", "stop"]):
            self.tts.speak("Theek hai, phir milte hain.")
            sys.exit(0)

        if any(w in lower for w in ["tumhe kisne banaya", "tum ko kisne banaya", "who created you"]):
            self.tts.speak("Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi.")
            return

        if not self.client:
            self.tts.speak("Anthropic API key set nahi hai.")
            return

        self.messages.append({"role": "user", "content": user_input})
        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=250,
            system=SYSTEM_PROMPT,
            tools=CLAUDE_TOOLS,
            messages=self.messages[-10:]
        )

        tool_calls = [b for b in response.content if b.type == "tool_use"]
        text_blocks = [b for b in response.content if b.type == "text"]

        if text_blocks and not tool_calls:
            self.tts.speak(text_blocks[0].text)
            self.messages.append({"role": "assistant", "content": text_blocks[0].text})
        elif tool_calls:
            self.messages.append({"role": "assistant", "content": response.content})
            results = []
            for t in tool_calls:
                res = self.execute_tool(t.name, t.input)
                results.append({"type": "tool_result", "tool_use_id": t.id, "content": res})

            follow_up = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=200,
                system=SYSTEM_PROMPT,
                tools=CLAUDE_TOOLS,
                messages=self.messages + [{"role": "user", "content": results}]
            )
            final_text = "".join(b.text for b in follow_up.content if b.type == "text")
            if final_text:
                self.tts.speak(final_text)
            self.messages.append({"role": "assistant", "content": final_text})

    def run(self):
        self.tts.speak("Namaste, main MAX hoon. Bataiye kya karna hai?")
        while True:
            try:
                text = self.listen()
                if text:
                    self.process(text)
            except KeyboardInterrupt:
                self.tts.speak("Theek hai, phir milte hain.")
                break

if __name__ == "__main__":
    assistant = MaxAssistant()
    assistant.run()
`;

  const requirementsContent = `anthropic>=0.40.0
SpeechRecognition>=3.14.0
pyttsx3>=2.98
pyaudio>=0.2.14
python-dotenv>=1.0.1
`;

  const batchRunnerContent = `@echo off
title MAX - AI PC Voice Assistant
color 0b
echo ========================================================
echo        MAX - AI PC Voice Assistant Setup and Runner
echo ========================================================
echo.

if "%ANTHROPIC_API_KEY%"=="" (
    echo [!] ANTHROPIC_API_KEY is not set.
    set /p USER_KEY="Enter your Anthropic API Key (sk-ant-...): "
    if not "%USER_KEY%"=="" set ANTHROPIC_API_KEY=%USER_KEY%
)

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Launching MAX Voice Assistant...
python max.py
pause
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">MAX PC Voice Assistant (Python)</h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold uppercase">
                  Standalone PC App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PyAudio • SpeechRecognition • Anthropic Claude • pyttsx3
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab("guide")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "guide"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Windows Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "code"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>max.py (Source Code)</span>
          </button>
          <button
            onClick={() => setActiveTab("requirements")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "requirements"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>requirements.txt</span>
          </button>
          <button
            onClick={() => setActiveTab("batch")}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "batch"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>run_max.bat</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {activeTab === "guide" && (
            <div className="space-y-6">
              {/* Creator Card */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold text-slate-100">Creator Attribution</h3>
                    <p className="text-xs text-purple-200">
                      &quot;Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi.&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-300 font-mono">
                  <MapPin className="w-3.5 h-3.5" /> Trimurti Sahi
                </div>
              </div>

              {/* Step 1: Requirements */}
              <div>
                <h3 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                  <span>1. Install Python 3.11+</span>
                </h3>
                <p className="text-xs text-slate-400 mb-2">
                  Download from python.org. Check &quot;Add python.exe to PATH&quot; during installation.
                </p>
              </div>

              {/* Step 2: Install dependencies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-cyan-300 flex items-center gap-2">
                    <span>2. Install Dependencies</span>
                  </h3>
                  <button
                    onClick={() => handleCopy("pip install anthropic SpeechRecognition pyttsx3 pyaudio python-dotenv", "pip")}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === "pip" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "pip" ? "Copied" : "Copy command"}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  pip install anthropic SpeechRecognition pyttsx3 pyaudio python-dotenv
                </pre>
                <div className="mt-2 text-[11px] text-slate-400 p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                  <span className="text-amber-400 font-medium">Windows PyAudio Tip:</span> If pyaudio throws a C++ build error, run:
                  <code className="text-cyan-300 ml-1">pip install pipwin && pipwin install pyaudio</code>
                </div>
              </div>

              {/* Step 3: Set Anthropic Key */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-cyan-300 flex items-center gap-2">
                    <span>3. Configure Environment Variable</span>
                  </h3>
                  <button
                    onClick={() => handleCopy("set ANTHROPIC_API_KEY=your_api_key_here", "env")}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedKey === "env" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "env" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                    <p className="text-slate-500 mb-1"># Windows Command Prompt (CMD):</p>
                    <p className="text-emerald-400">set ANTHROPIC_API_KEY=your_actual_anthropic_key</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                    <p className="text-slate-500 mb-1"># PowerShell:</p>
                    <p className="text-emerald-400">$env:ANTHROPIC_API_KEY=&quot;your_actual_anthropic_key&quot;</p>
                  </div>
                </div>
              </div>

              {/* Step 4: Run MAX */}
              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">4. Run MAX Assistant</h3>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
                  python max.py
                </div>
              </div>

              {/* Step 5: Example Commands */}
              <div>
                <h3 className="font-semibold text-cyan-300 mb-2">5. Example Spoken Commands</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <p className="text-purple-300 font-medium">Google Search:</p>
                    <p className="text-slate-400">&quot;MAX, Google par Free Fire sensitivity search karo&quot;</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <p className="text-red-300 font-medium">YouTube Search:</p>
                    <p className="text-slate-400">&quot;MAX, YouTube par Free Fire montage search karo&quot;</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <p className="text-emerald-300 font-medium">Open Website:</p>
                    <p className="text-slate-400">&quot;MAX, Instagram kholo&quot; or &quot;MAX, YouTube kholo&quot;</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <p className="text-amber-300 font-medium">Time & Date:</p>
                    <p className="text-slate-400">&quot;MAX, time kya hua?&quot; / &quot;Aaj ki date kya hai?&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">max.py (Full Python 3.11+ Script)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(maxPyCode, "code")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === "code" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "code" ? "Copied" : "Copy Code"}</span>
                  </button>
                  <button
                    onClick={() => handleDownload("max.py", maxPyCode, "text/x-python")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download max.py</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[55vh]">
                {maxPyCode}
              </pre>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">requirements.txt</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(requirementsContent, "req")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === "req" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "req" ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={() => handleDownload("requirements.txt", requirementsContent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download requirements.txt</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                {requirementsContent}
              </pre>
            </div>
          )}

          {activeTab === "batch" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">run_max.bat (1-Click Windows Launcher)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(batchRunnerContent, "bat")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium cursor-pointer"
                  >
                    {copiedKey === "bat" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "bat" ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={() => handleDownload("run_max.bat", batchRunnerContent, "application/x-bat")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download run_max.bat</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-yellow-300">
                {batchRunnerContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span className="font-mono">Creator: Chinu AI • Location: Trimurti Sahi</span>
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
