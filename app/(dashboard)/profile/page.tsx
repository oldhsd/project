import { pageUser } from '@/lib/access';
import { ProfileEditor } from '@/components/profile-editor';
export default async function Page() {
  await pageUser('/profile');
  return <ProfileEditor />;
}
