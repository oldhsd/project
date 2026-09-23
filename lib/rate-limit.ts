import { createHash } from 'node:crypto';
import { connectDB } from '@/lib/mongodb';
import { RateLimit } from '@/models';
import { ApiError } from '@/lib/http';

/** Database-backed fixed windows work across application instances. Keys contain no raw email/IP. */
export async function rateLimit(scope: string, identity: string, max: number, seconds = 900) {
  await connectDB();
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const id = createHash('sha256').update(`${scope}:${identity}:${bucket}`).digest('hex');
  let record;
  try {
    record = await RateLimit.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * seconds * 1000) } },
      { upsert: true, new: true }
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    record = await RateLimit.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { new: true });
  }
  if (!record || record.count > max)
    throw new ApiError(429, 'Too many requests. Please try again later.');
}
export function clientKey(request: Request) {
  return process.env.TRUST_PROXY === 'true'
    ? request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    : 'shared';
}
