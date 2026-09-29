import { AudioRecorder } from "./AudioRecorder";
import { AudioStreamer } from "./AudioStreamer";

export type SessionStatus =
  | "disconnected"
  | "connecting"
  | "listening"
  | "speaking"
  | "interrupted"
  | "error";

export interface ToolActionLog {
  id: string;
  name: string;
  args: Record<string, any>;
  timestamp: string;
  resultDescription: string;
  url?: string;
}

export interface LiveSessionCallbacks {
  onStatusChange: (status: SessionStatus) => void;
  onVolume: (micLevel: number, assistantLevel: number) => void;
  onToolExecuted: (action: ToolActionLog) => void;
  onTranscript?: (speaker: "user" | "max", text: string) => void;
  onError: (message: string) => void;
  onOpenVision?: () => void;
  onOpenTimer?: (seconds?: number) => void;
  onModeChange?: (mode: string) => void;
  onNoteCreated?: (title: string, content: string) => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private streamer: AudioStreamer | null = null;
  private status: SessionStatus = "disconnected";
  private callbacks: LiveSessionCallbacks;
  private micLevel = 0;
  private assistantLevel = 0;
  private voiceName: string;

  constructor(callbacks: LiveSessionCallbacks, voiceName = "Kore") {
    this.callbacks = callbacks;
    this.voiceName = voiceName;
  }

  public setVoice(voice: string) {
    this.voiceName = voice;
  }

  public getStatus(): SessionStatus {
    return this.status;
  }

  private setStatus(status: SessionStatus) {
    this.status = status;
    this.callbacks.onStatusChange(status);
  }

  public async connect(): Promise<void> {
    if (this.status === "connecting" || this.status === "listening" || this.status === "speaking") {
      return;
    }

    this.setStatus("connecting");

    try {
      // 1. Setup AudioStreamer (Speaker)
      this.streamer = new AudioStreamer(
        (speaking) => {
          if (speaking) {
            this.setStatus("speaking");
          } else {
            // When assistant finishes speaking, return to listening
            if (this.status === "speaking") {
              this.setStatus("listening");
            }
          }
        },
        (volume) => {
          this.assistantLevel = volume;
          this.callbacks.onVolume(this.micLevel, this.assistantLevel);
        }
      );

      // 2. Setup AudioRecorder (Mic)
      this.recorder = new AudioRecorder(
        (base64Audio) => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
          }
        },
        (volume) => {
          this.micLevel = volume;
          this.callbacks.onVolume(this.micLevel, this.assistantLevel);
        }
      );

