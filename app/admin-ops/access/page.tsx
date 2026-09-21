'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, KeyRound, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminAccessPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Authenticated. Directing to Operations Studio...');
        setTimeout(() => router.push('/admin-ops'), 600);
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Network error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name, email, password, passcode })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Administrator account provisioned! Entering Operations Studio...');
        setTimeout(() => router.push('/admin-ops'), 700);
      } else {
        setError(data.error || 'Registration failed. Check your security key.');
      }
    } catch (err) {
      setError('Unable to register administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo_login' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Demo session active. Opening Operations Studio...');
        setTimeout(() => router.push('/admin-ops'), 400);
      } else {
        setError('Failed to initiate demo session.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#0071e3] selection:text-white">
      {/* Top Discreet Breadcrumb */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium tracking-wide text-[#86868b] backdrop-blur-xl">
          <ShieldCheck className="h-3.5 w-3.5 text-[#2997ff]" />
          <span>Restricted Operational Endpoint</span>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          BuildNext Command Gateway
        </h1>
        <p className="mt-1.5 text-xs text-[#86868b] max-w-sm mx-auto">
          Administrative control center for platform curriculum, partner opportunities, and student pipeline.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0e0e12]/90 p-7 shadow-2xl backdrop-blur-3xl">
        {/* Apple Segment Control */}
        <div className="flex rounded-xl bg-white/[0.06] p-1 border border-white/[0.06] mb-6">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              tab === 'signin'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
              tab === 'signup'
                ? 'bg-white/15 text-white shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-white'
            }`}
          >
            Register Administrator
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@buildnext.local"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-[#2997ff] focus:bg-white/[0.07]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-[#2997ff] focus:bg-white/[0.07]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-10 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ED] transition duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations'}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Sign Up with Security Passcode */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Harsh Dixit (Lead Admin)"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-[#2997ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-1">
                Admin Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="harsh@buildnext.local"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-[#2997ff]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868b] uppercase tracking-wider mb-1">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 outline-none transition focus:border-[#2997ff]"
              />
            </div>

            <div className="rounded-xl border border-[#2997ff]/20 bg-[#0071e3]/10 p-3">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2997ff] uppercase tracking-wider mb-1">
                <KeyRound className="h-3.5 w-3.5" />
                Admin Security Key
              </label>
              <input
                type="text"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="BUILDNEXT-ADMIN-2026"
                className="w-full rounded-lg border border-white/[0.15] bg-black/60 px-3 py-1.5 text-xs text-white font-mono placeholder:text-neutral-600 outline-none focus:border-[#2997ff]"
              />
              <p className="mt-1 text-[10px] text-[#86868b]">
                Key for evaluation demo: <code className="text-white font-mono">BUILDNEXT-ADMIN-2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-10 rounded-xl bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ED] transition duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{loading ? 'Registering...' : 'Provision Admin Account'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0e0e12] px-2 text-[#6e6e73]">Client Evaluation Fast-Track</span>
          </div>
        </div>

        {/* 1-Click Demo Evaluation Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full h-10 rounded-xl border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white transition flex items-center justify-center gap-2 group"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#ffd60a] transition-transform group-hover:scale-110" />
          <span>Launch Operations Studio (1-Click Demo)</span>
          <ArrowRight className="h-3 w-3 text-[#86868b] transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Return to student experience */}
        <div className="mt-5 text-center">
          <Link
            href="/dashboard"
            className="text-[11px] text-[#86868b] hover:text-white transition underline-offset-4 hover:underline"
          >
            ← Return to BuildNext Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

