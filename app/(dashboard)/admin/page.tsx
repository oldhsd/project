import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminStudio } from '@/components/admin-studio';

export default async function Admin() {
  const session = await auth();

  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">ADMIN STUDIO</p>
        <h1 className="mt-2 text-3xl font-black">Shape the community.</h1>
        <p className="muted mt-2">
          Publish opportunities today. Content operations are ready to expand into tracks, events, and resources.
        </p>
      </header>
      <AdminStudio />
    </div>
  );
}
