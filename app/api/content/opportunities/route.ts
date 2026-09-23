import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/access';
import { connectDB } from '@/lib/mongodb';
import Opportunity from '@/models/Opportunity';

export async function GET() {
  try {
    await connectDB();
    const opps = await Opportunity.find().sort({ createdAt: -1 }).lean();
    const mapped = (opps as any[]).map(o => ({
      id:             o._id.toString(),
      title:          o.title,
      company:        o.company,
      type:           o.type,
      mode:           o.mode,
      location:       o.location,
      stipend:        o.stipend || '',
      deadline:       o.deadline ? new Date(o.deadline).toISOString().slice(0, 10) : '',
      status:         o.status,
      applicantsCount:o.applications || 0,
      description:    o.description,
    }));
    return NextResponse.json({ success: true, opportunities: mapped });
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
    if (!body.title || !body.company || !body.description)
      return NextResponse.json({ error: 'Title, Company and Description required' }, { status: 400 });
    const opp = await Opportunity.create({
      title:       body.title,
      company:     body.company,
      type:        body.type        || 'Internship',
      mode:        body.mode        || 'Remote',
      location:    body.location    || 'Remote',
      stipend:     body.stipend     || '',
      description: body.description,
      skills:      Array.isArray(body.skills)
                     ? body.skills
                     : (body.skills ? String(body.skills).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      eligibility: body.eligibility || '',
      deadline:    body.deadline    ? new Date(body.deadline) : null,
      status:      'published',
      featured:    false,
    });
    return NextResponse.json({ success: true, opportunity: opp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!await requireAdmin())
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  try {
    await connectDB();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const updated = await Opportunity.findByIdAndUpdate(body.id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, opportunity: updated });
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
    await Opportunity.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
