import { CertificatePortal } from '@/components/certificates';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CertificatePortal key={id} code={id} />;
}
