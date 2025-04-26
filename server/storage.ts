import { 
  users, tasks, pomodoroSessions, scratchpads, settings,
  type User, type InsertUser,
  type Task, type InsertTask,
  type PomodoroSession, type InsertPomodoroSession,
  type Scratchpad, type InsertScratchpad,
  type Settings, type InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task operations
  getTasks(userId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Pomodoro operations
  getPomodoroSessions(userId?: number, taskId?: number): Promise<PomodoroSession[]>;
  createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession>;
  updatePomodoroSession(id: number, data: Partial<PomodoroSession>): Promise<PomodoroSession | undefined>;

  // Scratchpad operations
  getScratchpad(userId: number): Promise<Scratchpad | undefined>;
  createOrUpdateScratchpad(data: InsertScratchpad): Promise<Scratchpad>;

  // Settings operations
  getSettings(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(data: InsertSettings): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId?: number): Promise<Task[]> {
    if (userId) {
      return db.select().from(tasks).where(eq(tasks.userId, userId));
    }
    return db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...data,
        // If task is being marked as completed, set completedAt
        ...(data.completed && !data.completedAt ? { completedAt: new Date() } : {})
      })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deletedTask;
  }

  // Pomodoro operations
  async getPomodoroSessions(userId?: number, taskId?: number): Promise<PomodoroSession[]> {
    if (userId && taskId) {
      return db
        .select()
        .from(pomodoroSessions)
        .where(eq(pomodoroSessions.userId, userId))
        .andWhere(eq(pomodoroSessions.taskId, taskId));
    } else if (userId) {
      return db
        .select()
        .from(pomodoroSessions)
        .where(eq(pomodoroSessions.userId, userId));
    } else if (taskId) {
      return db
        .select()
        .from(pomodoroSessions)
        .where(eq(pomodoroSessions.taskId, taskId));
    }
    return db.select().from(pomodoroSessions);
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const [newSession] = await db
      .insert(pomodoroSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updatePomodoroSession(id: number, data: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const [updatedSession] = await db
      .update(pomodoroSessions)
      .set(data)
      .where(eq(pomodoroSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  // Scratchpad operations
  async getScratchpad(userId: number): Promise<Scratchpad | undefined> {
    const [pad] = await db
      .select()
      .from(scratchpads)
      .where(eq(scratchpads.userId, userId));
    return pad || undefined;
  }

  async createOrUpdateScratchpad(data: InsertScratchpad): Promise<Scratchpad> {
    // Check if scratchpad exists
    if (data.userId) {
      const existing = await this.getScratchpad(data.userId);
      
      if (existing) {
        const [updated] = await db
          .update(scratchpads)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(scratchpads.id, existing.id))
          .returning();
        return updated;
      }
    }
    
    const [newPad] = await db
      .insert(scratchpads)
      .values(data)
      .returning();
    return newPad;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    const [userSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId));
    return userSettings || undefined;
  }

  async createOrUpdateSettings(data: InsertSettings): Promise<Settings> {
    // Check if settings exist
    const existing = await this.getSettings(data.userId);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set(data)
        .where(eq(settings.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newSettings] = await db
      .insert(settings)
      .values(data)
      .returning();
    return newSettings;
  }
}

export const storage = new DatabaseStorage();
