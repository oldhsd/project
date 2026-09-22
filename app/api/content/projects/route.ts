import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-service';

export async function GET() {
  return NextResponse.json({ projects: DataStore.getProjects() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = {
    id: `project-${Date.now()}`,
    title: body.title || '',
    category: body.category || 'Mini Project',
    stream: body.stream || 'All Streams',
    difficulty: body.difficulty || 'Beginner',
    duration: body.duration || '1 week',
    summary: body.summary || '',
    problemStatement: body.problemStatement || '',
    deliverables: body.deliverables || [],
    stack: body.stack || [],
    xp: body.xp || 100,
    submissionsCount: 0
  };
  DataStore.addProject(project);
  return NextResponse.json({ project }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const projects = DataStore.getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx !== -1) projects.splice(idx, 1);
  return NextResponse.json({ success: true });
}
