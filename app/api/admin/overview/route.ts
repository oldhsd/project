import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/access';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User'; import Track from '@/models/Track'; import Opportunity from '@/models/Opportunity';
export async function GET() { if (!await requireAdmin()) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 }); try { await connectDB(); const [students, tracks, opportunities] = await Promise.all([User.countDocuments(), Track.countDocuments(), Opportunity.countDocuments()]); return NextResponse.json({ students, tracks, opportunities }); } catch { return NextResponse.json({ students: 0, tracks: 0, opportunities: 0 }); } }
