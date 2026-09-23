import { adminRequest } from '@/lib/content-api';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ entity: string; id: string }> };
async function handle(request: Request, context: Context) {
  const p = await context.params;
  return adminRequest(request, p.entity, p.id);
}
export const GET = handle;
export const PATCH = handle;
export const DELETE = handle;
