import { NextResponse } from 'next/server';
import { getDailyDataManager } from '@/lib/db-postgres-data';

export async function GET() {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'Sync disabled' }, { status: 501 });
    }
    const mgr = getDailyDataManager();
    await mgr.initialize();
    const payload = await mgr.exportAll();
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}


