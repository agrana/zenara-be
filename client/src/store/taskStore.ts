import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  user_id: number;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<Task>;
  editTask: (id: number, title: string) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
  clearCompletedTasks: () => Promise<void>;
  getCompletedCount: () => number;
  getRemainingCount: () => number;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tasks: data || [], isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks', isLoading: false });
    }
  },

  addTask: async (title) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const newTask = {
        title,
        completed: false,
        created_at: new Date().toISOString(),
        completed_at: null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        tasks: [data, ...state.tasks],
        isLoading: false
      }));

      return data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add task', isLoading: false });
      throw error;
    }
  },

  editTask: async (id, title) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, title } : task
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to edit task', isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task', isLoading: false });
    }
  },

  toggleTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const task = get().tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');

      const completed = !task.completed;
      const { error } = await supabase
        .from('tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.map(task => {
          if (task.id === id) {
            return {
              ...task,
              completed,
              completed_at: completed ? new Date().toISOString() : null
            };
          }
          return task;
        }),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle task', isLoading: false });
    }
  },

  getTask: (id) => {
    return get().tasks.find(task => task.id === id);
  },

  clearCompletedTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) throw error;

      set(state => ({
        tasks: state.tasks.filter(task => !task.completed),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear completed tasks', isLoading: false });
    }
  },

  getCompletedCount: () => {
    return get().tasks.filter(task => task.completed).length;
  },

  getRemainingCount: () => {
    return get().tasks.filter(task => !task.completed).length;
  }
}));
