import { 
  ChecklistConfig, 
  OperatingRhythmConfig, 
  ActionLoggerConfig, 
  ScoringConfig,
  AllConfigs 
} from './config-schemas';

// Default checklist configuration - matching current DailyChecklistCard
export const DEFAULT_CHECKLIST_CONFIG: ChecklistConfig = {
  tasks: [
    { id: 'warmup', text: 'Warm 10 A-tier before anchor', category: 'preparation', order: 0, enabled: true },
    { id: 'anchor', text: 'Anchor post shipped', category: 'content', order: 1, enabled: true },
    { id: 'velocity', text: '5-min velocity replies done', category: 'engagement', order: 2, enabled: true },
    { id: 'log', text: 'New engagers logged', category: 'tracking', order: 3, enabled: true },
    { id: 'progress', text: '7-touch sequences progressed', category: 'sequences', order: 4, enabled: true },
    { id: 'advance', text: 'Advanced ≥2 people one stage', category: 'advancement', order: 5, enabled: true },
    { id: 'dms', text: '5 value DMs sent', category: 'outreach', order: 6, enabled: true },
    { id: 'leads', text: '5 new qualified leads added', category: 'generation', order: 7, enabled: true },
    { id: 'coverage', text: 'A-tier coverage 90%+', category: 'coverage', order: 8, enabled: true },
    { id: 'score', text: 'Daily Micro Score calculated', category: 'analysis', order: 9, enabled: true },
    { id: 'crm', text: 'CRM fully updated & next actions scheduled', category: 'management', order: 10, enabled: true },
  ],
  categories: {
    preparation: { name: 'Preparation', color: 'blue-500', bgColor: 'blue-500/5' },
    content: { name: 'Content', color: 'purple-500', bgColor: 'purple-500/5' },
    engagement: { name: 'Engagement', color: 'green-500', bgColor: 'green-500/5' },
    tracking: { name: 'Tracking', color: 'yellow-500', bgColor: 'yellow-500/5' },
    sequences: { name: 'Sequences', color: 'orange-500', bgColor: 'orange-500/5' },
    advancement: { name: 'Advancement', color: 'red-500', bgColor: 'red-500/5' },
    outreach: { name: 'Outreach', color: 'pink-500', bgColor: 'pink-500/5' },
    generation: { name: 'Generation', color: 'emerald-500', bgColor: 'emerald-500/5' },
    coverage: { name: 'Coverage', color: 'cyan-500', bgColor: 'cyan-500/5' },
    analysis: { name: 'Analysis', color: 'indigo-500', bgColor: 'indigo-500/5' },
    management: { name: 'Management', color: 'slate-500', bgColor: 'slate-500/5' },
  },
};

// Default operating rhythm configuration - matching current OperatingRhythmCard
export const DEFAULT_OPERATING_RHYTHM_CONFIG: OperatingRhythmConfig = {
  blocks: [
    { id: 'warmup', name: 'Pre-Post Warmup', duration: 15, emoji: '🔥', order: 0, enabled: true },
    { id: 'anchor', name: 'Post Anchor', duration: 5, emoji: '⚓', order: 1, enabled: true },
    { id: 'velocity', name: 'First 5 Minutes', duration: 5, emoji: '⚡', order: 2, enabled: true },
    { id: 'sprint1', name: 'Engagement Sprint 1', duration: 45, emoji: '🏃', order: 3, enabled: true },
    { id: 'midday', name: 'Midday Micro', duration: 15, emoji: '☀️', order: 4, enabled: true },
    { id: 'sprint2', name: 'Engagement Sprint 2', duration: 45, emoji: '🏃', order: 5, enabled: true },
    { id: 'dms', name: 'DM Power Slot', duration: 30, emoji: '💬', order: 6, enabled: true },
    { id: 'debrief', name: 'Debrief / CRM Update', duration: 10, emoji: '📝', order: 7, enabled: true },
  ],
};

// Default action logger configuration - matching current ActionLoggerCard
export const DEFAULT_ACTION_LOGGER_CONFIG: ActionLoggerConfig = {
  actions: [
    { key: 'valueDmsSent', label: 'Value DMs', icon: '💬', target: 5, enabled: true },
    { key: 'newLeadsAdded', label: 'New Leads', icon: '🎯', target: 5, enabled: true },
    { key: 'newEngagersLogged', label: 'Engagers', icon: '👥', target: null, enabled: true },
    { key: 'sequencesProgressed', label: 'Sequences', icon: '📈', target: null, enabled: true },
    { key: 'peopleAdvanced', label: 'Advanced', icon: '⬆️', target: 2, enabled: true },
  ],
};

// Default scoring configuration - matching current DailyScoreCard logic
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  rules: {
    checklistCompletion: 2,
    aTierCoverage: 2,
    valueDms: 2,
    newLeads: 2,
    engagementVelocity: 2,
  },
  thresholds: {
    excellent: 8,
    good: 6,
    okay: 4,
  },
  messages: {
    excellent: 'Perfect execution!',
    good: 'Great progress!',
    okay: 'Keep pushing',
    poor: 'Let\'s improve',
  },
};

// All default configurations combined
export const DEFAULT_CONFIGS: AllConfigs = {
  checklist: DEFAULT_CHECKLIST_CONFIG,
  rhythm: DEFAULT_OPERATING_RHYTHM_CONFIG,
  actions: DEFAULT_ACTION_LOGGER_CONFIG,
  scoring: DEFAULT_SCORING_CONFIG,
};

// Helper to get default config by type
export function getDefaultConfig(type: keyof AllConfigs) {
  return DEFAULT_CONFIGS[type];
} 