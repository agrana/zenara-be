import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Initialize OpenAI client with API key fallback
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for processing scratchpad content with LLM
  app.post("/api/process-content", async (req, res) => {
    try {
      const { content, format } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      // If no OpenAI API key, respond with error
      if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured",
          processedContent: content 
        });
      }
      
      // Define system prompts based on format
      let systemPrompt = "";
      
      switch (format) {
        case "diary":
          systemPrompt = "You're helping organize a personal diary entry. Structure the text with proper formatting, fix any typos, and organize thoughts clearly. Use markdown for headings and lists. Keep the personal tone intact.";
          break;
        case "meeting":
          systemPrompt = "You're helping organize meeting notes. Extract and highlight key points, decisions, and action items. Structure with clear headings, lists, and tables if appropriate. Use markdown formatting.";
          break;
        case "braindump":
          systemPrompt = "You're helping organize a brain dump of thoughts. Categorize ideas, identify themes, and structure the content logically. Keep the original thoughts but improve clarity. Use markdown formatting.";
          break;
        case "brainstorm":
          systemPrompt = "You're helping refine a brainstorming session. Organize ideas by theme, suggest potential action items, and create a structured document with pros/cons where appropriate. Use markdown formatting.";
          break;
        default:
          systemPrompt = "Improve this text by organizing it with proper markdown structure. Fix minor typos and formatting issues while preserving the original content and meaning.";
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      
      const processedContent = response.choices[0].message.content;
      
      res.json({ processedContent });
    } catch (error) {
      console.error("Error processing content:", error);
      res.status(500).json({ 
        error: "Failed to process content",
        processedContent: req.body.content 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
