import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = z.object({ trackId: z.string().min(1) }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid track' }, { status: 400 });
  }

  try {
    await connectDB();

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: session.user.id, trackId: parsed.data.trackId },
      { $setOnInsert: { userId: session.user.id, trackId: parsed.data.trackId } },
      { upsert: true, new: true }
    );

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Enrollment failed', error);
    return NextResponse.json({ error: 'Enrollment is temporarily unavailable.' }, { status: 503 });
  }
}
