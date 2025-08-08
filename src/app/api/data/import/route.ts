import { NextRequest, NextResponse } from 'next/server';
import { getDailyDataManager } from '@/lib/db-postgres-data';
import { DailyDataSchema } from '@/lib/daily-schemas';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'Sync disabled' }, { status: 501 });
    }
    const body = await req.json();
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    // Basic validation of rows
    const validated = rows.map((r: unknown) => DailyDataSchema.parse(r));
    const mgr = getDailyDataManager();
    await mgr.initialize();
    await mgr.importAll({ rows: validated });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}


