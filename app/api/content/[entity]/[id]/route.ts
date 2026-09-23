import { publicDetail } from '@/lib/content-api';
export const dynamic = 'force-dynamic';
export async function GET(
  request: Request,
  context: { params: Promise<{ entity: string; id: string }> }
) {
  const p = await context.params;
  return publicDetail(request, p.entity, p.id);
}
