import { 
  type User, type InsertUser,
  type Task, type InsertTask,
  type PomodoroSession, type InsertPomodoroSession,
  type Scratchpad, type InsertScratchpad,
  type Settings, type InsertSettings
} from "@shared/schema";
import { supabase } from "./db";

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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Task operations
  async getTasks(userId?: number): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*');
    
    if (userId) {
      query = query.eq('userId', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTask(id: number): Promise<Task | undefined> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const updateData = {
      ...data,
      ...(data.completed && !data.completedAt ? { completedAt: new Date().toISOString() } : {})
    };

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Pomodoro operations
  async getPomodoroSessions(userId?: number, taskId?: number): Promise<PomodoroSession[]> {
    let query = supabase
      .from('pomodoro_sessions')
      .select('*');
    
    if (userId && taskId) {
      query = query.eq('userId', userId).eq('taskId', taskId);
    } else if (userId) {
      query = query.eq('userId', userId);
    } else if (taskId) {
      query = query.eq('taskId', taskId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createPomodoroSession(session: InsertPomodoroSession): Promise<PomodoroSession> {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePomodoroSession(id: number, data: Partial<PomodoroSession>): Promise<PomodoroSession | undefined> {
    const { data: updatedSession, error } = await supabase
      .from('pomodoro_sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedSession || undefined;
  }

  // Scratchpad operations
  async getScratchpad(userId: number): Promise<Scratchpad | undefined> {
    const { data, error } = await supabase
      .from('scratchpads')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async createOrUpdateScratchpad(data: InsertScratchpad): Promise<Scratchpad> {
    if (data.userId) {
      const existing = await this.getScratchpad(data.userId);
      
      if (existing) {
        const { data: updated, error } = await supabase
          .from('scratchpads')
          .update({
            ...data,
            updatedAt: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      }
    }
    
    const { data: newPad, error } = await supabase
      .from('scratchpads')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newPad;
  }

  // Settings operations
  async getSettings(userId: number): Promise<Settings | undefined> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async createOrUpdateSettings(data: InsertSettings): Promise<Settings> {
    if (data.userId) {
      const existing = await this.getSettings(data.userId);
      
      if (existing) {
        const { data: updated, error } = await supabase
          .from('settings')
          .update(data)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      }
    }
    
    const { data: newSettings, error } = await supabase
      .from('settings')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newSettings;
  }
}

export const storage = new DatabaseStorage();
