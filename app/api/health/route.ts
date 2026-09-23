import { connectDB } from '@/lib/mongodb';
import { json } from '@/lib/http';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const connection = await connectDB();
    await connection.connection.db!.admin().ping();
    return json({ status: 'ok' });
  } catch {
    return json({ status: 'unavailable' }, 503);
  }
}
