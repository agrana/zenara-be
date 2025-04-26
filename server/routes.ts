import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import { insertTaskSchema, insertPomodoroSessionSchema, insertScratchpadSchema, insertSettingsSchema } from "@shared/schema";

// Initialize OpenAI client with API key fallback
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
});

// Helper function to validate request body
function validateBody<T>(schema: z.ZodType<T>, body: any): { success: true, data: T } | { success: false, error: string } {
  try {
    const result = schema.parse(body);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => `${e.path}: ${e.message}`).join(', ') };
    }
    return { success: false, error: 'Invalid request data' };
  }
}

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

  // Task API routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const validation = validateBody(insertTaskSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      
      const task = await storage.createTask(validation.data);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Pomodoro sessions API routes
  app.get('/api/pomodoro-sessions', async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      const taskId = req.query.taskId ? Number(req.query.taskId) : undefined;
      const sessions = await storage.getPomodoroSessions(userId, taskId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching pomodoro sessions:', error);
      res.status(500).json({ error: 'Failed to fetch pomodoro sessions' });
    }
  });

  app.post('/api/pomodoro-sessions', async (req, res) => {
    try {
      const validation = validateBody(insertPomodoroSessionSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      
      const session = await storage.createPomodoroSession(validation.data);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating pomodoro session:', error);
      res.status(500).json({ error: 'Failed to create pomodoro session' });
    }
  });

  app.patch('/api/pomodoro-sessions/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const session = await storage.updatePomodoroSession(id, req.body);
      if (!session) {
        return res.status(404).json({ error: 'Pomodoro session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error('Error updating pomodoro session:', error);
      res.status(500).json({ error: 'Failed to update pomodoro session' });
    }
  });

  // Scratchpad API routes
  app.get('/api/scratchpad/:userId', async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const scratchpad = await storage.getScratchpad(userId);
      if (!scratchpad) {
        return res.status(404).json({ error: 'Scratchpad not found' });
      }
      res.json(scratchpad);
    } catch (error) {
      console.error('Error fetching scratchpad:', error);
      res.status(500).json({ error: 'Failed to fetch scratchpad' });
    }
  });

  app.post('/api/scratchpad', async (req, res) => {
    try {
      const validation = validateBody(insertScratchpadSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      
      const scratchpad = await storage.createOrUpdateScratchpad(validation.data);
      res.status(201).json(scratchpad);
    } catch (error) {
      console.error('Error saving scratchpad:', error);
      res.status(500).json({ error: 'Failed to save scratchpad' });
    }
  });

  // Settings API routes
  app.get('/api/settings/:userId', async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const settings = await storage.getSettings(userId);
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const validation = validateBody(insertSettingsSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      
      const settings = await storage.createOrUpdateSettings(validation.data);
      res.status(201).json(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
