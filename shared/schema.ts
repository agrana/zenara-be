// Types for the database schema
export interface User {
  id: number;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertTask {
  userId: number;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface PomodoroSession {
  id: number;
  userId: number;
  taskId?: number;
  duration: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertPomodoroSession {
  userId: number;
  taskId?: number;
  duration: number;
  completed?: boolean;
}

export interface Scratchpad {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsertScratchpad {
  userId: number;
  content: string;
}

export interface Settings {
  id: number;
  userId: number;
  theme: string;
  notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsertSettings {
  userId: number;
  theme?: string;
  notifications?: boolean;
}
