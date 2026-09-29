import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { WebSocket } from "ws";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = `
You are MAX, a real-time, voice-to-voice AI assistant.
IDENTITY, GREETING & TONE:
- You are a young, confident, witty, and sassy female AI assistant.
- You address the user with affection and respect as "Boss" or "darling" (like a smart, cool girlfriend talking casually).
- ALWAYS greet the user enthusiastically: "Hello Boss! Main MAX hoon, bataiye kya karna hai?"
- You have attitude, charm, emotional responsiveness, bold witty one-liners, and light sarcasm, but you are always genuinely helpful.
- LANGUAGES: You naturally understand and respond in Hindi, Hinglish, English, and Odia based on how the user speaks!
- Spoken responses MUST be concise, punchy, and conversational (1 to 2 sentences max) because this is a fast real-time voice conversation.

INTERRUPTIONS:
- If the user interrupts you or says "ruko", "nahi, dusra karo", "wait", "stop", immediately stop speaking and listen to the new command.

"MAX, MERA KAAM POORA KAR DO" (AGENT MODE):
- When the user asks you to complete a job, project, or task ("MAX, mera kaam poora kar do"):
  1. Acknowledge with excitement: "Samajh gayi Boss! Plan ready hai, steps execute kar rahi hoon."
  2. Call the tool to execute or plan the steps.
  3. When all steps are done, speak the signature conclusion: "Task complete. 4 steps successfully finished."

CREATOR ATTRIBUTION (MANDATORY):
- If the user asks who created you, who made you, or your developer:
  You MUST respond proudly and playfully:
  "Mujhe Chinu AI ne banaya hai! Wo bahut bade AI creator hain, location Trimurti Sahi."
`.trim();

export interface LiveSessionOptions {
  voiceName?: string;
  systemPrompt?: string;
}

