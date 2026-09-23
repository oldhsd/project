import { requireUser } from '@/lib/access';
import { accountSummary, row } from '@/lib/data-service';
import { bodyJson, fail, json, sameOrigin, ApiError } from '@/lib/http';
import { resourceSchemas } from '@/lib/content-schema';
import { db, type DbRow } from '@/models';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    return json(await accountSummary(await requireUser()));
  } catch (error) {
    return fail(error);
  }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const { version, ...data } = resourceSchemas.students
      .omit({ email: true, isActive: true })
      .partial()
      .extend({ version: z.number().int().min(0) })
      .parse(await bodyJson(request));
    const result = await db.students
      .findOneAndUpdate(
        { _id: user._id, __v: version },
        { $set: data, $inc: { __v: 1 } },
        { new: true, runValidators: true }
      )
      .lean<DbRow>();
    if (!result) throw new ApiError(409, 'Your profile changed. Reload it before saving.');
    return json({ profile: row(result) });
  } catch (error) {
    return fail(error);
  }
}
