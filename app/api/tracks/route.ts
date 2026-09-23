import { publicList, adminRequest } from '@/lib/content-api';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return publicList(request, 'tracks');
}
export async function POST(request: Request) {
  return adminRequest(request, 'tracks');
}
