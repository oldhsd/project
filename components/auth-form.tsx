'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/primitives';
import { api, ClientError } from '@/lib/client';
export function AuthForm({
  signup = false,
  returnTo = '/dashboard',
}: {
  signup?: boolean;
  returnTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email')).trim().toLowerCase();
    const password = String(form.get('password'));
    try {
      if (signup)
        await api('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            name: form.get('name'),
            email,
            password,
            stream: form.get('stream'),
            year: Number(form.get('year')),
            interests: [],
          }),
        });
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error)
        throw new ClientError(
          signup
            ? 'Your account was created, but sign-in was not completed. Please sign in again.'
            : 'Sign-in failed. Check your details or try again later.'
        );
      const target =
        returnTo.startsWith('/') && !returnTo.startsWith('//') && !returnTo.includes('\\')
          ? returnTo
          : '/dashboard';
      router.push(target);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not complete sign-in.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {signup && (
        <>
          <Field htmlFor="name" label="Full name">
            <Input
              id="name"
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={180}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field htmlFor="stream" label="Study stream">
              <Input id="stream" name="stream" maxLength={300} />
            </Field>
            <Field htmlFor="year" label="Study year">
              <Select id="year" name="year">
                {Array.from({ length: 4 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Year {i + 1}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </>
      )}
      <Field htmlFor="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
      </Field>
      <Field
        htmlFor="password"
        label="Password"
        hint={signup ? 'Use at least 12 characters (up to 72 UTF-8 bytes).' : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          minLength={signup ? 12 : 8}
          maxLength={72}
          required
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Submitting…' : signup ? 'Create account' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {signup ? 'Already have an account? ' : 'New to BuildNext? '}
        <Link
          href={signup ? '/login' : '/signup'}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {signup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
    </form>
  );
}
