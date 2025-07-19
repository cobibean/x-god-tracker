'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useConfigType } from '@/lib/config-context';

export function DailyChecklistCard() {
  // Get checklist configuration
  const checklistConfig = useConfigType('checklist');
  const { tasks, categories } = checklistConfig;

  // State for completed tasks
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('completed-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedTasks(new Set(parsed));
      } catch (error) {
        console.error('Error loading completed tasks:', error);
      }
    }
  }, []);

  // Save completed tasks to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completed-tasks', JSON.stringify(Array.from(completedTasks)));
  }, [completedTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const updated = new Set(prev);
      if (updated.has(taskId)) {
        updated.delete(taskId);
      } else {
        updated.add(taskId);
      }
      return updated;
    });
  };

  // Filter enabled tasks and sort by order
  const enabledTasks = tasks
    .filter(task => task.enabled)
    .sort((a, b) => a.order - b.order);

  const completedCount = enabledTasks.filter(task => completedTasks.has(task.id)).length;
  const progressPercentage = enabledTasks.length > 0 ? (completedCount / enabledTasks.length) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 row-span-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">Daily Checklist</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-card-foreground">
            {completedCount}/{enabledTasks.length}
          </div>
          <div className="text-sm text-muted-foreground">tasks completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-card-foreground">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm text-card-foreground font-medium">
            {progressPercentage === 100 
              ? "Perfect execution!" 
              : progressPercentage >= 80 
                ? "Great progress!" 
                : progressPercentage >= 60 
                  ? "Keep pushing" 
                  : "Let's get started"}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {enabledTasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          const category = categories[task.category];
          
          return (
            <div
              key={task.id}
              className={`group relative flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:border-primary/50 cursor-pointer ${
                isCompleted
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-card border-border hover:bg-accent/50'
              }`}
              onClick={() => toggleTask(task.id)}
            >
              {/* Custom Checkbox */}
              <div className={`relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
                isCompleted
                  ? 'bg-primary border-primary scale-110'
                  : 'border-border group-hover:border-primary/50'
              }`}>
                {isCompleted && (
                  <Check className="w-3 h-3 text-primary-foreground absolute top-0.5 left-0.5 animate-in fade-in zoom-in duration-200" />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-all duration-200 ${
                  isCompleted 
                    ? 'text-muted-foreground line-through' 
                    : 'text-card-foreground group-hover:text-primary'
                }`}>
                  {task.text}
                </p>
                
                {/* Category Badge */}
                {category && (
                  <div className={`inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-${category.bgColor} text-${category.color} border border-${category.color}/20`}>
                    {category.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {enabledTasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tasks configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the admin panel to add tasks
          </p>
        </div>
      )}
    </div>
  );
} 