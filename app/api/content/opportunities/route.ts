import { NextResponse } from 'next/server';
import { DataStore, Opportunity } from '@/lib/data-service';

export async function GET() {
  const opportunities = DataStore.getOpportunities();
  return NextResponse.json({ success: true, opportunities });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.company) {
      return NextResponse.json({ error: 'Title and company are required' }, { status: 400 });
    }

    const newOpp: Opportunity = {
      id: body.id || `opp-${Date.now()}`,
      title: body.title,
      company: body.company,
      type: body.type || 'Internship',
      mode: body.mode || 'Remote',
      location: body.location || 'Remote',
      stipend: body.stipend || 'Competitive Stipend',
      description: body.description || '',
      responsibilities: Array.isArray(body.responsibilities) 
        ? body.responsibilities 
        : (body.responsibilities ? body.responsibilities.split('\n').filter(Boolean) : ['Contribute to product features']),
      skills: Array.isArray(body.skills) 
        ? body.skills 
        : (body.skills ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      eligibility: body.eligibility || 'Open to all students',
      deadline: body.deadline || '2026-11-30',
      status: body.status || 'published',
      featured: Boolean(body.featured),
      applicantsCount: 0,
      partnerBadge: body.partnerBadge || undefined
    };

    DataStore.addOpportunity(newOpp);
    return NextResponse.json({ success: true, opportunity: newOpp }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
    const updated = DataStore.updateOpportunity(body.id, body);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    DataStore.deleteOpportunity(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

