import { AuthForm } from '@/components/auth-form';
import { Brand, ThemeToggle } from '@/components/shell';
import { Card } from '@/components/ui/primitives';
export const metadata = { title: 'Sign in' };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12"
    >
      <div className="mb-8 flex items-center justify-between">
        <Brand />
        <ThemeToggle />
      </div>
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to continue your learning or manage BuildNext.
        </p>
        <AuthForm returnTo={next} />
      </Card>
    </main>
  );
}
