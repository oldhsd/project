import { redirect } from 'next/navigation';
import { pageUser } from '@/lib/access';
import { Shell } from '@/components/shell';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await pageUser('/admin-ops');
  if (user.role !== 'admin') redirect('/dashboard');
  return (
    <Shell admin user={{ name: String(user.name), role: 'admin' }}>
      {children}
    </Shell>
  );
}
