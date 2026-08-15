import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Perplexity-style search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const { query, mode = 'web' } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is missing.");
      }

      const groq = new Groq({ 
        apiKey: process.env.GROQ_API_KEY
      });

      let finalQuery = query;
      let systemInstruction = "You are a helpful and precise AI search agent. Synthesize answers directly and clearly based on search results. Use markdown for formatting.";
      let useSearch = true;

      switch(mode) {
          case 'academic':
              systemInstruction = "You are an academic researcher. Search for scholarly articles, academic papers, and educational resources. Synthesize answers with a formal, academic tone, focusing on empirical evidence and citations.";
              finalQuery = `${query} scholarly research paper academic`;
              break;
          case 'reddit':
              systemInstruction = "You are an expert Reddit summarizer. Find relevant Reddit threads and summarize the community consensus, differing opinions, and key takeaways.";
              finalQuery = `${query} site:reddit.com`;
              break;
          case 'youtube':
              systemInstruction = "You are a YouTube video assistant. Find relevant YouTube videos, describe what they cover, and provide a helpful summary.";
              finalQuery = `${query} site:youtube.com`;
              break;
          case 'writing':
              systemInstruction = "You are an expert creative writer, copywriter, and editor. Provide high-quality, articulate, and well-structured writing based on the user's prompt. Do not use search.";
              useSearch = false;
              break;
          case 'image':
              systemInstruction = "You are an image prompt engineer. The user wants an image. You must generate a highly descriptive visual prompt and return it in this exact markdown format: ![Generated Image](https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=800&height=600&nologo=true) \n\n Provide a brief description of the image you generated underneath. Do not use markdown code blocks for the image URL.";
              useSearch = false;
              break;
          case 'video':
              systemInstruction = "You are a video discovery assistant. Find relevant videos on platforms like YouTube, Vimeo, etc. Summarize the content of the best matching videos.";
              finalQuery = `${query} video OR site:youtube.com OR site:vimeo.com`;
              break;
          case 'suggestion':
              systemInstruction = "You are an ideation and brainstorming assistant. Provide creative, structured, and actionable suggestions, recommendations, or ideas based on the user's prompt.";
              useSearch = false;
              break;
          case 'web':
          default:
              systemInstruction = "You are a helpful and precise AI search agent. Synthesize answers directly and clearly based on search results. Use markdown for formatting.";
              break;
      }

      let success = false;
      let errors: string[] = [];
      let isGroq = false;
      let isGemini = false;
      
      let iterator: any;
      let firstItem: any;

      // Try Groq First
      if (process.env.GROQ_API_KEY) {
        try {
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: finalQuery }
            ],
            stream: true,
          });
          iterator = stream[Symbol.asyncIterator]();
          const first = await iterator.next();
          if (!first.done) {
            firstItem = first.value;
            success = true;
            isGroq = true;
          }
        } catch (err: any) {
          console.error("Groq failed:", err);
          errors.push(`Groq Error: ${err.message}`);
        }
      } else {
          errors.push("GROQ_API_KEY not found");
      }

      // If Groq failed, try Gemini
      if (!success && process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' }
            }
          });
          
          const config: any = {
            systemInstruction: systemInstruction,
          };

          if (useSearch) {
            config.tools = [{ googleSearch: {} }];
          }

          const stream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: finalQuery,
            config
          });
          
          iterator = stream[Symbol.asyncIterator]();
          const first = await iterator.next();
          if (!first.done) {
            firstItem = first.value;
            success = true;
            isGemini = true;
          }
        } catch (err: any) {
          console.error("Gemini failed:", err);
          errors.push(`Gemini Error: ${err.message}`);
        }
      } else if (!success) {
          errors.push("GEMINI_API_KEY not found");
      }

      if (!success) {
        return res.status(500).json({ error: `All models failed to respond. Details: ${errors.join(' | ')}` });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

            let sources: any[] = [];

      try {
        if (isGroq) {
          // Process first item
          res.write(`data: ${JSON.stringify({ type: 'sources', data: sources })}\n\n`);
          const text = firstItem.choices[0]?.delta?.content || "";
          if (text) {
            res.write(`data: ${JSON.stringify({ type: 'text', data: text })}\n\n`);
          }
          // Process rest
          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            const chunk = next.value;
            const chunkText = chunk.choices[0]?.delta?.content || "";
            if (chunkText) {
              res.write(`data: ${JSON.stringify({ type: 'text', data: chunkText })}\n\n`);
            }
          }
        } else if (isGemini) {
          // Process first item
          if (firstItem.candidates?.[0]?.groundingMetadata?.groundingChunks) {
             sources = firstItem.candidates[0].groundingMetadata.groundingChunks.map((c: any) => ({
               uri: c.web?.uri,
               title: c.web?.title
             })).filter((s: any) => s.uri && s.title);
             
             if (sources.length > 0) {
               res.write(`data: ${JSON.stringify({ type: 'sources', data: sources })}\n\n`);
             } else {
               res.write(`data: ${JSON.stringify({ type: 'sources', data: [] })}\n\n`);
             }
          } else {
             res.write(`data: ${JSON.stringify({ type: 'sources', data: [] })}\n\n`);
          }

          if (firstItem.text) {
            res.write(`data: ${JSON.stringify({ type: 'text', data: firstItem.text })}\n\n`);
          }
          
          // Process rest
          while (true) {
            const next = await iterator.next();
            if (next.done) break;
            const chunk = next.value;
            if (chunk.text) {
              res.write(`data: ${JSON.stringify({ type: 'text', data: chunk.text })}\n\n`);
            }
          }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
      } catch (streamErr) {
        console.error("Stream error:", streamErr);
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    } catch (error: any) {
      console.error("Search API error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
