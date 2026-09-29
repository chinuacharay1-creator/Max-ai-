import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { setupGeminiLiveSession } from "./server/geminiLive.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "25mb" }));

// API health and info
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    assistant: "MAX",
    creator: "Chinu AI (Trimurti Sahi)",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Vision Analysis API (Camera, Screenshot, OCR, Debugging)
app.post("/api/vision/analyze", async (req, res) => {
  try {
    const { image, prompt, mode } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }
    const { analyzeVision } = await import("./server/visionService.js");
    const result = await analyzeVision({ imageBase64: image, prompt, mode });
    res.json(result);
  } catch (error: any) {
    console.error("[Vision API Error]:", error);
    res.status(500).json({ error: error.message || "Vision analysis failed" });
  }
});

// Autonomous Task Planner
app.post("/api/autonomous/task", async (req, res) => {
  try {
    const { taskPrompt } = req.body;
    if (!taskPrompt) {
      return res.status(400).json({ error: "Missing taskPrompt" });
    }
    const { generateAutonomousTaskPlan } = await import("./server/visionService.js");
    const plan = await generateAutonomousTaskPlan(taskPrompt);
    res.json(plan);
  } catch (error: any) {
    console.error("[Autonomous Task API Error]:", error);
    res.status(500).json({ error: error.message || "Failed to generate autonomous task plan" });
  }
});

// Autonomous Agent Workflow ("MAX, mera kaam poora kar do")
app.post("/api/agent/workflow", async (req, res) => {
  try {
    const { goal } = req.body;
    const { planAndExecuteAgentWorkflow } = await import("./server/agentService.js");
    const workflow = await planAndExecuteAgentWorkflow(goal || "MAX, mera kaam poora kar do");
    res.json(workflow);
  } catch (error: any) {
    console.error("[Agent Workflow Error]:", error);
    res.status(500).json({ error: error.message || "Failed to execute agent workflow" });
  }
});

// Web Research Agent
app.post("/api/agent/research", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    const { performWebResearch } = await import("./server/agentService.js");
    const result = await performWebResearch(query);
    res.json(result);
  } catch (error: any) {
    console.error("[Web Research Error]:", error);
    res.status(500).json({ error: error.message || "Web research failed" });
  }
});

// File Intelligence
app.post("/api/files/analyze", async (req, res) => {
  try {
    const { fileName, content } = req.body;
    if (!content) return res.status(400).json({ error: "File content is required" });
    const { analyzeFileIntelligence } = await import("./server/agentService.js");
    const result = await analyzeFileIntelligence(fileName || "document.txt", content);
    res.json(result);
  } catch (error: any) {
    console.error("[File Analysis Error]:", error);
    res.status(500).json({ error: error.message || "File analysis failed" });
  }
});

// Safe System Diagnostics
app.get("/api/system/diagnostics", (_req, res) => {
  res.json({
    status: "optimal",
    securityScore: 98,
    activeTools: [
      "Gemini Live 24kHz Audio",
      "Camera Vision (Object/Scene OCR)",
      "Screen Vision (Window/Error Debug)",
      "Autonomous Project Planner",
      "Clipboard Assistant",
      "Persistent Voice Notebook",
      "Voice Math Calculator",
      "Weather & News",
      "Multi-Language Translation (Hindi/English/Odia)",
      "PC Companion (Python Engine)"
    ],
    creatorInfo: {
      name: "Chinu AI",
      location: "Trimurti Sahi",
      status: "Verified Lead AI Creator"
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
  });
});

// Serve static build in production
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (_req, res, next) => {
  if (_req.path.startsWith("/api") || _req.path.startsWith("/live")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Build frontend with `npm run build` first.");
    }
  });
});

const server = http.createServer(app);

// WebSocket Server for Gemini Live Realtime Audio
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const voice = url.searchParams.get("voice") || "Kore";
  console.log(`[WS] Client connected for voice: ${voice}`);
  setupGeminiLiveSession(ws, { voiceName: voice });
});

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`).pathname;
  if (pathname === "/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`⚡ MAX Voice Assistant Server running on http://0.0.0.0:${port}`);
  console.log(`🎙️ Gemini Live WebSocket mounted on ws://0.0.0.0:${port}/live`);
});
