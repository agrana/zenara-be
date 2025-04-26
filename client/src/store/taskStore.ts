import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

interface TaskState {
  tasks: Task[];
  nextId: number;
  
  // Actions
  addTask: (title: string) => Task;
  editTask: (id: number, title: string) => void;
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  getTask: (id: number) => Task | undefined;
  clearCompletedTasks: () => void;
  getCompletedCount: () => number;
  getRemainingCount: () => number;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      nextId: 1,
      
      addTask: (title) => {
        const newTask: Task = {
          id: get().nextId,
          title,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask],
          nextId: state.nextId + 1
        }));
        
        return newTask;
      },
      
      editTask: (id, title) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id ? { ...task, title } : task
          )
        }));
      },
      
      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },
      
      toggleTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === id) {
              const completed = !task.completed;
              return {
                ...task,
                completed,
                completedAt: completed ? new Date().toISOString() : null
              };
            }
            return task;
          })
        }));
      },
      
      getTask: (id) => {
        return get().tasks.find(task => task.id === id);
      },
      
      clearCompletedTasks: () => {
        set(state => ({
          tasks: state.tasks.filter(task => !task.completed)
        }));
      },
      
      getCompletedCount: () => {
        return get().tasks.filter(task => task.completed).length;
      },
      
      getRemainingCount: () => {
        return get().tasks.filter(task => !task.completed).length;
      }
    }),
    {
      name: 'serene-start-tasks-storage'
    }
  )
);
