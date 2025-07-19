// Centralized localStorage management for X God Tracker Dashboard

export interface DailyChecklistState {
  [key: string]: boolean;
}

export interface ActionLoggerState {
  valueDmsSent: number;
  newLeadsAdded: number;
  newEngagersLogged: number;
  sequencesProgressed: number;
  peopleAdvanced: number;
}

export interface ScoreHistoryState {
  [date: string]: number;
}

// Storage keys
const STORAGE_KEYS = {
  CHECKLIST: 'dailyChecklistState',
  ACTIONS: 'actionLoggerState',
  SCORE_HISTORY: 'scoreHistoryState',
} as const;

// Safe JSON parsing with fallback
const safeJSONParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return fallback;
  }
};

// Safe JSON storing
const safeJSONStore = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to store localStorage item "${key}":`, error);
  }
};

// Get current date string (YYYY-MM-DD)
const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Checklist Store
export const checklistStore = {
  get: (): DailyChecklistState => {
    return safeJSONParse(STORAGE_KEYS.CHECKLIST, {});
  },

  set: (state: DailyChecklistState): void => {
    safeJSONStore(STORAGE_KEYS.CHECKLIST, state);
  },

  toggle: (key: string): boolean => {
    const current = checklistStore.get();
    const newState = { ...current, [key]: !current[key] };
    checklistStore.set(newState);
    return newState[key];
  },

  reset: (): void => {
    safeJSONStore(STORAGE_KEYS.CHECKLIST, {});
  },

  getCompletionCount: (): number => {
    const state = checklistStore.get();
    return Object.values(state).filter(Boolean).length;
  },

  getTotalItems: (): number => {
    const state = checklistStore.get();
    return Object.keys(state).length;
  }
};

// Action Logger Store
export const actionStore = {
  get: (): ActionLoggerState => {
    return safeJSONParse(STORAGE_KEYS.ACTIONS, {
      valueDmsSent: 0,
      newLeadsAdded: 0,
      newEngagersLogged: 0,
      sequencesProgressed: 0,
      peopleAdvanced: 0,
    });
  },

  set: (state: ActionLoggerState): void => {
    safeJSONStore(STORAGE_KEYS.ACTIONS, state);
  },

  increment: (action: keyof ActionLoggerState): number => {
    const current = actionStore.get();
    const newState = { ...current, [action]: current[action] + 1 };
    actionStore.set(newState);
    return newState[action];
  },

  reset: (): void => {
    const initialState: ActionLoggerState = {
      valueDmsSent: 0,
      newLeadsAdded: 0,
      newEngagersLogged: 0,
      sequencesProgressed: 0,
      peopleAdvanced: 0,
    };
    actionStore.set(initialState);
  },

  getTotalActions: (): number => {
    const state = actionStore.get();
    return Object.values(state).reduce((sum, count) => sum + count, 0);
  }
};

// Score Store
export const scoreStore = {
  saveDaily: (date: string = getCurrentDateString(), score: number): void => {
    const history = scoreStore.getHistory();
    const newHistory = { ...history, [date]: score };
    safeJSONStore(STORAGE_KEYS.SCORE_HISTORY, newHistory);
  },

  getHistory: (days?: number): ScoreHistoryState => {
    const history: ScoreHistoryState = safeJSONParse(STORAGE_KEYS.SCORE_HISTORY, {});
    
    if (!days) return history;

    // Get last N days of history
    const sortedDates = Object.keys(history)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, days);
    
    const recentHistory: ScoreHistoryState = {};
    sortedDates.forEach(date => {
      recentHistory[date] = history[date];
    });
    
    return recentHistory;
  },

  getCurrentScore: (): number => {
    // Calculate current daily score based on checklist completion and actions
    const checklistCompletion = checklistStore.getCompletionCount();
    const totalActions = actionStore.getTotalActions();
    
    // Scoring formula: each checklist item = 10 points, each action = 2 points
    const score = (checklistCompletion * 10) + (totalActions * 2);
    
    // Auto-save current score
    scoreStore.saveDaily(getCurrentDateString(), score);
    
    return score;
  },

  getTodayScore: (): number => {
    const today = getCurrentDateString();
    const history = scoreStore.getHistory();
    return history[today] || scoreStore.getCurrentScore();
  },

  getWeeklyAverage: (): number => {
    const weekHistory = scoreStore.getHistory(7);
    const scores = Object.values(weekHistory);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
};

// Reset all data (useful for testing or daily reset)
export const resetAllData = (): void => {
  checklistStore.reset();
  actionStore.reset();
  // Note: We don't reset score history as it's historical data
};

// Check if it's a new day and reset daily data if needed (call on app startup)
export const checkAndResetDaily = (): void => {
  const lastResetDate = localStorage.getItem('lastResetDate');
  const today = getCurrentDateString();
  
  if (lastResetDate !== today) {
    // Save current score before reset
    scoreStore.getCurrentScore();
    
    // Reset daily data
    checklistStore.reset();
    actionStore.reset();
    
    // Update last reset date
    localStorage.setItem('lastResetDate', today);
  }
}; 