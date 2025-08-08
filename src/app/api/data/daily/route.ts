import { NextRequest, NextResponse } from 'next/server';
import { DailyDataSchema } from '@/lib/daily-schemas';
import { getDailyDataManager } from '@/lib/db-postgres-data';

export async function GET(req: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'Sync disabled' }, { status: 501 });
    }
    const date = new URL(req.url).searchParams.get('date') || '';
    const mgr = getDailyDataManager();
    await mgr.initialize();
    const data = await mgr.getByDate(date);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({ success: false, error: 'Sync disabled' }, { status: 501 });
    }
    const body = await req.json();
    const parsed = DailyDataSchema.parse(body);
    const mgr = getDailyDataManager();
    await mgr.initialize();
    await mgr.upsert(parsed);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}


