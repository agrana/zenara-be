import { useState, useEffect } from "react";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { useTaskStore, type Task } from "@/store/taskStore";
import { formatDuration } from "@/lib/formatDate";
import { audioManager, type SoundType, type AlertSound } from "@/lib/audioManager";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Volume2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function PomodoroCard() {
  const [isOpen, setIsOpen] = useState(true); // Start open by default
  const [isSelectTaskOpen, setIsSelectTaskOpen] = useState(false);
  
  const {
    workDuration,
    breakDuration,
    currentTaskId,
    isRunning,
    isPaused,
    isBreak,
    remainingTime,
    sessionsCompleted,
    dailyGoal,
    backgroundSound,
    alertSound,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tick,
    setWorkDuration,
    setBreakDuration,
    setCurrentTaskId,
    setBackgroundSound,
    setAlertSound,
  } = usePomodoroStore();
  
  const { tasks } = useTaskStore();
  
  const activeTask = tasks.find(task => task.id === currentTaskId);
  
  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        tick();
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);
  
  // Format remaining time
  const timeDisplay = formatDuration(remainingTime);
  
  // Progress calculation
  const totalDuration = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
  
  const handleStartPause = () => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      startTimer();
    }
  };
  
  const handleReset = () => {
    resetTimer();
  };
  
  const getActiveTasks = () => {
    return tasks.filter(task => !task.completed);
  };
  
  return (
    <>
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="glass rounded-xl shadow-xl overflow-hidden transition-all duration-300"
      >
       <CollapsibleTrigger className="w-full">
          <CardHeader className="p-4 bg-white/20 dark:bg-slate-800/20 cursor-pointer">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pomodoro Timer</h2>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-slate-800 dark:text-white" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-800 dark:text-white" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger> 
        
        <CollapsibleContent>
          <CardContent className="bg-white/80 dark:bg-slate-800/80 p-6">
            <div className="flex flex-col items-center">
              <div className="relative" style={{ width: "200px", height: "200px" }}>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-slate-200 dark:text-slate-700" 
                    strokeWidth="4" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="42" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className="progress-ring__circle text-primary" 
                    strokeWidth="4" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="42" 
                    cx="50" 
                    cy="50" 
                    strokeDasharray="263.8" 
                    strokeDashoffset={263.8 - (263.8 * progress) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {timeDisplay}
                  </span>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {isBreak ? "Break" : "Focus"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button 
                  className={isRunning ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600" : "bg-primary text-white hover:bg-blue-600"}
                  onClick={handleStartPause}
                >
                  {isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  disabled={!isRunning && !isPaused}
                >
                  Reset
                </Button>
              </div>
              
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Active Task</span>
                  <Button 
                    variant="link" 
                    className="text-xs text-primary hover:text-blue-700 dark:hover:text-blue-400 p-0"
                    onClick={() => setIsSelectTaskOpen(true)}
                  >
                    Change
                  </Button>
                </div>
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <p className="text-slate-800 dark:text-white font-medium truncate">
                    {activeTask ? activeTask.title : "No task selected"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 w-full grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Work</span>
                  <Select 
                    value={workDuration.toString()} 
                    onValueChange={(value) => setWorkDuration(parseInt(value))}
                    disabled={isRunning || isPaused}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="25 min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="25">25 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Break</span>
                  <Select 
                    value={breakDuration.toString()} 
                    onValueChange={(value) => setBreakDuration(parseInt(value))}
                    disabled={isRunning || isPaused}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="5 min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Background Sound</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      if (backgroundSound !== 'none' && isRunning) {
                        audioManager.playSound(backgroundSound);
                      }
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <Select 
                  value={backgroundSound} 
                  onValueChange={(value) => setBackgroundSound(value as SoundType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="crowd-talking">Crowd Talking</SelectItem>
                    <SelectItem value="ocean-wave-1">Ocean Wave (Calm)</SelectItem>
                    <SelectItem value="ocean-wave-2">Ocean Wave (Strong)</SelectItem>
                    <SelectItem value="rain-07">Gentle Rain</SelectItem>
                    <SelectItem value="white-noise">White Noise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Alert Sound</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => audioManager.playAlert(alertSound)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <Select 
                  value={alertSound} 
                  onValueChange={(value) => setAlertSound(value as AlertSound)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bell" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell-ring-01">Bell Ring (Single)</SelectItem>
                    <SelectItem value="bell-ringing-03a">Bell Ring (Triple)</SelectItem>
                    <SelectItem value="bell-ringing-05">Bell Ring (Soft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Today's Progress</span>
                </div>
                <div className="flex items-center">
                  <Progress value={(sessionsCompleted / dailyGoal) * 100} className="flex-grow h-2" />
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {sessionsCompleted}/{dailyGoal}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Task Selection Dialog */}
      <Dialog open={isSelectTaskOpen} onOpenChange={setIsSelectTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Task</DialogTitle>
            <DialogDescription>
              Choose a task to work on during your Pomodoro session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {getActiveTasks().length > 0 ? (
              getActiveTasks().map((task) => (
                <div 
                  key={task.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    task.id === currentTaskId 
                      ? "bg-primary/10 border border-primary" 
                      : "bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                  onClick={() => setCurrentTaskId(task.id)}
                >
                  <p className="font-medium">{task.title}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-slate-500 dark:text-slate-400">
                No active tasks available. Add a task first!
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentTaskId(null)}>
              Clear Selection
            </Button>
            <Button onClick={() => setIsSelectTaskOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
