import { notFound } from 'next/navigation';
import { AdminStudio } from '@/components/admin-studio';
import { isResource } from '@/lib/content-schema';
export default async function AdminCollection({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  if (!isResource(entity)) notFound();
  return <AdminStudio key={entity} resource={entity} />;
}
