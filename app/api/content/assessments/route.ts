import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-service';

export async function GET() {
  return NextResponse.json({ assessments: DataStore.getAssessments() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const assessment = {
    id: `assessment-${Date.now()}`,
    title: body.title || '',
    trackCategory: body.trackCategory || 'Technology',
    duration: body.duration || '20 mins',
    totalQuestions: body.questions?.length || 0,
    passingScore: body.passingScore || 70,
    xpReward: body.xpReward || 100,
    difficulty: body.difficulty || 'Intermediate',
    questions: body.questions || []
  };
  DataStore.addAssessment(assessment);
  return NextResponse.json({ assessment }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const assessments = DataStore.getAssessments();
  const idx = assessments.findIndex(a => a.id === id);
  if (idx !== -1) assessments.splice(idx, 1);
  return NextResponse.json({ success: true });
}
