'use client';
import Link from 'next/link'; import { useState } from 'react'; import { signIn } from 'next-auth/react'; import { useRouter } from 'next/navigation';
export function AuthForm({ signup = false }: { signup?: boolean }) { const router=useRouter(); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setLoading(true); setError(''); const fd=new FormData(e.currentTarget); const email=String(fd.get('email')), password=String(fd.get('password')); if(signup){ const result=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fd.get('name'),email,password,stream:fd.get('stream'),year:fd.get('year'),interests:String(fd.get('interests')).split(',').map(x=>x.trim()).filter(Boolean)})}); if(!result.ok){setError((await result.json()).error);setLoading(false);return;} } const result=await signIn('credentials',{email,password,redirect:false}); if(result?.error){setError('Invalid email or password.');setLoading(false);return;} router.push('/dashboard'); router.refresh(); }
return <form onSubmit={submit} className="space-y-4">{signup&&<><label className="block text-sm font-medium">Name<input required name="name" className="input mt-1" /></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Stream<input required name="stream" placeholder="CSE" className="input mt-1" /></label><label className="text-sm font-medium">Year<select name="year" className="input mt-1"><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option></select></label></div><label className="block text-sm font-medium">Interests<input name="interests" placeholder="AI, design, web" className="input mt-1" /></label></>}<label className="block text-sm font-medium">Email<input required type="email" name="email" className="input mt-1" /></label><label className="block text-sm font-medium">Password<input required minLength={8} type="password" name="password" className="input mt-1" /></label>{error&&<p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="btn btn-primary h-12 w-full">{loading?'Please wait...':signup?'Create account':'Sign in'}</button><p className="text-center text-sm muted">{signup?'Already a member? ':'New to BuildNext? '}<Link className="text-[#0071e3]" href={signup?'/login':'/signup'}>{signup?'Sign in':'Create an account'}</Link></p></form> }

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, User } from 'lucide-react';

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
          interests: String(fd.get('interests')).split(',').map((x) => x.trim()).filter(Boolean)
        })
      });
      if (!result.ok) {
        setError((await result.json()).error);
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

  // 1-Click Fast Student Demo Login
  const handleFastDemoStudent = async () => {
    setLoading(true);
    setError('');
    try {
      // First try signing in with demo account
      const res = await signIn('credentials', {
        email: 'harsh@buildnext.local',
        password: 'password123',
        redirect: false
      });
      if (!res?.error) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // If not registered yet, create demo account then sign in
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
      }
    } catch (err) {
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
              <input
                required
                name="name"
                placeholder="e.g. Harsh Dixit"
                className="apple-input text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">Stream / Branch</label>
                <input
                  required
                  name="stream"
                  placeholder="e.g. CSE / Mechanical"
                  className="apple-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">College Year</label>
                <select name="year" className="apple-input text-xs">
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1">Interests (comma separated)</label>
              <input
                name="interests"
                placeholder="Full Stack, AI, UI Systems"
                className="apple-input text-xs"
              />
            </div>
          </>
        )}

        <div>
          <label className="block font-semibold text-[var(--ink)] mb-1">Email</label>
          <input
            required
            type="email"
            name="email"
            placeholder="student@example.edu"
            className="apple-input text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-[var(--ink)] mb-1">Password</label>
          <input
            required
            minLength={8}
            type="password"
            name="password"
            placeholder="••••••••"
            className="apple-input text-xs"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          disabled={loading}
          className="apple-btn-primary w-full h-10 rounded-xl text-xs font-semibold mt-2 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : signup ? 'Create Student Account' : 'Sign In'}
        </button>
      </form>

      {/* 1-Click Fast Student Demo Button */}
      <div className="pt-2 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={handleFastDemoStudent}
          disabled={loading}
          className="apple-btn-secondary w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
        >
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
