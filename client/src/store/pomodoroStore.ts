import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioManager, type SoundType, type AlertSound } from '@/lib/audioManager';

interface PomodoroSession {
  taskId: number | null;
  startTime: string;
  endTime: string | null;
  duration: number;
  completed: boolean;
}

interface PomodoroState {
  // Timer settings
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  currentTaskId: number | null;
  isRunning: boolean;
  isPaused: boolean;
  isBreak: boolean;
  remainingTime: number; // in seconds
  sessionsCompleted: number;
  dailyGoal: number;
  backgroundSound: SoundType;
  alertSound: AlertSound;
  sessions: PomodoroSession[];
  
  // Methods
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  completeSession: () => void;
  skipBreak: () => void;
  tick: () => void;
  
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setCurrentTaskId: (taskId: number | null) => void;
  setBackgroundSound: (sound: SoundType) => void;
  setAlertSound: (sound: AlertSound) => void;
  setDailyGoal: (goal: number) => void;
  
  resetDailyProgress: () => void;
  getTaskTimeSpent: (taskId: number) => number; // in seconds
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      workDuration: 25,
      breakDuration: 5,
      currentTaskId: null,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      remainingTime: 25 * 60, // 25 minutes in seconds
      sessionsCompleted: 0,
      dailyGoal: 4,
      backgroundSound: 'none',
      alertSound: 'bell',
      sessions: [],
      
      startTimer: () => {
        const { isBreak, workDuration, breakDuration, backgroundSound } = get();
        const duration = isBreak ? breakDuration : workDuration;
        
        set({
          isRunning: true,
          isPaused: false,
          remainingTime: duration * 60
        });
        
        // Start playing the background sound
        if (backgroundSound !== 'none') {
          audioManager.playSound(backgroundSound);
        }
        
        // Record start time for new session if not in break
        if (!isBreak && get().currentTaskId !== null) {
          const newSession: PomodoroSession = {
            taskId: get().currentTaskId,
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            completed: false
          };
          
          set(state => ({
            sessions: [...state.sessions, newSession]
          }));
        }
      },
      
      pauseTimer: () => {
        audioManager.stopSound();
        set({ isRunning: false, isPaused: true });
      },
      
      resumeTimer: () => {
        const { backgroundSound } = get();
        
        set({ isRunning: true, isPaused: false });
        
        // Resume background sound
        if (backgroundSound !== 'none') {
          audioManager.playSound(backgroundSound);
        }
      },
      
      resetTimer: () => {
        const { workDuration } = get();
        audioManager.stopSound();
        
        set({
          isRunning: false,
          isPaused: false,
          isBreak: false,
          remainingTime: workDuration * 60
        });
      },
      
      completeSession: () => {
        const { isBreak, sessionsCompleted, alertSound } = get();
        
        // Play alert sound
        audioManager.playAlert(alertSound);
        
        // Stop background sound
        audioManager.stopSound();
        
        if (isBreak) {
          // After break, go back to work mode
          set(state => ({
            isRunning: false,
            isPaused: false,
            isBreak: false,
            remainingTime: state.workDuration * 60
          }));
        } else {
          // After work, go to break mode and increment completed sessions
          // Also update the current session as completed
          
          if (get().sessions.length > 0) {
            const sessions = [...get().sessions];
            const currentSession = sessions[sessions.length - 1];
            
            if (currentSession && !currentSession.endTime) {
              currentSession.endTime = new Date().toISOString();
              currentSession.duration = get().workDuration * 60;
              currentSession.completed = true;
              
              set({ sessions });
            }
          }
          
          set(state => ({
            isRunning: false,
            isPaused: false,
            isBreak: true,
            remainingTime: state.breakDuration * 60,
            sessionsCompleted: sessionsCompleted + 1
          }));
        }
      },
      
      skipBreak: () => {
        const { workDuration } = get();
        
        set({
          isRunning: false,
          isPaused: false,
          isBreak: false,
          remainingTime: workDuration * 60
        });
      },
      
      tick: () => {
        const { remainingTime, isRunning } = get();
        
        if (isRunning && remainingTime > 0) {
          set({ remainingTime: remainingTime - 1 });
        }
        
        if (isRunning && remainingTime <= 0) {
          get().completeSession();
        }
      },
      
      setWorkDuration: (minutes) => {
        set(state => ({
          workDuration: minutes,
          // Update remaining time only if not in break mode and not running
          remainingTime: (!state.isBreak && !state.isRunning) ? minutes * 60 : state.remainingTime
        }));
      },
      
      setBreakDuration: (minutes) => {
        set(state => ({
          breakDuration: minutes,
          // Update remaining time only if in break mode and not running
          remainingTime: (state.isBreak && !state.isRunning) ? minutes * 60 : state.remainingTime
        }));
      },
      
      setCurrentTaskId: (taskId) => set({ currentTaskId: taskId }),
      
      setBackgroundSound: (sound) => {
        const { isRunning } = get();
        
        set({ backgroundSound: sound });
        
        // Update the playing sound if timer is running
        if (isRunning) {
          audioManager.stopSound();
          if (sound !== 'none') {
            audioManager.playSound(sound);
          }
        }
      },
      
      setAlertSound: (sound) => set({ alertSound: sound }),
      
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      
      resetDailyProgress: () => set({ sessionsCompleted: 0 }),
      
      getTaskTimeSpent: (taskId) => {
        const { sessions } = get();
        const taskSessions = sessions.filter(
          session => session.taskId === taskId && session.completed
        );
        
        return taskSessions.reduce((total, session) => total + session.duration, 0);
      }
    }),
    {
      name: 'serene-start-pomodoro-storage'
    }
  )
);
