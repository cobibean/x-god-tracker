import { NextRequest, NextResponse } from 'next/server';
import { getDailyDataManager } from '@/lib/db-postgres-data';

export async function GET(req: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'Sync disabled' }, { status: 501 });
    }
    const url = new URL(req.url);
    const start = url.searchParams.get('start') || '';
    const end = url.searchParams.get('end') || '';
    const mgr = getDailyDataManager();
    await mgr.initialize();
    const data = await mgr.getRange(start, end);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}


