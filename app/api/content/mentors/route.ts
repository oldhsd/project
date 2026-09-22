import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-service';

export async function GET() {
  return NextResponse.json({ mentors: DataStore.getMentors() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const mentor = {
    id: `mentor-${Date.now()}`,
    name: body.name || '',
    role: body.role || '',
    company: body.company || '',
    domain: body.domain || '',
    experience: body.experience || '',
    avatar: body.avatar || '',
    bio: body.bio || '',
    availableSlots: body.availableSlots || []
  };
  const mentors = DataStore.getMentors();
  mentors.unshift(mentor);
  return NextResponse.json({ mentor }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const mentors = DataStore.getMentors();
  const idx = mentors.findIndex(m => m.id === id);
  if (idx !== -1) mentors.splice(idx, 1);
  return NextResponse.json({ success: true });
}
