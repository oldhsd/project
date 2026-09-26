import { requireUser } from '@/lib/access';
import { completeLesson, uncompleteLesson } from '@/lib/student-actions';
import { bodyJson, fail, json, sameOrigin } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    await rateLimit('student-actions', String(user._id), 120, 60);
    return json({ item: await completeLesson(user, (await context.params).id) });
  } catch (error) {
    return fail(error);
  }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    await rateLimit('student-actions', String(user._id), 120, 60);
    return json({ item: await uncompleteLesson(user, (await context.params).id) });
  } catch (error) {
    return fail(error);
  }
}
