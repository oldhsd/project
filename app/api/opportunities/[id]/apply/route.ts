import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Application from '@/models/Application';
import Opportunity from '@/models/Opportunity';
export async function POST(request: Request, { params }: { params: { id: string } }) { const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to apply.' }, { status: 401 }); const parsed = z.object({ consent: z.literal(true) }).safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: 'Consent is required before sharing your profile.' }, { status: 400 }); try { await connectDB(); const opportunity = await Opportunity.findOne({ _id: params.id, status: 'published' }); if (!opportunity) return NextResponse.json({ error: 'This opportunity is no longer available.' }, { status: 404 }); const application = await Application.findOneAndUpdate({ userId: session.user.id, opportunityId: params.id }, { $setOnInsert: { userId: session.user.id, opportunityId: params.id, consent: true } }, { upsert: true, new: true }); await Opportunity.updateOne({ _id: params.id }, { $inc: { applications: 1 } }); return NextResponse.json(application, { status: 201 }); } catch { return NextResponse.json({ error: 'Could not submit your application.' }, { status: 503 }); } }
