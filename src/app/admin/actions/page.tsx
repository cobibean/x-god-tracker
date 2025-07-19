'use client';

import { useState, useEffect } from 'react';
import { useAdminConfig } from '@/lib/config-context';
import { ActionType } from '@/lib/config-schemas';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Target,
  Eye,
  EyeOff,
  RotateCcw,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ActionItemProps {
  action: ActionType;
  onEdit: (action: ActionType) => void;
  onDelete: (actionKey: string) => void;
  onToggleEnabled: (actionKey: string) => void;
}

function ActionItem({ action, onEdit, onDelete, onToggleEnabled }: ActionItemProps) {
  return (
    <div
      className={`group flex items-center space-x-3 p-4 rounded-lg border transition-all ${
        action.enabled 
          ? 'border-border bg-card hover:border-primary/50' 
          : 'border-border/50 bg-muted/30 opacity-60'
      }`}
    >
      {/* Action Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{action.icon}</span>
          <div>
            <span className={`font-medium ${action.enabled ? 'text-card-foreground' : 'text-muted-foreground'}`}>
              {action.label}
            </span>
            <div className="text-sm text-muted-foreground">
              Key: {action.key} {action.target ? `• Target: ${action.target}` : '• No target'}
            </div>
          </div>
        </div>
      </div>

      {/* Target Display */}
      {action.target && (
        <div className="text-right">
          <div className={`text-lg font-mono font-bold ${action.enabled ? 'text-primary' : 'text-muted-foreground'}`}>
            {action.target}
          </div>
          <div className="text-xs text-muted-foreground">target</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleEnabled(action.key)}
          className={`p-1.5 rounded-md transition-colors ${
            action.enabled 
              ? 'text-green-500 hover:bg-green-500/10' 
              : 'text-muted-foreground hover:bg-accent'
          }`}
          title={action.enabled ? 'Hide action' : 'Show action'}
        >
          {action.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        
        <button
          onClick={() => onEdit(action)}
          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors"
          title="Edit action"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(action.key)}
          className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete action"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ActionFormProps {
  action?: ActionType;
  onSave: (action: Partial<ActionType>) => void;
  onCancel: () => void;
  existingKeys: string[];
}

function ActionForm({ action, onSave, onCancel, existingKeys }: ActionFormProps) {
  const [formData, setFormData] = useState({
    key: action?.key || '',
    label: action?.label || '',
    icon: action?.icon || '🎯',
    target: action?.target || null as number | null,
    enabled: action?.enabled ?? true,
  });

  const commonIcons = ['🎯', '💬', '👥', '📈', '⬆️', '📝', '🚀', '💪', '🔥', '⚡', '✨', '📊', '🏃', '⭐'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.key.trim()) {
      toast.error('Action key is required');
      return;
    }
    
    if (!formData.label.trim()) {
      toast.error('Action label is required');
      return;
    }

    // Check for duplicate keys (excluding current action if editing)
    const isDuplicate = existingKeys.some(key => 
      key === formData.key && key !== action?.key
    );
    
    if (isDuplicate) {
      toast.error('Action key must be unique');
      return;
    }

    if (formData.target !== null && (formData.target < 0 || formData.target > 1000)) {
      toast.error('Target must be between 0 and 1000');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Action Key *
          </label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., valueDmsSent"
            maxLength={50}
            disabled={!!action} // Disable editing key for existing actions
          />
          <div className="text-xs text-muted-foreground mt-1">
            Used for data storage. Letters and numbers only.
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Display Label *
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g., Value DMs"
            maxLength={30}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-2">
            Icon
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-20 px-3 py-2 border border-border rounded-md bg-background text-card-foreground text-center text-xl focus:ring-2 focus:ring-primary focus:border-primary"
              maxLength={4}
            />
            <span className="text-sm text-muted-foreground">or choose:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon }))}
                className={`p-2 text-xl rounded-md border transition-colors hover:bg-accent ${
                  formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">
            Target (optional)
          </label>
          <input
            type="number"
            value={formData.target || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              target: e.target.value ? parseInt(e.target.value) : null 
            }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="No target"
            min="0"
            max="1000"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Leave empty for tracking without targets
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="enabled"
          checked={formData.enabled}
          onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
          className="rounded border-border focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="enabled" className="text-sm text-card-foreground">
          Action enabled
        </label>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{action ? 'Update' : 'Create'} Action</span>
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
}

export default function ActionsAdmin() {
  const { config, saveConfig, loading, error } = useAdminConfig('actions');
  const [actions, setActions] = useState<ActionType[]>([]);
  const [editingAction, setEditingAction] = useState<ActionType | null>(null);
  const [showNewActionForm, setShowNewActionForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize local state from config
  useEffect(() => {
    if (config && 'actions' in config) {
      setActions([...config.actions]);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveConfig({
        actions,
      });
      
      if (success) {
        toast.success('Action logger configuration saved!');
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAction = (actionData: Partial<ActionType>) => {
    const newAction: ActionType = {
      key: actionData.key!,
      label: actionData.label!,
      icon: actionData.icon!,
      target: actionData.target || null,
      enabled: actionData.enabled ?? true,
    };
    
    setActions(prev => [...prev, newAction]);
    setShowNewActionForm(false);
    toast.success('Action created!');
  };

  const handleUpdateAction = (actionData: Partial<ActionType>) => {
    if (!editingAction) return;
    
    setActions(prev => prev.map(action => 
      action.key === editingAction.key 
        ? { ...action, ...actionData }
        : action
    ));
    setEditingAction(null);
    toast.success('Action updated!');
  };

  const handleDeleteAction = (actionKey: string) => {
    if (confirm('Are you sure you want to delete this action? This will also remove its historical data.')) {
      setActions(prev => prev.filter(action => action.key !== actionKey));
      toast.success('Action deleted!');
    }
  };

  const handleToggleEnabled = (actionKey: string) => {
    setActions(prev => prev.map(action => 
      action.key === actionKey 
        ? { ...action, enabled: !action.enabled }
        : action
    ));
  };

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset to default actions? This will remove all custom actions.')) {
      try {
        const response = await fetch('/api/config/actions', { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
          toast.success('Reset to defaults successfully!');
        } else {
          toast.error('Failed to reset configuration');
        }
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Error resetting configuration');
      }
    }
  };

  const getActionsWithTargets = () => {
    return actions.filter(a => a.target !== null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading action logger configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Action Logger</h1>
          <p className="text-muted-foreground mt-2">
            Manage action types and their targets for daily tracking.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-card-foreground">{actions.length}</div>
          <div className="text-sm text-muted-foreground">Total Actions</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{actions.filter(a => a.enabled).length}</div>
          <div className="text-sm text-muted-foreground">Active Actions</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{getActionsWithTargets().length}</div>
          <div className="text-sm text-muted-foreground">With Targets</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">
            {getActionsWithTargets().reduce((sum, a) => sum + (a.target || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Targets</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Action Types</h2>
          <button
            onClick={() => setShowNewActionForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action</span>
          </button>
        </div>

        {/* New Action Form */}
        {showNewActionForm && (
          <div className="mb-6">
            <ActionForm
              onSave={handleCreateAction}
              onCancel={() => setShowNewActionForm(false)}
              existingKeys={actions.map(a => a.key)}
            />
          </div>
        )}

        {/* Edit Action Form */}
        {editingAction && (
          <div className="mb-6">
            <ActionForm
              action={editingAction}
              onSave={handleUpdateAction}
              onCancel={() => setEditingAction(null)}
              existingKeys={actions.map(a => a.key)}
            />
          </div>
        )}

        {/* Action List */}
        <div className="space-y-3">
          {actions.map((action) => (
            <ActionItem
              key={action.key}
              action={action}
              onEdit={setEditingAction}
              onDelete={handleDeleteAction}
              onToggleEnabled={handleToggleEnabled}
            />
          ))}
        </div>

        {/* Empty State */}
        {actions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No actions configured</p>
              <p className="text-sm">Add your first action to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 