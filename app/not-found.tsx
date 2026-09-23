import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-24">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-4 text-muted-foreground">
        This page may have moved, or the content is not published.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to BuildNext</Link>
      </Button>
    </main>
  );
}
