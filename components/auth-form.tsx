'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, Sparkles, User } from 'lucide-react';

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const password = String(fd.get('password'));

    if (signup) {
      const result = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email,
          password,
          stream: fd.get('stream'),
          year: fd.get('year'),
          interests: String(fd.get('interests')).split(',').map((v) => v.trim()).filter(Boolean)
        })
      });
      if (!result.ok) {
        const payload = await result.json();
        setError(payload.error || 'Signup failed.');
        setLoading(false);
        return;
      }
    }

    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  const handleFastDemoStudent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        email: 'harsh@buildnext.local',
        password: 'password123',
        redirect: false
      });
      if (!res?.error) {
        router.push('/dashboard');
        router.refresh();
        return;
      }
      // If demo user does not exist, create it then sign in
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Harsh Dixit',
          email: 'harsh@buildnext.local',
          password: 'password123',
          stream: 'Computer Science & Engineering',
          year: 3,
          interests: ['Web', 'Cloud Systems', 'AI']
        })
      });
      await signIn('credentials', {
        email: 'harsh@buildnext.local',
        password: 'password123',
        redirect: false
      });
      router.push('/dashboard');
      router.refresh();
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-3.5 text-xs">
        {signup && (
          <>
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--muted)]" />
                <input name="name" required placeholder="e.g. Harsh Dixit" className="apple-input pl-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">Stream</label>
                <input name="stream" required placeholder="CSE" className="apple-input text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">Year</label>
                <select name="year" className="apple-input text-xs">
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1">Interests</label>
              <input name="interests" placeholder="Full Stack, AI, UI Systems" className="apple-input text-xs" />
            </div>
          </>
        )}
        <div>
          <label className="block font-semibold text-[var(--ink)] mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--muted)]" />
            <input required type="email" name="email" placeholder="student@example.edu" className="apple-input pl-8 text-xs" />
          </div>
        </div>
        <div>
          <label className="block font-semibold text-[var(--ink)] mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--muted)]" />
            <input required minLength={8} type="password" name="password" placeholder="••••••••" className="apple-input pl-8 text-xs" />
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button disabled={loading} className="apple-btn-primary w-full h-10 rounded-xl text-xs font-semibold mt-2 disabled:opacity-50 flex items-center justify-center gap-1.5">
          <span>{loading ? 'Please wait...' : signup ? 'Create Student Account' : 'Sign In'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>
      <div className="pt-2 border-t border-[var(--line)]">
        <button type="button" onClick={handleFastDemoStudent} disabled={loading} className="apple-btn-secondary w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#ffd60a]" />
          <span>1-Click Student Demo Access</span>
        </button>
      </div>
      <p className="text-center text-xs text-[var(--muted)] pt-1">
        {signup ? 'Already have an account? ' : 'New to BuildNext? '}
        <Link className="text-[#0071e3] font-semibold hover:underline" href={signup ? '/login' : '/signup'}>
          {signup ? 'Sign In' : 'Create an Account'}
        </Link>
      </p>
    </div>
  );
}
