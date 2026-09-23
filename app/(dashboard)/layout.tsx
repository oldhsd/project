import { currentUser } from '@/lib/access';
import { Shell } from '@/components/shell';
export const dynamic = 'force-dynamic';
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <Shell user={user ? { name: String(user.name), role: String(user.role) } : null}>
      {children}
    </Shell>
  );
}
