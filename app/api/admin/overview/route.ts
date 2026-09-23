import { requireAdmin } from '@/lib/access';
import { overview } from '@/lib/data-service';
import { fail, json } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await requireAdmin();
    return json({ counts: await overview() });
  } catch (error) {
    return fail(error);
  }
}
