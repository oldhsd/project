import bcrypt from 'bcryptjs';
import { resourceSchemas, passwordSchema } from '@/lib/content-schema';
import { db } from '@/models';
import { bodyJson, fail, json, sameOrigin } from '@/lib/http';
import { clientKey, rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const data = resourceSchemas.students
      .omit({ isActive: true })
      .extend({ password: passwordSchema })
      .parse(await bodyJson(request));
    await rateLimit('signup', clientKey(request), 30);
    const user = await db.students.create({
      ...data,
      role: 'student',
      isActive: true,
      password: await bcrypt.hash(data.password, 12),
    });
    return json({ id: String(user._id) }, 201);
  } catch (error) {
    return fail(error);
  }
}
