import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/appStore";
import Header from "@/components/Header";
import Quote from "@/components/Quote";
import BackgroundOverlay from "@/components/BackgroundOverlay";
import PomodoroCard from "@/components/PomodoroCard";
import TaskListCard from "@/components/TaskListCard";
import ScratchpadCard from "@/components/ScratchpadCard";
import AppButton from "@/components/AppButton";

export default function Home() {
  const { darkMode } = useAppStore();
  const { setTheme } = useTheme();
  
  // App visibility states
  const [pomodoroVisible, setPomodoroVisible] = useState(false);
  const [taskListVisible, setTaskListVisible] = useState(false);
  const [scratchpadVisible, setScratchpadVisible] = useState(false);
  
  // Sync dark mode with theme system
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);

  // Direct handlers to open apps
  const openPomodoro = () => setPomodoroVisible(true);
  const openTaskList = () => setTaskListVisible(true);
  const openScratchpad = () => setScratchpadVisible(true);
  
  // Direct handlers to close apps
  const closePomodoro = () => setPomodoroVisible(false);
  const closeTaskList = () => setTaskListVisible(false);
  const closeScratchpad = () => setScratchpadVisible(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between">
      <BackgroundOverlay />
      <Header />
      
      <main className="flex-grow flex items-center justify-center w-full">
        <div className="w-full max-w-7xl px-4 relative">
          {/* Scratchpad button in top right when card is not visible */}
          {!scratchpadVisible && (
            <div className="absolute top-0 right-8 md:right-16">
              <AppButton 
                emoji="📝" 
                label="Scratchpad" 
                onClick={openScratchpad}
                isActive={false} 
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-start gap-6 mt-16">
            {/* Left side - Pomodoro and Tasks */}
            <div className="w-full md:w-1/3 flex flex-col space-y-6">
              {/* App buttons when cards are not visible - stacked vertically */}
              {!pomodoroVisible && !taskListVisible && (
                <div className="flex flex-col space-y-4 mb-4">
                  <AppButton 
                    emoji="🍅" 
                    label="Pomodoro Timer" 
                    onClick={openPomodoro}
                    isActive={false} 
                  />
                  <AppButton 
                    emoji="✓" 
                    label="Task List" 
                    onClick={openTaskList}
                    isActive={false} 
                  />
                </div>
              )}
              
              {/* Pomodoro card */}
              {pomodoroVisible && (
                <div className="relative">
                  <button 
                    onClick={closePomodoro}
                    className="absolute top-3 right-3 z-10 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Close
                  </button>
                  <PomodoroCard />
                </div>
              )}
              
              {/* Task list card */}
              {taskListVisible && (
                <div className="relative">
                  <button 
                    onClick={closeTaskList}
                    className="absolute top-3 right-3 z-10 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Close
                  </button>
                  <TaskListCard />
                </div>
              )}
            </div>
            
            {/* Right side - Scratchpad */}
            <div className="w-full md:w-2/3 flex flex-col">
              {/* Scratchpad card */}
              {scratchpadVisible && (
                <div className="relative">
                  <button 
                    onClick={closeScratchpad}
                    className="absolute top-3 right-3 z-10 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Close
                  </button>
                  <ScratchpadCard />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with quote */}
      <footer className="w-full mt-auto">
        <Quote />
      </footer>
    </div>
  );
}
