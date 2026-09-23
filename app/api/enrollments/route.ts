import { requireUser } from '@/lib/access';
import { enroll } from '@/lib/student-actions';
import { bodyJson, fail, json, sameOrigin } from '@/lib/http';
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    return json({ item: await enroll(user, await bodyJson(request)) });
  } catch (error) {
    return fail(error);
  }
}
