import { z } from 'zod';

// Checklist Schemas
export const ChecklistTaskSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(200),
  category: z.string().min(1),
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
});

export const CategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^[a-z]+-\d{3}$/, 'Color must be in format: color-500'),
  bgColor: z.string().regex(/^[a-z]+-\d{3}\/\d{1,2}$/, 'Background color must be in format: color-500/5'),
});

export const ChecklistConfigSchema = z.object({
  tasks: z.array(ChecklistTaskSchema),
  categories: z.record(z.string(), CategorySchema),
});

// Operating Rhythm Schemas
export const RhythmBlockSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  duration: z.number().int().min(1).max(180), // 1-180 minutes
  emoji: z.string().min(1).max(4),
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
});

export const OperatingRhythmConfigSchema = z.object({
  blocks: z.array(RhythmBlockSchema),
});

// Action Logger Schemas
export const ActionTypeSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1).max(30),
  icon: z.string().min(1).max(4),
  target: z.number().int().min(0).nullable(),
  enabled: z.boolean().default(true),
});

export const ActionLoggerConfigSchema = z.object({
  actions: z.array(ActionTypeSchema),
});

// Scoring Schemas
export const ScoringRulesSchema = z.object({
  checklistCompletion: z.number().min(0).max(10),
  aTierCoverage: z.number().min(0).max(10),
  valueDms: z.number().min(0).max(10),
  newLeads: z.number().min(0).max(10),
  engagementVelocity: z.number().min(0).max(10),
});

export const ScoringThresholdsSchema = z.object({
  excellent: z.number().int().min(0).max(10),
  good: z.number().int().min(0).max(10),
  okay: z.number().int().min(0).max(10),
});

export const ScoringMessagesSchema = z.object({
  excellent: z.string().min(1).max(50),
  good: z.string().min(1).max(50),
  okay: z.string().min(1).max(50),
  poor: z.string().min(1).max(50),
});

export const ScoringConfigSchema = z.object({
  rules: ScoringRulesSchema,
  thresholds: ScoringThresholdsSchema,
  messages: ScoringMessagesSchema,
});

// Union of all config types
export const ConfigTypeSchema = z.enum(['checklist', 'rhythm', 'actions', 'scoring']);

// TypeScript types derived from schemas
export type ChecklistTask = z.infer<typeof ChecklistTaskSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type ChecklistConfig = z.infer<typeof ChecklistConfigSchema>;

export type RhythmBlock = z.infer<typeof RhythmBlockSchema>;
export type OperatingRhythmConfig = z.infer<typeof OperatingRhythmConfigSchema>;

export type ActionType = z.infer<typeof ActionTypeSchema>;
export type ActionLoggerConfig = z.infer<typeof ActionLoggerConfigSchema>;

export type ScoringRules = z.infer<typeof ScoringRulesSchema>;
export type ScoringThresholds = z.infer<typeof ScoringThresholdsSchema>;
export type ScoringMessages = z.infer<typeof ScoringMessagesSchema>;
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

export type ConfigType = z.infer<typeof ConfigTypeSchema>;

// All configs combined
export interface AllConfigs {
  checklist: ChecklistConfig;
  rhythm: OperatingRhythmConfig;
  actions: ActionLoggerConfig;
  scoring: ScoringConfig;
}

// Schema mapping for validation
export const SCHEMA_MAP = {
  checklist: ChecklistConfigSchema,
  rhythm: OperatingRhythmConfigSchema,
  actions: ActionLoggerConfigSchema,
  scoring: ScoringConfigSchema,
} as const;

// Get schema by type
export function getSchema(type: ConfigType) {
  return SCHEMA_MAP[type];
} 