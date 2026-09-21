import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Opportunity from '@/models/Opportunity';
import { requireAdmin } from '@/lib/access';

const schema = z.object({ title: z.string().min(3), company: z.string().min(2), type: z.enum(['Internship', 'Competition', 'Fellowship', 'Job']), location: z.string().min(2), mode: z.string().min(2), description: z.string().min(12), skills: z.array(z.string()).default([]), eligibility: z.string().default(''), deadline: z.string().optional(), status: z.enum(['draft', 'published', 'closed']).default('draft'), featured: z.boolean().default(false) });
export async function GET() { try { await connectDB(); return NextResponse.json(await Opportunity.find({ status: 'published' }).sort({ featured: -1, createdAt: -1 }).lean()); } catch { return NextResponse.json([]); } }
export async function POST(request: Request) { if (!await requireAdmin()) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 }); try { const data = schema.parse(await request.json()); await connectDB(); const opportunity = await Opportunity.create({ ...data, deadline: data.deadline ? new Date(data.deadline) : undefined }); return NextResponse.json(opportunity, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? 'Please complete the required opportunity fields.' : 'Could not save this opportunity.' }, { status: 400 }); } }
