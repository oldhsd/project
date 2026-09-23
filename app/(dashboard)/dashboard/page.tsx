import { pageUser } from '@/lib/access';
import { AccountDashboard } from '@/components/account-dashboard';
export default async function Page() {
  await pageUser('/dashboard');
  return <AccountDashboard />;
}
