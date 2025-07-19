'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AllConfigs, ConfigType } from './config-schemas';
import { DEFAULT_CONFIGS } from './default-configs';

interface ConfigContextType {
  configs: AllConfigs;
  loading: boolean;
  error: string | null;
  updateConfig: (type: ConfigType, data: any) => Promise<boolean>;
  refreshConfig: (type: ConfigType) => Promise<void>;
  refreshAllConfigs: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [configs, setConfigs] = useState<AllConfigs>(DEFAULT_CONFIGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial configurations
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all configs in parallel
      const [checklistRes, rhythmRes, actionsRes, scoringRes] = await Promise.all([
        fetch('/api/config/checklist'),
        fetch('/api/config/rhythm'),
        fetch('/api/config/actions'),
        fetch('/api/config/scoring'),
      ]);

      const [checklist, rhythm, actions, scoring] = await Promise.all([
        checklistRes.json(),
        rhythmRes.json(),
        actionsRes.json(),
        scoringRes.json(),
      ]);

      setConfigs({
        checklist: checklist.success ? checklist.data : DEFAULT_CONFIGS.checklist,
        rhythm: rhythm.success ? rhythm.data : DEFAULT_CONFIGS.rhythm,
        actions: actions.success ? actions.data : DEFAULT_CONFIGS.actions,
        scoring: scoring.success ? scoring.data : DEFAULT_CONFIGS.scoring,
      });
    } catch (err) {
      console.error('Error loading configs:', err);
      setError('Failed to load configurations');
      // Use defaults on error
      setConfigs(DEFAULT_CONFIGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh specific config
  const refreshConfig = useCallback(async (type: ConfigType) => {
    try {
      const response = await fetch(`/api/config/${type}`);
      const result = await response.json();

      if (result.success) {
        setConfigs(prev => ({
          ...prev,
          [type]: result.data,
        }));
      }
    } catch (err) {
      console.error(`Error refreshing config ${type}:`, err);
    }
  }, []);

  // Refresh all configs
  const refreshAllConfigs = useCallback(async () => {
    await loadConfigs();
  }, [loadConfigs]);

  // Update configuration
  const updateConfig = useCallback(async (type: ConfigType, data: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/config/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state immediately for responsive UI
        setConfigs(prev => ({
          ...prev,
          [type]: data,
        }));
        return true;
      } else {
        setError(result.error || 'Failed to update configuration');
        return false;
      }
    } catch (err) {
      console.error(`Error updating config ${type}:`, err);
      setError('Failed to update configuration');
      return false;
    }
  }, []);

  // Setup Server-Sent Events for real-time updates
  useEffect(() => {
    // Load initial configs
    loadConfigs();

    // Setup SSE for real-time updates
    const eventSource = new EventSource('/api/config/stream');

    eventSource.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        
        if (type in DEFAULT_CONFIGS) {
          setConfigs(prev => ({
            ...prev,
            [type]: data,
          }));
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      // Don't set error state for SSE failures as the app still works
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [loadConfigs]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value: ConfigContextType = {
    configs,
    loading,
    error,
    updateConfig,
    refreshConfig,
    refreshAllConfigs,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook to use config context
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Hook to get specific config with fallback
export function useConfigType<T extends keyof AllConfigs>(type: T): AllConfigs[T] {
  const { configs } = useConfig();
  return configs[type] ?? DEFAULT_CONFIGS[type];
}

// Hook for admin components to manage configs
export function useAdminConfig(type: ConfigType) {
  const { configs, updateConfig, refreshConfig, loading, error } = useConfig();
  
  const config = configs[type];
  
  const saveConfig = useCallback(async (data: any) => {
    const success = await updateConfig(type, data);
    if (!success) {
      // Refresh to get latest state on failure
      await refreshConfig(type);
    }
    return success;
  }, [type, updateConfig, refreshConfig]);

  return {
    config,
    saveConfig,
    refreshConfig: () => refreshConfig(type),
    loading,
    error,
  };
} 