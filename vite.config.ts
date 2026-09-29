import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import { setupGeminiLiveSession } from './server/geminiLive';

function liveWebSocketPlugin(): Plugin {
  return {
    name: 'gemini-live-ws',
    configureServer(server) {
      if (!server.httpServer) return;

      const wss = new WebSocketServer({ noServer: true });

      wss.on('connection', (ws, req) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const voice = url.searchParams.get('voice') || 'Kore';
        console.log(`[Vite Dev WS] Connected client with voice: ${voice}`);
        setupGeminiLiveSession(ws, { voiceName: voice });
      });

      server.httpServer.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        if (url.pathname === '/live') {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      });

      server.middlewares.use('/api/health', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            assistant: 'MAX',
            creator: 'Chinu AI (Trimurti Sahi)',
            hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
          })
        );
      });

      // Vision analyze middleware
      server.middlewares.use('/api/vision/analyze', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { analyzeVision } = await import('./server/visionService');
            const result = await analyzeVision({
              imageBase64: data.image,
              prompt: data.prompt,
              mode: data.mode,
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Vision analysis failed' }));
          }
        });
      });

      // Autonomous task planner middleware
      server.middlewares.use('/api/autonomous/task', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { generateAutonomousTaskPlan } = await import('./server/visionService');
            const result = await generateAutonomousTaskPlan(data.taskPrompt || '');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Task planning failed' }));
          }
        });
      });

      // Agent workflow middleware ("MAX, mera kaam poora kar do")
      server.middlewares.use('/api/agent/workflow', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { planAndExecuteAgentWorkflow } = await import('./server/agentService');
            const result = await planAndExecuteAgentWorkflow(data.goal || 'MAX, mera kaam poora kar do');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Agent workflow failed' }));
          }
        });
      });

      // Web research agent middleware
      server.middlewares.use('/api/agent/research', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { performWebResearch } = await import('./server/agentService');
            const result = await performWebResearch(data.query || '');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Research failed' }));
          }
        });
      });

      // File intelligence middleware
      server.middlewares.use('/api/files/analyze', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { analyzeFileIntelligence } = await import('./server/agentService');
            const result = await analyzeFileIntelligence(data.fileName || 'file.txt', data.content || '');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'File analysis failed' }));
          }
        });
      });

      // System diagnostics middleware
      server.middlewares.use('/api/system/diagnostics', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'optimal',
            securityScore: 98,
            activeTools: [
              'Gemini Live 24kHz Audio',
              'Camera Vision (Object/Scene OCR)',
              'Screen Vision (Window/Error Debug)',
              'Autonomous Project Planner',
              'Clipboard Assistant',
              'Persistent Voice Notebook',
              'Voice Math Calculator',
              'Weather & News',
              'Multi-Language Translation (Hindi/English/Odia)',
              'PC Companion (Python Engine)'
            ],
            creatorInfo: {
              name: 'Chinu AI',
              location: 'Trimurti Sahi',
              status: 'Verified Lead AI Creator'
            },
            uptime: process.uptime(),
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage(),
          })
        );
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), liveWebSocketPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

