import type { Metadata } from 'next'; import './globals.css'; import { Providers } from '@/components/providers';
export const metadata: Metadata = { title: 'BuildNext', description: 'A multi-disciplinary student learning ecosystem' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>; }
