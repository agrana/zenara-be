import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (basic schema for future extension)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tasks model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Pomodoro sessions model
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationSeconds: integer("duration_seconds").notNull(),
  completed: boolean("completed").notNull().default(false),
});

// Scratchpad model
export const scratchpads = pgTable("scratchpads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  format: text("format").notNull().default("default"),
  processedContent: text("processed_content"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  darkMode: boolean("dark_mode").notNull().default(false),
  backgroundRotation: text("background_rotation").notNull().default("daily"),
  selectedCategory: text("selected_category"),
  quoteRotation: text("quote_rotation").notNull().default("daily"),
  workDuration: integer("work_duration").notNull().default(25),
  breakDuration: integer("break_duration").notNull().default(5),
  backgroundSound: text("background_sound").notNull().default("none"),
  alertSound: text("alert_sound").notNull().default("bell"),
  dailyGoal: integer("daily_goal").notNull().default(4),
});

// Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).pick({
  userId: true,
  taskId: true,
  startTime: true,
  durationSeconds: true,
});

export const insertScratchpadSchema = createInsertSchema(scratchpads).pick({
  userId: true,
  content: true,
  format: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  darkMode: true,
  backgroundRotation: true,
  selectedCategory: true,
  quoteRotation: true,
  workDuration: true,
  breakDuration: true,
  backgroundSound: true,
  alertSound: true,
  dailyGoal: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;

export type InsertScratchpad = z.infer<typeof insertScratchpadSchema>;
export type Scratchpad = typeof scratchpads.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
