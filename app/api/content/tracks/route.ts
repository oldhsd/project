import { NextResponse } from 'next/server';
import { DataStore, Track } from '@/lib/data-service';

export async function GET() {
  const tracks = DataStore.getTracks();
  return NextResponse.json({ success: true, tracks });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
    }
    const newTrack: Track = {
      id: body.id || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: body.name,
      description: body.description || '',
      category: body.category,
      difficulty: body.difficulty || 'Beginner',
      icon: body.icon || 'Layers',
      estimatedHours: Number(body.estimatedHours) || 20,
      modulesCount: Number(body.modulesCount) || 4,
      featured: Boolean(body.featured),
      syllabus: body.syllabus || [
        { id: 'm1', title: 'Core Foundations & Mental Model', duration: '3 hrs', xp: 40, lessons: ['Introduction', 'Core Architecture'] }
      ],
      prerequisites: body.prerequisites || ['Basic computer literacy']
    };
    DataStore.addTrack(newTrack);
    return NextResponse.json({ success: true, track: newTrack }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    DataStore.deleteTrack(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

