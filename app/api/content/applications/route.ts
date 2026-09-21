import { NextResponse } from 'next/server';
import { DataStore, Application } from '@/lib/data-service';

export async function GET() {
  const applications = DataStore.getApplications();
  return NextResponse.json({ success: true, applications });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.opportunityId || !body.studentName || !body.studentEmail) {
      return NextResponse.json({ error: 'Opportunity, student name, and email are required' }, { status: 400 });
    }

    if (!body.consentGranted) {
      return NextResponse.json({ error: 'Consent to share verified profile data with partner is required' }, { status: 400 });
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      opportunityId: body.opportunityId,
      roleTitle: body.roleTitle || 'Candidate',
      company: body.company || 'Partner',
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      stream: body.stream || 'Multi-Disciplinary',
      year: Number(body.year) || 3,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      consentGranted: true,
      githubUrl: body.githubUrl || undefined
    };

    DataStore.addApplication(newApp);
    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
    }

    const updated = DataStore.updateApplicationStatus(body.id, body.status);
    if (!updated) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    return NextResponse.json({ success: true, application: updated });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

