import { ContentDetail } from '@/components/content-detail';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentDetail key={id} resource="opportunities" id={id} />;
}
