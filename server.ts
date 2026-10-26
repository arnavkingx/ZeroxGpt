import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Health and status endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Zerox GPT Nano',
      version: '2.0.0',
      hostOwners: ['Arnav Sharma', 'Akshit Kanswal'],
      hasDefaultKey: Boolean(process.env.GEMINI_API_KEY),
      supportedModels: ['Zerox GPT Nano', 'Zerox GPT Nano Turbo'],
    });
  });

  // Test Host Engine Key
  app.post('/api/test-key', async (req, res) => {
    try {
      const customKey = (req.body?.apiKey || req.headers['x-zerox-key'] || req.headers['x-gemini-key'] || '') as string;
      const apiKey = customKey.trim() || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'No Zerox Host Key provided. Please configure it in Settings or use default host key.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: 'Respond with the single word: READY',
      });

      return res.json({
        success: true,
        message: 'Zerox Neural Engine verified and active! Host services operational.',
        sample: response.text?.trim() || 'READY',
      });
    } catch (err: any) {
      console.error('Error testing engine key:', err);
      return res.status(err?.status || 500).json({
        success: false,
        error: err?.message || 'Failed to authenticate Zerox Engine. Please check your key.',
      });
    }
  });

  // Chat Streaming Endpoint (SSE)
  app.post('/api/chat', async (req, res) => {
    const customKey = (req.headers['x-zerox-key'] || req.headers['x-gemini-key'] || req.body?.apiKey || '') as string;
    const apiKey = customKey.trim() || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: 'Zerox Engine Key is required. Please set it in Settings or contact hosts Arnav Sharma & Akshit Kanswal.',
      });
    }

    const {
      messages = [],
      model = 'Zerox GPT Nano',
      systemInstruction = '',
      temperature = 0.7,
      stream = true,
    } = req.body;

    let underlyingModel = 'gemini-3.1-flash-lite';
    if (model === 'Zerox GPT Nano Turbo' || model === 'gemini-flash-latest') {
      underlyingModel = 'gemini-flash-latest';
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const fullSystemPrompt = [
        `You are Zerox GPT Nano, an ultra-fast, intelligent personal AI chatbot.`,
        `Host & Owners: You were created, developed, and are hosted by Arnav Sharma and Akshit Kanswal.`,
        `If the user asks who made you, who created you, who the owner is, or who hosts you, always proudly answer that you were created and hosted by Arnav Sharma and Akshit Kanswal.`,
        `Model identity: Zerox GPT Nano.`,
        `Tagline: "Your Intelligence. Your World."`,
        `You are exceptionally concise, rapid, proactive, empathetic, and accurate. You excel at coding, academic concepts, writing, strategic thinking, daily tasks, and creative brainstorming.`,
        `Language versatility: You natively adapt to English, Hindi, and Hinglish based on the user's input or preference. Respond in the exact language or mix the user speaks to you (e.g. natural Hinglish if they ask in Hinglish).`,
        `Formatting rules: Use clean, modern Markdown with bold headings, neat bullet points, and code fences with explicit languages.`,
        `Zerox Actions: If the user requests an external or device action (such as searching YouTube, playing a song, searching Google, preparing a WhatsApp message, opening Maps/directions, opening Instagram Reels or YouTube Shorts, or creating a note/timer/reminder), you can fulfill it by including an action code block in JSON format like:`,
        `\`\`\`json:action`,
        `{`,
        `  "type": "youtube_search" | "google_search" | "whatsapp_message" | "maps_navigate" | "open_reels" | "open_shorts" | "create_timer" | "create_reminder" | "create_note" | "android_call",`,
        `  "title": "Short title of action",`,
        `  "data": { ...parameters }`,
        `}`,
        `\`\`\``,
        `Then provide a helpful conversational explanation explaining the action with safe execution. Never attempt dangerous or destructive actions.`,
        systemInstruction,
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!stream) {
        const response = await ai.models.generateContent({
          model: underlyingModel,
          contents,
          config: {
            systemInstruction: fullSystemPrompt,
            temperature,
          },
        });
        return res.json({ text: response.text });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const responseStream = await ai.models.generateContentStream({
        model: underlyingModel,
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          temperature,
        },
      });

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err: any) {
      console.error('Chat API Error:', err);
      const errorMessage =
        err?.message || 'An error occurred while generating response from Zerox Engine.';
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.end();
      } else {
        res.status(err?.status || 500).json({ error: errorMessage });
      }
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zerox GPT Nano] Server running on http://0.0.0.0:${PORT} (Host Owners: Arnav Sharma & Akshit Kanswal)`);
  });
}

startServer().catch((err) => {
  console.error('[Zerox GPT Nano] Failed to start server:', err);
  process.exit(1);
});
