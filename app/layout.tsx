import type { Metadata } from 'next';
import './globals.css';
import { Inter, Sora } from 'next/font/google';
import { Providers } from '@/components/providers';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
export const metadata: Metadata = {
  title: { default: 'BuildNext — Learn and build', template: '%s · BuildNext' },
  description: 'Learning tracks, practical projects and opportunities for students.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
