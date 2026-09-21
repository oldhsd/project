import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), stream: z.string().min(1), year: z.coerce.number().min(1).max(4), interests: z.array(z.string()).default([]) });
export async function POST(request: Request) {
  try {
    const data = schema.parse(await request.json());
    await connectDB();
    if (await User.exists({ email: data.email })) return NextResponse.json({ error: 'An account already exists for that email.' }, { status: 409 });
    const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 12) });
    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Please check the details and try again.' }, { status: 400 });
    if ((error as { code?: number }).code === 11000) return NextResponse.json({ error: 'An account already exists for that email.' }, { status: 409 });
    console.error('Signup failed', error);
    return NextResponse.json({ error: 'Sign up is temporarily unavailable. Please try again shortly.' }, { status: 503 });
  }
}
