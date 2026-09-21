import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-service';

export async function GET() {
  const analytics = DataStore.getAnalytics();
  return NextResponse.json({ success: true, analytics });
}

