import { redirect } from 'next/navigation';
export default function LegacyAdminAccess() {
  redirect('/admin-ops');
}
