'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useConfigType } from '@/lib/config-context';

interface TimerState {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
}

export function OperatingRhythmCard() {
  // Get rhythm configuration
  const config = useConfigType('rhythm');
  const blocks = config?.blocks || [];

  // State for timers
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  
  // Audio management
  const [audioFiles, setAudioFiles] = useState<string[]>([]);
  const audioFilesRef = useRef<string[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio control functions
  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  }, []);

  const playRandomAlarm = useCallback(() => {
    // Stop any currently playing audio
    stopCurrentAudio();
    
    const currentAudioFiles = audioFilesRef.current;
    
    if (currentAudioFiles.length === 0) {
      return;
    }

    try {
      // Pick a random audio file
      const randomFile = currentAudioFiles[Math.floor(Math.random() * currentAudioFiles.length)];
      
      const audio = new Audio(randomFile);
      audio.volume = 0.7;
      currentAudioRef.current = audio;
      
      // Clean up reference when audio ends
      audio.addEventListener('ended', () => {
        currentAudioRef.current = null;
      });
      
      audio.addEventListener('error', () => {
        currentAudioRef.current = null;
      });
      
      audio.play().catch(() => {
        currentAudioRef.current = null;
      });
    } catch (error) {
      // Silent fail - audio not supported
    }
  }, [stopCurrentAudio]);

  // Update audio files ref whenever state changes
  useEffect(() => {
    audioFilesRef.current = audioFiles;
  }, [audioFiles]);

  // Load available audio files on mount
  useEffect(() => {
    fetch('/api/beats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAudioFiles(data.files);
        }
      })
      .catch(error => {
        console.log('Failed to fetch audio files:', error);
      });
  }, []);

  // Filter enabled blocks and sort by order - memoized to prevent infinite re-renders
  const enabledBlocks = useMemo(() => 
    blocks
      .filter(block => block.enabled)
      .sort((a, b) => a.order - b.order),
    [blocks]
  );

  // Initialize timers for enabled blocks
  useEffect(() => {
    const initialTimers: Record<string, TimerState> = {};
    enabledBlocks.forEach(block => {
      initialTimers[block.id] = {
        isActive: false,
        timeRemaining: block.duration * 60, // Convert minutes to seconds
        totalTime: block.duration * 60,
      };
    });
    setTimers(initialTimers);
  }, [enabledBlocks]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        let hasActiveTimer = false;

        Object.keys(updated).forEach(blockId => {
          const timer = updated[blockId];
          if (timer && timer.isActive && timer.timeRemaining > 0) {
            updated[blockId] = {
              ...timer,
              timeRemaining: timer.timeRemaining - 1,
            };
            hasActiveTimer = true;
          } else if (timer && timer.isActive && timer.timeRemaining <= 0) {
            // Timer completed
            updated[blockId] = {
              ...timer,
              isActive: false,
            };
            
            // Play random alarm sound
            playRandomAlarm();
            
            // Show browser notification
            if ('Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification(`Timer completed!`, {
                  body: `Time to move to the next block`,
                  icon: '/favicon.ico',
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification(`Timer completed!`, {
                      body: `Time to move to the next block`,
                      icon: '/favicon.ico',
                    });
                  }
                });
              }
            }
          }
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimer = useCallback((blockId: string) => {
    // Stop any playing audio when toggling timers
    stopCurrentAudio();
    
    setTimers(prev => {
      const currentTimer = prev[blockId];
      if (!currentTimer) {
        return prev;
      }
      
      return {
        ...prev,
        [blockId]: {
          ...currentTimer,
          isActive: !currentTimer.isActive,
        },
      };
    });
  }, [stopCurrentAudio]);

  const resetTimer = useCallback((blockId: string) => {
    // Stop any playing audio when resetting timer
    stopCurrentAudio();
    
    setTimers(prev => {
      const currentTimer = prev[blockId];
      if (!currentTimer) return prev;
      
      return {
        ...prev,
        [blockId]: {
          ...currentTimer,
          isActive: false,
          timeRemaining: currentTimer.totalTime,
        },
      };
    });
  }, [stopCurrentAudio]);

  const stopAllTimers = useCallback(() => {
    // Stop any playing audio when stopping all timers
    stopCurrentAudio();
    
    setTimers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(blockId => {
        updated[blockId] = {
          ...updated[blockId],
          isActive: false,
        };
      });
      return updated;
    });
  }, [stopCurrentAudio]);

  const resetAllTimers = useCallback(() => {
    // Stop any playing audio when resetting all timers
    stopCurrentAudio();
    
    setTimers(prev => {
      const resetTimers: Record<string, TimerState> = {};
      Object.keys(prev).forEach(blockId => {
        const block = enabledBlocks.find(b => b.id === blockId);
        if (block) {
          resetTimers[blockId] = {
            isActive: false,
            timeRemaining: block.duration * 60,
            totalTime: block.duration * 60,
          };
        }
      });
      return resetTimers;
    });
  }, [enabledBlocks, stopCurrentAudio]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (timer: TimerState): number => {
    if (timer.totalTime === 0) return 0;
    return ((timer.totalTime - timer.timeRemaining) / timer.totalTime) * 100;
  };

  const hasActiveTimers = Object.values(timers).some(timer => timer.isActive);

  return (
    <div className="bg-card border border-border rounded-lg p-6 row-span-3">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">Operating Rhythm</h2>
        <div className="flex space-x-2">
          {hasActiveTimers && (
            <button
              onClick={stopAllTimers}
              className="px-3 py-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md hover:bg-destructive/20 transition-colors"
            >
              Stop All
            </button>
          )}
          <button
            onClick={resetAllTimers}
            className="px-3 py-1 text-xs bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Timer Blocks */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {enabledBlocks.map((block) => {
          const timer = timers[block.id];
          if (!timer) return null;

          const isActive = timer.isActive;
          const isCompleted = !isActive && timer.timeRemaining === 0;
          const progress = getProgressPercentage(timer);

          return (
            <div
              key={block.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isActive
                  ? 'border-primary/50 bg-primary/5'
                  : isCompleted
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{block.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{block.name}</h3>
                    <p className="text-sm text-muted-foreground">{block.duration} minutes</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`text-xl font-mono font-bold ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-card-foreground'
                  }`}>
                    {formatTime(timer.timeRemaining)}
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleTimer(block.id)}
                      className={`p-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => resetTimer(block.id)}
                      className="p-2 rounded-md bg-muted text-muted-foreground hover:bg-accent transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status */}
              <div className="mt-2 text-center">
                <span className={`text-xs font-medium ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  {isActive ? 'In Progress' : isCompleted ? 'Completed' : 'Ready'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {enabledBlocks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No rhythm blocks configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the admin panel to add timer blocks
          </p>
        </div>
      )}
    </div>
  );
} 