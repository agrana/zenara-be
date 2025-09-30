import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ProcessingService } from "./processingService";
import { PromptService } from "./promptService";
import { NoteVersionService } from "./noteVersionService";
import OpenAI from "openai";
import { z } from "zod";
import type { InsertTask, InsertPomodoroSession, InsertScratchpad, InsertSettings } from "@shared/schema";

// Initialize OpenAI client with API key fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

// Define Zod schemas for validation
const insertTaskSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().optional()
}) satisfies z.ZodType<InsertTask>;

const insertPomodoroSessionSchema = z.object({
  userId: z.number(),
  taskId: z.number().optional(),
  duration: z.number(),
  completed: z.boolean().optional()
}) satisfies z.ZodType<InsertPomodoroSession>;

const insertScratchpadSchema = z.object({
  userId: z.number(),
  content: z.string()
}) satisfies z.ZodType<InsertScratchpad>;

const insertSettingsSchema = z.object({
  userId: z.number(),
  theme: z.string().optional(),
  notifications: z.boolean().optional()
}) satisfies z.ZodType<InsertSettings>;

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
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

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

  // Note Versions API routes
  app.get('/api/note-versions/:noteId', async (req, res) => {
    try {
      const { noteId } = req.params;
      const { userId, limit } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const versionService = NoteVersionService.getInstance();
      const versions = limit
        ? await versionService.getLatestVersions(noteId, userId as string, parseInt(limit as string))
        : await versionService.getVersionsByNoteId(noteId, userId as string);

      res.json(versions);
    } catch (error) {
      console.error('Error fetching note versions:', error);
      res.status(500).json({ error: 'Failed to fetch note versions' });
    }
  });

  app.get('/api/note-versions/version/:versionId', async (req, res) => {
    try {
      const { versionId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const versionService = NoteVersionService.getInstance();
      const version = await versionService.getVersionById(versionId, userId as string);

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json(version);
    } catch (error) {
      console.error('Error fetching note version:', error);
      res.status(500).json({ error: 'Failed to fetch note version' });
    }
  });

  app.post('/api/note-versions', async (req, res) => {
    try {
      const { noteId, userId, title, content, format, isProcessed, processingMetadata } = req.body;

      if (!noteId || !userId || !title || !content || !format) {
        return res.status(400).json({ error: 'noteId, userId, title, content, and format are required' });
      }

      const versionService = NoteVersionService.getInstance();
      const version = await versionService.createVersion({
        noteId,
        userId,
        title,
        content,
        format,
        isProcessed,
        processingMetadata
      });

      res.status(201).json(version);
    } catch (error) {
      console.error('Error creating note version:', error);
      res.status(500).json({ error: 'Failed to create note version' });
    }
  });

  app.delete('/api/note-versions/:versionId', async (req, res) => {
    try {
      const { versionId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const versionService = NoteVersionService.getInstance();
      await versionService.deleteVersion(versionId, userId as string);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting note version:', error);
      res.status(500).json({ error: 'Failed to delete note version' });
    }
  });

  app.delete('/api/note-versions/note/:noteId', async (req, res) => {
    try {
      const { noteId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const versionService = NoteVersionService.getInstance();
      await versionService.deleteVersionsByNoteId(noteId, userId as string);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting note versions:', error);
      res.status(500).json({ error: 'Failed to delete note versions' });
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

  // Note processing endpoints
  app.post('/api/process-note', async (req, res) => {
    try {
      const { content, promptId, promptType, customPrompt, userId } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      const processingService = ProcessingService.getInstance();
      const result = await processingService.processNote(content, {
        promptId,
        promptType: promptType || 'default',
        customPrompt,
        userId
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error processing note:', error);
      res.status(500).json({ error: 'Failed to process note' });
    }
  });

  // Streaming note processing endpoint
  app.post('/api/process-note-stream', async (req, res) => {
    try {
      const { content, promptId, promptType, customPrompt, userId } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      const processingService = ProcessingService.getInstance();
      const stream = await processingService.processNoteStream(content, {
        promptId,
        promptType: promptType || 'default',
        customPrompt,
        userId
      });

      // Pipe the stream to the response
      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } finally {
        reader.releaseLock();
        res.end();
      }
    } catch (error) {
      console.error('Error in streaming processing:', error);
      res.status(500).json({ error: 'Failed to process note' });
    }
  });

  // Get available prompts
  app.get('/api/prompts', async (req, res) => {
    try {
      const processingService = ProcessingService.getInstance();
      const prompts = processingService.getAvailablePrompts();
      res.json(prompts);
    } catch (error) {
      console.error('Error getting prompts:', error);
      res.status(500).json({ error: 'Failed to get prompts' });
    }
  });

  // Prompt management endpoints
  app.get('/api/prompts/user/:userId?', async (req, res) => {
    try {
      const { userId } = req.params;
      const promptService = PromptService.getInstance();
      const prompts = await promptService.getUserPrompts(userId);
      res.json(prompts);
    } catch (error) {
      console.error('Error getting user prompts:', error);
      res.status(500).json({ error: 'Failed to get user prompts' });
    }
  });

  app.get('/api/prompts/template/:templateType', async (req, res) => {
    try {
      const { templateType } = req.params;
      const { userId } = req.query;
      const promptService = PromptService.getInstance();
      const prompts = await promptService.getPromptsByType(templateType, userId as string);
      res.json(prompts);
    } catch (error) {
      console.error('Error getting prompts by type:', error);
      res.status(500).json({ error: 'Failed to get prompts by type' });
    }
  });

  app.get('/api/prompts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const promptService = PromptService.getInstance();
      const prompt = await promptService.getPromptById(id);
      if (prompt) {
        res.json(prompt);
      } else {
        res.status(404).json({ error: 'Prompt not found' });
      }
    } catch (error) {
      console.error('Error getting prompt by ID:', error);
      res.status(500).json({ error: 'Failed to get prompt' });
    }
  });

  app.post('/api/prompts', async (req, res) => {
    try {
      const { userId, name, templateType, promptText, isDefault } = req.body;

      if (!name || !templateType || !promptText) {
        return res.status(400).json({ error: 'Name, templateType, and promptText are required' });
      }

      const promptService = PromptService.getInstance();
      const prompt = await promptService.createPrompt({
        userId,
        name,
        templateType,
        promptText,
        isDefault
      });

      res.status(201).json(prompt);
    } catch (error) {
      console.error('Error creating prompt:', error);
      res.status(500).json({ error: 'Failed to create prompt' });
    }
  });

  app.put('/api/prompts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, promptText, isActive } = req.body;

      const promptService = PromptService.getInstance();
      const prompt = await promptService.updatePrompt(id, {
        name,
        promptText,
        isActive
      });

      res.json(prompt);
    } catch (error) {
      console.error('Error updating prompt:', error);
      res.status(500).json({ error: 'Failed to update prompt' });
    }
  });

  app.delete('/api/prompts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const promptService = PromptService.getInstance();
      await promptService.deletePrompt(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      res.status(500).json({ error: 'Failed to delete prompt' });
    }
  });

  app.get('/api/prompts/templates/types', async (req, res) => {
    try {
      const promptService = PromptService.getInstance();
      const templateTypes = promptService.getTemplateTypes();
      res.json(templateTypes);
    } catch (error) {
      console.error('Error getting template types:', error);
      res.status(500).json({ error: 'Failed to get template types' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
