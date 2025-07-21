'use client';

import { useState, useEffect } from 'react';
import { useAdminConfig } from '@/lib/config-context';
import { ScoringRules, ScoringThresholds, ScoringMessages } from '@/lib/config-schemas';
import { 
  Save, 
  Calculator,
  RotateCcw,
  Info,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ScoringRulesFormProps {
  rules: ScoringRules;
  onUpdate: (rules: ScoringRules) => void;
}

function ScoringRulesForm({ rules, onUpdate }: ScoringRulesFormProps) {
  const handleChange = (key: keyof ScoringRules, value: number) => {
    onUpdate({ ...rules, [key]: value });
  };

  const ruleLabels = {
    checklistCompletion: 'Checklist Completion',
    aTierCoverage: 'A-Tier Coverage',
    valueDms: 'Value DMs',
    newLeads: 'New Leads',
    engagementVelocity: 'Engagement Velocity',
  };

  const ruleDescriptions = {
    checklistCompletion: 'Weight for completing daily checklist tasks',
    aTierCoverage: 'Weight for maintaining high-value content coverage',
    valueDms: 'Weight for sending valuable direct messages',
    newLeads: 'Weight for generating new leads and connections',
    engagementVelocity: 'Weight for quick response times and engagement',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">Scoring Rules</h2>
      </div>
      
      <div className="space-y-4">
        {Object.entries(rules).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-card-foreground mb-1">
                {ruleLabels[key as keyof ScoringRules]}
              </label>
              <p className="text-xs text-muted-foreground">
                {ruleDescriptions[key as keyof ScoringRules]}
              </p>
            </div>
            
            <div className="ml-4">
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key as keyof ScoringRules, parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-border rounded-md bg-background text-card-foreground text-center focus:ring-2 focus:ring-primary focus:border-primary"
                min="0"
                max="10"
                step="0.1"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">0-10</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScoringThresholdsFormProps {
  thresholds: ScoringThresholds;
  onUpdate: (thresholds: ScoringThresholds) => void;
}

function ScoringThresholdsForm({ thresholds, onUpdate }: ScoringThresholdsFormProps) {
  const handleChange = (key: keyof ScoringThresholds, value: number) => {
    onUpdate({ ...thresholds, [key]: value });
  };

  const thresholdLabels = {
    excellent: 'Excellent Threshold',
    good: 'Good Threshold',
    okay: 'Okay Threshold',
  };

  const thresholdDescriptions = {
    excellent: 'Score needed for excellent rating',
    good: 'Score needed for good rating',
    okay: 'Score needed for okay rating',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">Score Thresholds</h2>
      </div>
      
      <div className="space-y-4">
        {Object.entries(thresholds).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-card-foreground mb-1">
                {thresholdLabels[key as keyof ScoringThresholds]}
              </label>
              <p className="text-xs text-muted-foreground">
                {thresholdDescriptions[key as keyof ScoringThresholds]}
              </p>
            </div>
            
            <div className="ml-4">
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key as keyof ScoringThresholds, parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-border rounded-md bg-background text-card-foreground text-center focus:ring-2 focus:ring-primary focus:border-primary"
                min="0"
                max="10"
              />
              <div className="text-xs text-muted-foreground text-center mt-1">0-10</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScoringMessagesFormProps {
  messages: ScoringMessages;
  onUpdate: (messages: ScoringMessages) => void;
}

function ScoringMessagesForm({ messages, onUpdate }: ScoringMessagesFormProps) {
  const handleChange = (key: keyof ScoringMessages, value: string) => {
    onUpdate({ ...messages, [key]: value });
  };

  const messageLabels = {
    excellent: 'Excellent Message',
    good: 'Good Message',
    okay: 'Okay Message',
    poor: 'Poor Message',
  };

  const messageDescriptions = {
    excellent: 'Message shown for excellent performance',
    good: 'Message shown for good performance',
    okay: 'Message shown for okay performance',
    poor: 'Message shown for poor performance',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">Performance Messages</h2>
      </div>
      
      <div className="space-y-4">
        {Object.entries(messages).map(([key, value]) => (
          <div key={key} className="p-4 border border-border rounded-lg">
            <label className="block text-sm font-medium text-card-foreground mb-1">
              {messageLabels[key as keyof ScoringMessages]}
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              {messageDescriptions[key as keyof ScoringMessages]}
            </p>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key as keyof ScoringMessages, e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              maxLength={50}
              placeholder={`Enter ${key} message...`}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {value.length}/50 characters
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScoringAdmin() {
  const { config, saveConfig, loading, error } = useAdminConfig('scoring');
  const [rules, setRules] = useState<ScoringRules>({
    checklistCompletion: 0,
    aTierCoverage: 0,
    valueDms: 0,
    newLeads: 0,
    engagementVelocity: 0,
  });
  const [thresholds, setThresholds] = useState<ScoringThresholds>({
    excellent: 8,
    good: 6,
    okay: 4,
  });
  const [messages, setMessages] = useState<ScoringMessages>({
    excellent: "Outstanding work! 🔥",
    good: "Great job today! 👍",
    okay: "Good progress! 📈",
    poor: "Room for improvement 💪",
  });
  const [saving, setSaving] = useState(false);

  // Initialize local state from config
  useEffect(() => {
    if (config && 'rules' in config && 'thresholds' in config && 'messages' in config) {
      setRules(config.rules);
      setThresholds(config.thresholds);
      setMessages(config.messages);
    }
  }, [config]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const success = await saveConfig({
        rules,
        thresholds,
        messages,
      });
      
      if (success) {
        toast.success('Scoring configuration saved!');
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

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset to default scoring settings?')) {
      try {
        const response = await fetch('/api/config/scoring', { method: 'DELETE' });
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

  const getTotalWeight = () => {
    return Object.values(rules).reduce((sum, weight) => sum + weight, 0);
  };

  const getMaxPossibleScore = () => {
    return getTotalWeight() * 10; // Assuming max multiplier of 10
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading scoring configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Scoring System</h1>
          <p className="text-muted-foreground mt-2">
            Configure how daily achievements are scored, weighted, and communicated.
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

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-700 dark:text-blue-300 font-medium mb-1">How Scoring Works</p>
            <p className="text-blue-600 dark:text-blue-400 leading-relaxed">
              Each achievement area has a weight (0-10) that determines its importance in your daily score. 
              Thresholds determine performance levels, and messages provide personalized feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-card-foreground">{getTotalWeight().toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Total Weight</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-primary">{Math.round(getMaxPossibleScore())}</div>
          <div className="text-sm text-muted-foreground">Max Score</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{thresholds.excellent}</div>
          <div className="text-sm text-muted-foreground">Excellent Min</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-500">{Object.keys(rules).length}</div>
          <div className="text-sm text-muted-foreground">Score Areas</div>
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ScoringRulesForm rules={rules} onUpdate={setRules} />
          <ScoringThresholdsForm thresholds={thresholds} onUpdate={setThresholds} />
        </div>
        
        <div>
          <ScoringMessagesForm messages={messages} onUpdate={setMessages} />
        </div>
      </div>
    </div>
  );
} 