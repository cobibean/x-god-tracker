import { z } from 'zod';

export const DailyDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checklist: z.record(z.string(), z.boolean()),
  actions: z.record(z.string(), z.number().int().min(0)),
  score: z.number().int().min(0).max(1000),
});

export type DailyData = z.infer<typeof DailyDataSchema>;


