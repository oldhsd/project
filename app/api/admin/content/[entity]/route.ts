import { adminRequest } from '@/lib/content-api';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ entity: string }> };
export async function GET(request: Request, context: Context) {
  return adminRequest(request, (await context.params).entity);
}
export async function POST(request: Request, context: Context) {
  return adminRequest(request, (await context.params).entity);
}
