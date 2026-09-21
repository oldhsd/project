import { NextResponse } from 'next/server';
import { DataStore, Certificate } from '@/lib/data-service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('id');
  if (query) {
    const cert = DataStore.getCertificateById(query);
    if (!cert) return NextResponse.json({ success: false, error: 'Certificate not found or unverified' }, { status: 404 });
    return NextResponse.json({ success: true, certificate: cert });
  }

  const certificates = DataStore.getCertificates();
  return NextResponse.json({ success: true, certificates });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.studentName || !body.trackName) {
      return NextResponse.json({ error: 'Student Name and Track Name are required' }, { status: 400 });
    }

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const categoryCode = (body.category || 'CS').substring(0, 2).toUpperCase();
    const certificateId = `BN-2026-${categoryCode}${randNum}`;

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateId,
      studentName: body.studentName,
      studentEmail: body.studentEmail || 'student@buildnext.local',
      trackName: body.trackName,
      category: body.category || 'Technology',
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      grade: body.grade || 'Distinction',
      verified: true,
      credentialUrl: `/verify/${certificateId}`
    };

    DataStore.issueCertificate(newCert);
    return NextResponse.json({ success: true, certificate: newCert }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

