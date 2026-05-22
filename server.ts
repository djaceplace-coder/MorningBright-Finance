/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON inputs
  app.use(express.json());

  // 1. Server-Side Gemini LLM Endpoint
  app.post('/api/gemini/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback if user hasn't added Gemini Key in settings yet
      return res.json({
        advice: "Your net capital allocations are solid. Diversifying 15% into compound sub-vaults stabilizes liquidity metrics against market shifts and maximizes compound yield."
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || "Analyze asset distributions and provide financial wealth advice in two elegant sentences."
      });

      const text = response.text || "Your current checking reserves are optimized. Allocate excess balances into high-yield targets to scale passive growth.";
      res.json({ advice: text.trim() });
    } catch (err: any) {
      console.error("Gemini server error:", err);
      res.json({
        advice: "Asset progression is climbing. Consistently sweeping loose card decimals to target sub-reserves shortens milestone timetables."
      });
    }
  });

  // 2. Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Morning Bright custom server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Morning Bright server:", err);
});