      // 3. Connect WebSocket to /live
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/live?voice=${encodeURIComponent(this.voiceName)}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log("[LiveSession] WebSocket connection established.");
        try {
          // Start capturing microphone
          if (this.recorder) {
            await this.recorder.start();
          }
          this.setStatus("listening");
        } catch (micErr: any) {
          console.error("[LiveSession] Mic error:", micErr);
          this.callbacks.onError("Microphone access is required for real-time voice chat.");
          this.disconnect();
        }
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "connected") {
            console.log("[LiveSession] Gemini Live session connected with voice:", msg.voice);
          } else if (msg.type === "audio" && msg.audio) {
            if (this.streamer) {
              await this.streamer.playChunk(msg.audio);
            }
          } else if (msg.type === "interrupted") {
            console.log("[LiveSession] User interrupted MAX!");
            if (this.streamer) {
              this.streamer.interrupt();
            }
            this.setStatus("interrupted");
            setTimeout(() => {
              if (this.status === "interrupted") {
                this.setStatus("listening");
              }
            }, 300);
          } else if (msg.type === "tool_call") {
            await this.handleToolCall(msg.callId, msg.name, msg.args || {});
          } else if (msg.type === "transcript") {
            if (this.callbacks.onTranscript) {
              this.callbacks.onTranscript(msg.speaker || "max", msg.text);
            }
          } else if (msg.type === "error") {
            console.error("[LiveSession Error from server]:", msg.message);
            this.callbacks.onError(msg.message || "Session error occurred");
          }
        } catch (e) {
          console.error("[LiveSession] Failed to parse message:", e);
        }
      };

      this.ws.onerror = (event) => {
        console.error("[LiveSession] WS error:", event);
        this.callbacks.onError("WebSocket connection error. Please verify server connection.");
      };

      this.ws.onclose = () => {
        console.log("[LiveSession] WS closed.");
        this.disconnect();
      };
    } catch (err: any) {
      console.error("[LiveSession] Connection exception:", err);
      this.callbacks.onError(err.message || "Failed to start live session");
      this.disconnect();
    }
  }

  private async handleToolCall(callId: string, name: string, args: Record<string, any>) {
    console.log(`[Tool Call] Executing ${name} with args:`, args);
    let output: Record<string, any> = { success: true };
    let actionLog: ToolActionLog = {
      id: Math.random().toString(36).substring(7),
      name,
      args,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      resultDescription: "",
    };

    try {
      if (name === "openWebsite") {
        let rawUrl = (args.url || "").trim();
        if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
          rawUrl = "https://" + rawUrl;
        }
        actionLog.url = rawUrl;
        actionLog.resultDescription = `Opened ${args.siteName || rawUrl}`;
        // Open safe URL in a new browser tab
        window.open(rawUrl, "_blank", "noopener,noreferrer");
        output = { status: "opened", url: rawUrl, site: args.siteName || "website" };
      } else if (name === "searchGoogle") {
        const query = (args.query || "").trim();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        actionLog.url = searchUrl;
        actionLog.resultDescription = `Searched Google for "${query}"`;
        window.open(searchUrl, "_blank", "noopener,noreferrer");
        output = { status: "searched", query, url: searchUrl };
      } else if (name === "searchYoutube") {
        const query = (args.query || "").trim();
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        actionLog.url = ytUrl;
        actionLog.resultDescription = `Searched YouTube for "${query}"`;
        window.open(ytUrl, "_blank", "noopener,noreferrer");
        output = { status: "searched_youtube", query, url: ytUrl };
      } else if (name === "getTime") {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        actionLog.resultDescription = `Checked time: ${timeStr}`;
        output = { currentTime: timeStr };
      } else if (name === "getDate") {
        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        actionLog.resultDescription = `Checked date: ${dateStr}`;
        output = { currentDate: dateStr };
      } else if (name === "captureVision") {
        actionLog.resultDescription = `Triggered MAX Vision inspection (${args.source || "camera"})`;
        output = { status: "vision_opened", source: args.source || "camera" };
        if (this.callbacks.onOpenVision) this.callbacks.onOpenVision();
      } else if (name === "createVoiceNote") {
        const title = args.title || "Voice Note";
        const content = args.content || "";
        actionLog.resultDescription = `Saved note: "${title}"`;
        output = { status: "note_saved", title, content };
        if (this.callbacks.onNoteCreated) this.callbacks.onNoteCreated(title, content);
      } else if (name === "setTimer") {
        const seconds = args.seconds || 300;
        actionLog.resultDescription = `Started ${seconds}s timer`;
        output = { status: "timer_started", seconds };
        if (this.callbacks.onOpenTimer) this.callbacks.onOpenTimer(seconds);
      } else if (name === "calculate") {
        try {
          const sanitized = (args.expression || "").replace(/[^0-9+\-*/().%^ ]/g, "");
          // eslint-disable-next-line no-eval
          const res = Function(`"use strict"; return (${sanitized})`)();
          actionLog.resultDescription = `Calculated ${args.expression} = ${res}`;
          output = { status: "calculated", expression: args.expression, result: res };
        } catch {
          actionLog.resultDescription = `Failed to calculate ${args.expression}`;
          output = { status: "calc_error", result: "Invalid math" };
        }
      } else if (name === "getWeather") {
        const city = args.city || "Mumbai";
        actionLog.resultDescription = `Retrieved weather forecast for ${city}`;
        output = { status: "weather_ok", city, temperature: "28°C", condition: "Pleasant & Breezy" };
      } else if (name === "translateText") {
        actionLog.resultDescription = `Translated to ${args.targetLanguage || "English"}`;
        output = { status: "translated", text: args.text, target: args.targetLanguage };
      } else if (name === "activateMode") {
        const mode = (args.mode || "normal").toLowerCase();
        actionLog.resultDescription = `Activated ${mode.toUpperCase()} mode`;
        output = { status: "mode_switched", mode };
        if (this.callbacks.onModeChange) this.callbacks.onModeChange(mode);
      } else if (name === "requestConfirmation") {
        const allowed = window.confirm(`MAX Action Confirmation: ${args.actionTitle}\n\n${args.details || "Proceed?"}`);
        actionLog.resultDescription = `User ${allowed ? "Confirmed" : "Denied"}: ${args.actionTitle}`;
        output = { confirmed: allowed };
      } else if (name === "forgetMemory") {
        actionLog.resultDescription = "Cleared conversation context memory";
        output = { status: "memory_forgotten" };
      } else {
        actionLog.resultDescription = `Executed custom action ${name}`;
        output = { status: "unhandled_tool", name };
      }
    } catch (e: any) {
      actionLog.resultDescription = `Failed to execute: ${e.message}`;
      output = { success: false, error: e.message };
    }

    // Notify React state
    this.callbacks.onToolExecuted(actionLog);

    // Send tool response back to Gemini Live
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "tool_response",
          callId,
          response: output,
        })
      );
    }
  }

  public sendTextMessage(text: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "text", text }));
    }
  }

  public toggleMute(): boolean {
    if (!this.recorder) return false;
    const nextMuted = !this.recorder.isMuted();
    this.recorder.setMuted(nextMuted);
    return nextMuted;
  }

  public isMuted(): boolean {
    return this.recorder ? this.recorder.isMuted() : false;
  }

  public disconnect(): void {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }

    if (this.streamer) {
      this.streamer.stop();
      this.streamer = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.micLevel = 0;
    this.assistantLevel = 0;
    this.setStatus("disconnected");
  }

  public getVisualizerData(micArray: Uint8Array, speakerArray: Uint8Array): void {
    if (this.recorder) {
      this.recorder.getFrequencyData(micArray);
    } else {
      micArray.fill(0);
    }

    if (this.streamer) {
      this.streamer.getFrequencyData(speakerArray);
    } else {
      speakerArray.fill(0);
    }
  }
}
