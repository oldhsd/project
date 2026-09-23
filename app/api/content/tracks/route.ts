import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/access';
import { connectDB } from '@/lib/mongodb';
import Track from '@/models/Track';

export async function GET() {
  try {
    await connectDB();
    const tracks = await Track.find().sort({ createdAt: -1 }).lean();
    const mapped = (tracks as any[]).map(t => ({
      id:            t._id.toString(),
      name:          t.name,
      category:      t.category,
      difficulty:    t.difficulty,
      estimatedHours:t.estimatedHours,
      modulesCount:  t.modulesCount || t.modules?.length || 0,
      description:   t.description,
    }));
    return NextResponse.json({ success: true, tracks: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!await requireAdmin())
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    await connectDB();
    const body = await req.json();
    if (!body.name || !body.category)
      return NextResponse.json({ error: 'Name and Category required' }, { status: 400 });
    const track = await Track.create({
      name:          body.name,
      category:      body.category,
      difficulty:    body.difficulty    || 'Intermediate',
      estimatedHours:Number(body.estimatedHours) || 40,
      modulesCount:  Number(body.modulesCount)   || 8,
      description:   body.description  || '',
      prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites : [],
      icon:          'BookOpen',
      modules:       [],
    });
    return NextResponse.json({ success: true, track }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!await requireAdmin())
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    await connectDB();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await Track.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
