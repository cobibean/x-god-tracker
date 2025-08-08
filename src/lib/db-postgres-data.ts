import { sql } from '@vercel/postgres';
import { DailyData, DailyDataSchema } from '@/lib/daily-schemas';

export class DailyDataManager {
  async initialize(): Promise<void> {
    await sql`CREATE TABLE IF NOT EXISTS daily_data (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      checklist JSONB NOT NULL,
      actions JSONB NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_data_date ON daily_data(date)`;
  }

  async getByDate(date: string): Promise<DailyData | null> {
    const result = await sql`SELECT date, checklist, actions, score FROM daily_data WHERE date = ${date}`;
    if (result.rows.length === 0) return null;
    return DailyDataSchema.parse(result.rows[0]);
  }

  async upsert(data: DailyData): Promise<void> {
    const valid = DailyDataSchema.parse(data);
    await sql`
      INSERT INTO daily_data (date, checklist, actions, score, updated_at)
      VALUES (${valid.date}, ${JSON.stringify(valid.checklist)}, ${JSON.stringify(valid.actions)}, ${valid.score}, CURRENT_TIMESTAMP)
      ON CONFLICT (date) DO UPDATE
        SET checklist = EXCLUDED.checklist,
            actions = EXCLUDED.actions,
            score = EXCLUDED.score,
            updated_at = EXCLUDED.updated_at
    `;
  }

  async getRange(start: string, end: string): Promise<DailyData[]> {
    const result = await sql`
      SELECT date, checklist, actions, score
      FROM daily_data
      WHERE date BETWEEN ${start} AND ${end}
      ORDER BY date ASC
    `;
    return result.rows.map((row) => DailyDataSchema.parse(row));
  }

  async exportAll(): Promise<{ version: string; exported_at: string; rows: DailyData[] }>{
    const result = await sql`SELECT date, checklist, actions, score FROM daily_data ORDER BY date ASC`;
    return {
      version: '1.0',
      exported_at: new Date().toISOString(),
      rows: result.rows.map((row) => DailyDataSchema.parse(row)),
    };
  }

  async importAll(payload: { rows: DailyData[] }): Promise<void> {
    for (const row of payload.rows) {
      await this.upsert(row);
    }
  }
}

let instance: DailyDataManager | null = null;
export function getDailyDataManager(): DailyDataManager {
  if (!instance) instance = new DailyDataManager();
  return instance;
}


