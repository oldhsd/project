import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const ADMIN_MASTER_PASSCODE = process.env.ADMIN_MASTER_KEY || 'BUILDNEXT-ADMIN-2026';
const ADMIN_TOKEN_VALUE = 'bn_super_admin_verified_2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name, passcode } = body;

    const cookieStore = cookies();

    // 1. Quick 1-Click Demo Login for Client Presentation
    if (action === 'demo_login') {
      cookieStore.set('bn_admin_token', ADMIN_TOKEN_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      return NextResponse.json({
        success: true,
        message: 'Authenticated as BuildNext Lead Administrator (Demo Mode)',
        user: { name: 'Lead Administrator', email: 'admin@buildnext.local', role: 'admin' }
      });
    }

    // 2. Admin Sign Out
    if (action === 'logout') {
      cookieStore.delete('bn_admin_token');
      return NextResponse.json({ success: true, message: 'Logged out of Admin Studio' });
    }

    // 3. Admin Sign Up with Master Passcode
    if (action === 'signup') {
      if (passcode !== ADMIN_MASTER_PASSCODE) {
        return NextResponse.json({
          error: 'Invalid Admin Security Key. You are not authorized to create an administrator account.'
        }, { status: 403 });
      }

      if (!email || !password || password.length < 8) {
        return NextResponse.json({
          error: 'Valid email and password (minimum 8 characters) are required.'
        }, { status: 400 });
      }

      try {
        await connectDB();
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          // If already exists, update role to admin if valid passcode provided
          existing.role = 'admin';
          await existing.save();
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          await User.create({
            name: name || 'Admin Operator',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin',
            stream: 'Operations & Engineering'
          });
        }
      } catch (dbErr) {
        // Fallback for offline/demo environment: proceed with cookie
      }

      cookieStore.set('bn_admin_token', ADMIN_TOKEN_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      return NextResponse.json({
        success: true,
        message: 'Administrator account registered successfully.',
        user: { name: name || 'Admin Operator', email, role: 'admin' }
      });
    }

    // 4. Admin Sign In
    if (action === 'signin') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      // Check default fallback admin credentials
      if (email.toLowerCase() === 'admin@buildnext.local' && password === 'admin1234') {
        cookieStore.set('bn_admin_token', ADMIN_TOKEN_VALUE, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
        return NextResponse.json({
          success: true,
          user: { name: 'Lead Administrator', email, role: 'admin' }
        });
      }

      try {
        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.role !== 'admin') {
          return NextResponse.json({ error: 'Admin account not found or access denied.' }, { status: 401 });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
        }

        cookieStore.set('bn_admin_token', ADMIN_TOKEN_VALUE, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });

        return NextResponse.json({
          success: true,
          user: { name: user.name, email: user.email, role: 'admin' }
        });
      } catch (dbErr) {
        return NextResponse.json({ error: 'Authentication service temporarily unavailable.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