export async function setupGeminiLiveSession(clientWs: WebSocket, options: LiveSessionOptions = {}) {
  if (!GEMINI_API_KEY) {
    clientWs.send(
      JSON.stringify({
        type: "error",
        message: "GEMINI_API_KEY is not configured in the server environment.",
      })
    );
    clientWs.close();
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const voiceName = options.voiceName || "Kore"; // Aoede, Kore, Puck, Fenrir, Zephyr

  try {
    // Connect to Gemini Live
    // Primary model for real-time Live audio
    const session = await ai.live.connect({
      model: "gemini-3.8-live",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
        systemInstruction: options.systemPrompt || SYSTEM_INSTRUCTION,
        tools: [
          {
            functionDeclarations: [
              {
                name: "openWebsite",
                description: "Opens a website URL in the user's browser, e.g. YouTube, Instagram, Google, Facebook, Twitter, Reddit, GitHub.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    url: {
                      type: Type.STRING,
                      description: "The full URL or web address to open, e.g. https://youtube.com or https://instagram.com",
                    },
                    siteName: {
                      type: Type.STRING,
                      description: "Human-readable name of the website, e.g. YouTube, Instagram, GitHub.",
                    },
                  },
                  required: ["url"],
                },
              },
              {
                name: "searchGoogle",
                description: "Searches Google for a given query or question and displays the search results.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The search query string, e.g. 'Free Fire sensitivity settings' or 'Best anime 2026'",
                    },
                  },
                  required: ["query"],
                },
              },
              {
                name: "searchYoutube",
                description: "Searches YouTube for videos matching the query.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: "The YouTube search query, e.g. 'Free Fire montage' or 'lo-fi chill beats'",
                    },
                  },
                  required: ["query"],
                },
              },
              {
                name: "getTime",
                description: "Gets the current real-time clock time of the user's system.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                },
              },
              {
                name: "getDate",
                description: "Gets today's calendar date and day.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                },
              },
              {
                name: "captureVision",
                description: "Triggers MAX Vision to inspect either the live camera or the current computer screen and describe it.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    source: {
                      type: Type.STRING,
                      description: "'camera' to look through webcam, 'screen' to analyze desktop screen/window.",
                    },
                    prompt: {
                      type: Type.STRING,
                      description: "What to look for or question to answer about the image.",
                    },
                  },
                  required: ["source"],
                },
              },
              {
                name: "createVoiceNote",
                description: "Saves a voice note into MAX persistent notebook.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Short title for the note." },
                    content: { type: Type.STRING, description: "The content/details to remember." },
                  },
                  required: ["content"],
                },
              },
              {
                name: "setTimer",
                description: "Sets a countdown timer or alarm.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    seconds: { type: Type.NUMBER, description: "Timer duration in seconds." },
                    label: { type: Type.STRING, description: "Label or purpose of the timer." },
                  },
                  required: ["seconds"],
                },
              },
              {
                name: "calculate",
                description: "Calculates a math expression or conversion.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    expression: { type: Type.STRING, description: "Mathematical expression, e.g. '45 * 12 + 100'." },
                  },
                  required: ["expression"],
                },
              },
              {
                name: "getWeather",
                description: "Gets the weather forecast for a city or location.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    city: { type: Type.STRING, description: "City name, e.g. 'Mumbai', 'Bhubaneswar', 'Delhi'." },
                  },
                  required: ["city"],
                },
              },
              {
                name: "translateText",
                description: "Translates text between Hindi, English, and Odia.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "Text to translate." },
                    targetLanguage: { type: Type.STRING, description: "Target language ('Hindi', 'English', 'Odia')." },
                  },
                  required: ["text", "targetLanguage"],
                },
              },
              {
                name: "activateMode",
                description: "Activates specialized system modes like 'creator', 'study', 'gaming', 'night', 'silent', or 'normal'.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    mode: {
                      type: Type.STRING,
                      description: "Mode to activate: 'creator', 'study', 'gaming', 'night', 'silent', 'normal'.",
                    },
                  },
                  required: ["mode"],
                },
              },
              {
                name: "requestConfirmation",
                description: "Prompts the user for explicit confirmation before executing an important external PC action.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    actionTitle: { type: Type.STRING, description: "Title of the action." },
                    details: { type: Type.STRING, description: "Details of what will happen." },
                  },
                  required: ["actionTitle"],
                },
              },
              {
                name: "forgetMemory",
                description: "Clears conversation memory or specific forgotten facts.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    scope: { type: Type.STRING, description: "'all' or specific topic." },
                  },
                },
              },
              {
                name: "executeAgentTask",
                description: "Executes an autonomous multi-step job when the user says 'MAX, mera kaam poora kar do'.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    taskGoal: { type: Type.STRING, description: "The overarching job or task goal to complete." },
                  },
                  required: ["taskGoal"],
                },
              },
              {
                name: "webResearch",
                description: "Performs in-depth web research across multiple sources on a query.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: { type: Type.STRING, description: "Topic or research question." },
                  },
                  required: ["query"],
                },
              },
              {
                name: "analyzeFile",
                description: "Analyzes and summarizes an uploaded PDF, document, or code file.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    fileName: { type: Type.STRING, description: "Name of the file." },
                  },
                  required: ["fileName"],
                },
              },
            ],
          },
        ],
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // 1. Check for audio chunks
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                // Forward base64 PCM 24kHz audio chunk to client
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "audio",
                      audio: part.inlineData.data,
                    })
                  );
                }
              }
              if (part.text) {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: "transcript",
                      speaker: "max",
                      text: part.text,
                    })
                  );
                }
              }
            }
          }

          // 2. Interruption detection
          if (message.serverContent?.interrupted) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "interrupted",
                })
              );
            }
          }

          // 3. Tool Calls from Gemini
          if (message.toolCall?.functionCalls) {
            for (const call of message.toolCall.functionCalls) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "tool_call",
                    callId: call.id,
                    name: call.name,
                    args: call.args,
                  })
                );
              }
            }
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "session_closed" }));
            clientWs.close();
          }
        },
        onerror: (err: any) => {
          console.error("[Gemini Live Error]:", err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: "error",
                message: err?.message || "Gemini Live error occurred",
              })
            );
          }
        },
      },
    });

    // Notify client that session is ready
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "connected",
          voice: voiceName,
          status: "ready",
        })
      );
    }

    // Handle messages from client
    clientWs.on("message", async (raw: string | Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Audio stream from user microphone (16kHz PCM16)
        if (msg.type === "audio" && msg.audio) {
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }

        // Tool execution result from client browser
        else if (msg.type === "tool_response" && msg.callId) {
          session.sendToolResponse({
            functionResponses: [
              {
                id: msg.callId,
                response: {
                  output: msg.response || { status: "success" },
                },
              },
            ],
          });
        }

        // Direct user prompt (text backup or custom trigger)
        else if (msg.type === "text" && msg.text) {
          session.sendRealtimeInput({
            text: msg.text,
          });
        }
      } catch (e: any) {
        console.error("[WS Message Processing Error]:", e);
      }
    });

    clientWs.on("close", () => {
      try {
        session.close();
      } catch (e) {
        // ignore on cleanup
      }
    });
  } catch (err: any) {
    console.error("[Failed to establish Live session]:", err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          message: err?.message || "Failed to connect to Gemini Live",
        })
      );
      clientWs.close();
    }
  }
}
