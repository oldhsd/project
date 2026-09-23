import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/models';
import { connectDB } from '@/lib/mongodb';
import { ApiError } from '@/lib/http';

/** Re-read active status and role on every request; a stale JWT never grants admin access. */
export const currentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id || !/^[a-f\d]{24}$/i.test(session.user.id)) return null;
  await connectDB();
  return db.students.findOne({ _id: session.user.id, isActive: true }).lean();
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new ApiError(401, 'Sign in to continue.');
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') throw new ApiError(403, 'Administrator access is required.');
  return user;
}
export async function pageUser(path: string) {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  return user;
}
