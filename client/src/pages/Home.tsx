import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/store/appStore";
import Header from "@/components/Header";
import Quote from "@/components/Quote";
import BackgroundOverlay from "@/components/BackgroundOverlay";
import PomodoroCard from "@/components/PomodoroCard";
import TaskListCard from "@/components/TaskListCard";
import ScratchpadCard from "@/components/ScratchpadCard";

export default function Home() {
  const { darkMode } = useAppStore();
  const { setTheme } = useTheme();
  
  // Sync dark mode with theme system
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <BackgroundOverlay />
      <Header />
      <Quote />
      
      <div className="w-full max-w-6xl px-4 pb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <PomodoroCard />
        <TaskListCard />
        <ScratchpadCard />
      </div>
    </div>
  );
}
