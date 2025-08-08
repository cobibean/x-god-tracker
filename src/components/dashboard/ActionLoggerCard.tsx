'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useConfigType } from '@/lib/config-context';
import { ActionType } from '@/lib/config-schemas';
import { actionStore, ActionLoggerState } from '@/lib/store';

interface ActionCounts {
  [key: string]: number;
}

export function ActionLoggerCard() {
  // Get action logger configuration
  const actionConfig = useConfigType('actions');
  const { actions } = actionConfig;

  // State for action counts
  const [actionCounts, setActionCounts] = useState<ActionCounts>({});

  // Filter enabled actions and sort by order if it exists
  const enabledActions = actions.filter(action => action.enabled);

  // Initialize action counts from centralized store
  useEffect(() => {
    try {
      const saved = actionStore.get();
      const normalized: ActionCounts = {
        valueDmsSent: saved.valueDmsSent ?? 0,
        newLeadsAdded: saved.newLeadsAdded ?? 0,
        newEngagersLogged: saved.newEngagersLogged ?? 0,
        sequencesProgressed: saved.sequencesProgressed ?? 0,
        peopleAdvanced: saved.peopleAdvanced ?? 0,
      };
      setActionCounts(normalized);
    } catch {
      // ignore
    }
  }, []);

  // Persist to store and notify
  useEffect(() => {
    const next: ActionLoggerState = {
      valueDmsSent: actionCounts.valueDmsSent || 0,
      newLeadsAdded: actionCounts.newLeadsAdded || 0,
      newEngagersLogged: actionCounts.newEngagersLogged || 0,
      sequencesProgressed: actionCounts.sequencesProgressed || 0,
      peopleAdvanced: actionCounts.peopleAdvanced || 0,
    };
    actionStore.set(next);
    window.dispatchEvent(new Event('storageUpdated'));
  }, [actionCounts]);

  const incrementAction = (actionKey: string) => {
    setActionCounts(prev => ({
      ...prev,
      [actionKey]: (prev[actionKey] || 0) + 1,
    }));
  };

  const decrementAction = (actionKey: string) => {
    setActionCounts(prev => ({
      ...prev,
      [actionKey]: Math.max(0, (prev[actionKey] || 0) - 1),
    }));
  };

  const resetAction = (actionKey: string) => {
    setActionCounts(prev => ({
      ...prev,
      [actionKey]: 0,
    }));
  };

  const resetAllActions = () => {
    const resetCounts: ActionCounts = {};
    enabledActions.forEach(action => {
      resetCounts[action.key] = 0;
    });
    setActionCounts(resetCounts);
  };

  const getTargetStatus = (action: ActionType) => {
    const count = actionCounts[action.key] || 0;
    if (!action.target) return null;
    
    if (count >= action.target) {
      return { status: 'completed', color: 'text-green-500' };
    } else if (count >= action.target * 0.8) {
      return { status: 'near', color: 'text-yellow-500' };
    } else {
      return { status: 'pending', color: 'text-muted-foreground' };
    }
  };

  const getTotalProgress = () => {
    const actionsWithTargets = enabledActions.filter(action => action.target);
    if (actionsWithTargets.length === 0) return 0;
    
    const totalTargets = actionsWithTargets.reduce((sum, action) => sum + (action.target || 0), 0);
    const totalCompleted = actionsWithTargets.reduce((sum, action) => {
      const count = actionCounts[action.key] || 0;
      return sum + Math.min(count, action.target || 0);
    }, 0);
    
    return totalTargets > 0 ? (totalCompleted / totalTargets) * 100 : 0;
  };

  const completedActions = enabledActions.filter(action => {
    const count = actionCounts[action.key] || 0;
    return action.target ? count >= action.target : count > 0;
  }).length;

  return (
    <div className="bg-card border border-border rounded-lg p-6 row-span-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-card-foreground">Action Logger</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-card-foreground">
            {completedActions}/{enabledActions.length}
          </div>
          <div className="text-sm text-muted-foreground">targets hit</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-card-foreground">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(getTotalProgress())}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${getTotalProgress()}%` }}
          />
        </div>
      </div>

      {/* Reset All Button */}
      {enabledActions.some(action => (actionCounts[action.key] || 0) > 0) && (
        <div className="mb-4">
          <button
            onClick={resetAllActions}
            className="w-full px-3 py-2 text-sm bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            Reset All Counters
          </button>
        </div>
      )}

      {/* Action Items */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {enabledActions.map((action) => {
          const count = actionCounts[action.key] || 0;
          const targetStatus = getTargetStatus(action);

          return (
            <div
              key={action.key}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                targetStatus?.status === 'completed'
                  ? 'border-green-500/50 bg-green-500/5'
                  : targetStatus?.status === 'near'
                    ? 'border-yellow-500/50 bg-yellow-500/5'
                    : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{action.label}</h3>
                    {action.target && (
                      <p className="text-sm text-muted-foreground">
                        Target: {action.target}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Current Count */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      targetStatus?.color || 'text-card-foreground'
                    }`}>
                      {count}
                    </div>
                    {action.target && (
                      <div className="text-xs text-muted-foreground">
                        of {action.target}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => incrementAction(action.key)}
                      className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => decrementAction(action.key)}
                      disabled={count === 0}
                      className="p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar for Actions with Targets */}
              {action.target && (
                <div className="mb-2">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        count >= action.target
                          ? 'bg-green-500'
                          : count >= action.target * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-primary'
                      }`}
                      style={{ 
                        width: `${Math.min((count / action.target) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  targetStatus?.color || 'text-muted-foreground'
                }`}>
                  {targetStatus?.status === 'completed' 
                    ? 'Target Reached!' 
                    : targetStatus?.status === 'near'
                      ? 'Almost There!'
                      : action.target 
                        ? `${action.target - count} to go`
                        : 'Tracking'
                  }
                </span>
                
                {count > 0 && (
                  <button
                    onClick={() => resetAction(action.key)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {enabledActions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No actions configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the admin panel to add action types
          </p>
        </div>
      )}
    </div>
  );
} 