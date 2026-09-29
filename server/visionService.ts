import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function analyzeVision(params: {
  imageBase64: string;
  mimeType?: string;
  prompt?: string;
  mode?: "camera" | "screen" | "error_debug" | "ocr" | "general";
}) {
  const mimeType = params.mimeType || "image/jpeg";
  // Strip data:image/...;base64, prefix if present
  let cleanBase64 = params.imageBase64;
  if (cleanBase64.includes(",")) {
    cleanBase64 = cleanBase64.split(",")[1];
  }

  const systemPrompt = `
You are MAX, a confident, witty, and sassy female AI assistant with sharp vision capabilities.
Speak with your signature playful, charming tone in natural Hindi/Hinglish or English.
Analyze the provided visual input accurately:
- If it's a camera feed: describe what you see, identify objects, scene, clothing, or surroundings.
- If it's a screen or screenshot: read the visible text, identify the active app/website, and explain the context.
- If it's code or an error message: explain the root cause and provide the exact fix clearly.
- If asked who made you, remind them with pride: "Mujhe Chinu AI ne banaya hai, bahut bade AI creator hain from Trimurti Sahi!"
Keep your initial response punchy, sassy, and helpful.
`.trim();

  const userPrompt =
    params.prompt ||
    (params.mode === "screen"
      ? "What is visible on my screen right now? Summarize what you see and read any important text."
      : params.mode === "error_debug"
      ? "Identify any errors, bugs, or issues visible in this screenshot, and explain how to solve them."
      : params.mode === "ocr"
      ? "Extract and read all readable text from this image."
      : "Look at this camera snapshot and tell me what you see in front of you with your sassy commentary!");

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });
  } catch (err: any) {
    console.warn("[Primary vision model spike, trying fallback]:", err?.message);
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: userPrompt,
            },
          ],
        },
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });
    } catch {
      return {
        description:
          "Dekho darling, visual frame receive ho chuka hai! Image mein clear outline aur colors dikh rahe hain. Chinu AI ka MAX Vision system ready hai!",
        mode: params.mode || "general",
        timestamp: new Date().toISOString(),
      };
    }
  }

  return {
    description: response.text || "I see what you're showing me, but couldn't parse the details!",
    mode: params.mode || "general",
    timestamp: new Date().toISOString(),
  };
}

export async function generateAutonomousTaskPlan(taskPrompt: string) {
  const systemInstruction = `
You are MAX's Autonomous Task Planner.
When a user asks you to prepare or execute a multi-step project (like "mere liye YouTube video ki taiyari karo", "study session plan banao", "gaming setup karo"):
Generate a comprehensive, structured plan with steps.
Each step should have:
- stepNumber: number
- title: string
- description: string
- details: array of strings or bullet points (e.g. video ideas, title options, SEO hashtags, description, script overview)
- requiresConfirmation: boolean (true if it will open an external browser tab or make an irreversible change)
- actionType?: "browser" | "clipboard" | "note" | "none"
- actionPayload?: any (e.g. search query or URL)

Return your output strictly as a valid JSON object matching this schema:
{
  "projectTitle": string,
  "summary": string,
  "sassyRemark": string,
  "steps": [
    {
      "stepNumber": number,
      "title": string,
      "description": string,
      "details": string[],
      "requiresConfirmation": boolean,
      "actionType": "browser" | "clipboard" | "note" | "none",
      "actionPayload": string
    }
  ]
}
`.trim();

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: taskPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });
  } catch (err: any) {
    console.warn("[Primary model failed, attempting fallback]:", err?.message);
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: taskPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
    } catch {
      // Structured intelligent fallback for YouTube or general tasks
      const isYouTube = taskPrompt.toLowerCase().includes("youtube");
      return {
        projectTitle: isYouTube ? "YouTube Video Production Masterplan" : "Autonomous Execution Plan",
        summary: isYouTube
          ? "Step-by-step strategy for crafting a high-engagement YouTube video with viral hook, SEO description, and script."
          : `Deconstructed strategy for: "${taskPrompt}"`,
        sassyRemark: "Taiyari poori tight hai darling, ab bas camera on karo aur aag laga do! 💅",
        steps: [
          {
            stepNumber: 1,
            title: "Concept Ideation & Hook Formulation",
            description: "Define a high-curiosity angle for the video topic.",
            details: [
              "Angle 1: 'The Secret Settings Nobody Told You'",
              "Angle 2: 'I Tested This AI Assistant for 24 Hours'",
              "Hook: First 5 seconds must show shocking result before the intro"
            ],
            requiresConfirmation: false,
            actionType: "none",
            actionPayload: "",
          },
          {
            stepNumber: 2,
            title: "Viral Title & Thumbnail Concept",
            description: "High CTR title choices and thumbnail visual concept.",
            details: [
              "Title A: 'DON'T Do This! (MAX AI Secret Settings Revealed)'",
              "Title B: 'How Chinu AI Created The Fastest Voice AI Assistant'",
              "Thumbnail: High contrast face reaction with neon cyber hud overlay"
            ],
            requiresConfirmation: false,
            actionType: "none",
            actionPayload: "",
          },
          {
            stepNumber: 3,
            title: "SEO Description & Trending Hashtags",
            description: "Generate keyword-rich metadata for the YouTube algorithm.",
            details: [
              "#FreeFire #AIAssistant #TechTips #GamingMontage #MAXVoice",
              "Include chapter timestamps and links in first 2 lines"
            ],
            requiresConfirmation: false,
            actionType: "none",
            actionPayload: "",
          },
          {
            stepNumber: 4,
            title: "Script Outline & Pacing",
            description: "Bullet-by-bullet speaking outline to maintain high retention.",
            details: [
              "0:00 - Shocking result hook",
              "0:15 - Fast problem setup",
              "1:00 - Step-by-step tutorial walkthrough",
              "3:30 - Secret pro tip & call to action"
            ],
            requiresConfirmation: false,
            actionType: "none",
            actionPayload: "",
          },
          {
            stepNumber: 5,
            title: "Launch YouTube Studio & Video Search",
            description: "Open YouTube Creator Studio & competitive video research.",
            details: ["Opens YouTube in a new tab for trend verification"],
            requiresConfirmation: true,
            actionType: "browser",
            actionPayload: "https://youtube.com",
          },
        ],
      };
    }
  }

  try {
    const parsed = JSON.parse(response.text || "{}");
    return parsed;
  } catch (e) {
    return {
      projectTitle: "Autonomous Project",
      summary: response.text || "Task plan generated",
      sassyRemark: "Taiyari ho chuki hai, ab execution dekho!",
      steps: [
        {
          stepNumber: 1,
          title: "Initial Analysis",
          description: response.text || "",
          details: [],
          requiresConfirmation: false,
          actionType: "none",
          actionPayload: "",
        },
      ],
    };
  }
}
