import { auth } from '@/auth'; import { redirect } from 'next/navigation'; import { Shell } from '@/components/shell';
export default async function DashboardLayout({children}:{children:React.ReactNode}){if(!(await auth()))redirect('/login');return <Shell>{children}</Shell>}
