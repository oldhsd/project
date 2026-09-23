import { publicList, adminRequest } from '@/lib/content-api';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ entity: string }> };
export async function GET(request: Request, context: Context) {
  return publicList(request, (await context.params).entity);
}
// Legacy write URLs remain protected and use the same validation as the admin API.
export async function POST(request: Request, context: Context) {
  return adminRequest(request, (await context.params).entity);
}
export async function PATCH(request: Request, context: Context) {
  return adminRequest(
    request,
    (await context.params).entity,
    new URL(request.url).searchParams.get('id') || undefined
  );
}
export async function DELETE(request: Request, context: Context) {
  return adminRequest(
    request,
    (await context.params).entity,
    new URL(request.url).searchParams.get('id') || undefined
  );
}
