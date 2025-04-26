import { useState } from "react";
import { useTaskStore, type Task } from "@/store/taskStore";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { formatDateRelative, formatTimeSpent } from "@/lib/formatDate";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Check, Clock, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TaskListCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { tasks, addTask, editTask, deleteTask, toggleTask, getCompletedCount, getRemainingCount } = useTaskStore();
  const { getTaskTimeSpent } = usePomodoroStore();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };
  
  const handleEdit = (task: Task) => {
    setEditingTask({ ...task });
    setEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (editingTask && editingTask.title.trim()) {
      editTask(editingTask.id, editingTask.title.trim());
      setEditDialogOpen(false);
      setEditingTask(null);
    }
  };
  
  const handleDelete = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  };
  
  const formatTaskTime = (taskId: number): string => {
    const seconds = getTaskTimeSpent(taskId);
    if (seconds === 0) return "Not started";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
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
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Task List</h2>
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
            <form onSubmit={handleAddTask} className="flex items-center mb-6">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-700"
              />
              <Button type="submit" size="icon" className="ml-2">
                <Plus className="h-5 w-5" />
              </Button>
            </form>
            
            <div className="space-y-3 max-h-[450px] overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No tasks yet. Add your first task above!
                </div>
              ) : (
                tasks
                  .sort((a, b) => {
                    // Sort by completion status (incomplete first)
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    // Then sort by creation date (newest first)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-start p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="ml-3 flex-grow">
                        <p className={`text-slate-800 dark:text-white font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {task.completed
                              ? `Completed: ${formatDateRelative(new Date(task.completedAt!))}`
                              : `Created: ${formatDateRelative(new Date(task.createdAt))}`}
                          </span>
                          
                          {getTaskTimeSpent(task.id) > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="ml-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTaskTime(task.id)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Time spent on this task</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary"
                          onClick={() => handleEdit(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-red-500 transition-colors dark:text-slate-400 dark:hover:text-red-400"
                          onClick={() => handleDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>
            
            <div className="mt-6 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              <span>
                {getCompletedCount()} completed
              </span>
              <span>
                {getRemainingCount()} remaining
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <Input
            value={editingTask?.title || ''}
            onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
            className="mt-2"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
