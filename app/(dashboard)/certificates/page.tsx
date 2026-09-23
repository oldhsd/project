import { pageUser } from '@/lib/access';
import { MyCertificates } from '@/components/certificates';
export default async function Page() {
  await pageUser('/certificates');
  return <MyCertificates />;
}
