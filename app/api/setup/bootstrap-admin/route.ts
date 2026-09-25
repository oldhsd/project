import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { emailSchema, passwordSchema } from '@/lib/content-schema';
import { db } from '@/models';
import { json, fail, ApiError, bodyJson } from '@/lib/http';

// One-time, server-side admin provisioning. Exists ONLY to work around local
// `mongodb+srv://` SRV DNS lookups being blocked (common on some ISPs/networks),
// which prevents `npm run db:bootstrap` from running on a developer machine.
//
// Safety:
// - Requires SETUP_SECRET to be set in the server environment. If it is not
//   set, this route always returns 404 (behaves as if it doesn't exist).
// - Automatically refuses to run once ANY admin account already exists in the
//   database — so it can only ever create the FIRST admin.
// - Never reads/echoes MONGODB_URI, AUTH_SECRET or ADMIN_PASSWORD back to the client.
// - No credentials are hard-coded; everything comes from request body + env.
//
// To remove access afterward: delete SETUP_SECRET from your deployment's env
// vars (or delete this file and redeploy). Either is sufficient.

const bodySchema = z.object({
  setupSecret: z.string().min(1),
  name: z.string().trim().min(2).max(180),
  email: emailSchema,
  password: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret || setupSecret.length < 24) {
      // Not configured (or too weak to trust) -> pretend this route doesn't exist.
      throw new ApiError(404, 'Not found.');
    }

    const input = bodySchema.parse(await bodyJson(request));

    // Constant-time-ish comparison isn't critical here (this isn't a login
    // endpoint used repeatedly), but we still avoid short-circuit leaks.
    if (
      input.setupSecret.length !== setupSecret.length ||
      !timingSafeEqualStr(input.setupSecret, setupSecret)
    ) {
      throw new ApiError(403, 'Invalid setup secret.');
    }

    await connectDB();

    const anyAdminExists = await db.students.exists({ role: 'admin' });
    if (anyAdminExists) {
      throw new ApiError(
        410,
        'Setup already completed. An administrator account already exists; this endpoint is now inert.'
      );
    }

    const existingByEmail = await db.students.findOne({ email: input.email });
    if (existingByEmail) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const password = await bcrypt.hash(input.password, 12);
    const admin = await db.students.create({
      name: input.name,
      email: input.email,
      password,
      role: 'admin',
      isActive: true,
    });

    return json({
      ok: true,
      message:
        'Administrator created. Sign in from the standard sign-in page. Now remove SETUP_SECRET from your environment and redeploy.',
      id: String(admin._id),
      email: admin.email,
    });
  } catch (error) {
    return fail(error);
  }
}

function timingSafeEqualStr(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
