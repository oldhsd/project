'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Award, CheckCircle2, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { Certificate } from '@/lib/data-service';

export default function VerifyPortalPage() {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/content/certificates?id=${encodeURIComponent(certId.trim())}`);
      const data = await res.json();
      if (res.ok && data.certificate) {
        setResult(data.certificate);
      } else {
        setError('No verified credential found for this Certificate ID. Please verify the ID code.');
      }
    } catch (err) {
      setError('Verification service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between selection:bg-[#0071e3] selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0071e3] text-white font-bold text-xs">
            BN
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">BuildNext Credential Registry</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-[#86868b] hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Student Portal</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-4 py-16 max-w-xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium text-[#2997ff] mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Official Verifier</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Verify BuildNext Certificate
          </h1>
          <p className="mt-2 text-xs text-[#86868b]">
            Every certificate issued by BuildNext is backed by verifiable project proofs and assessment records.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleVerify} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#86868b]" />
            <input
              type="text"
              required
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="e.g. BN-2026-WD8921"
              className="w-full rounded-xl border border-white/[0.12] bg-[#141418] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#2997ff]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="apple-btn-primary h-10 px-5 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : 'Verify'}</span>
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#6e6e73]">
          <span>Try sample IDs:</span>
          <button
            type="button"
            onClick={() => setCertId('BN-2026-WD8921')}
            className="text-[#2997ff] hover:underline font-mono"
          >
            BN-2026-WD8921
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setCertId('BN-2026-AI4410')}
            className="text-[#2997ff] hover:underline font-mono"
          >
            BN-2026-AI4410
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Verified Credential Card */}
        {result && (
          <div className="mt-8 rounded-2xl border border-[#2997ff]/30 bg-[#121218] p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">Authentic Credential</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#86868b]">
                      Verified Registry
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#86868b] mt-0.5">ID: {result.certificateId}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/25">
                {result.grade}
              </span>
            </div>

            <div className="py-6 space-y-4 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#86868b]">Conferred To</p>
                <h2 className="mt-1 text-xl font-semibold text-white tracking-tight sm:text-2xl">
                  {result.studentName}
                </h2>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#86868b]">For Mastery in Track</p>
                <h3 className="mt-1 text-base font-semibold text-[#2997ff]">
                  {result.trackName}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06] text-left text-xs">
                <div>
                  <p className="text-[#86868b] text-[11px]">Date Issued</p>
                  <p className="text-white font-medium mt-0.5">{result.issueDate}</p>
                </div>
                <div>
                  <p className="text-[#86868b] text-[11px]">Academic Category</p>
                  <p className="text-white font-medium mt-0.5">{result.category}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#86868b]">
              <span>Issued by BuildNext Community Academic Board</span>
              <span className="text-emerald-400 font-medium">Tamper-Proof Record</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-4 text-center text-xs text-[#6e6e73]">
        BuildNext Student Ecosystem · Verification Service · All rights reserved.
      </footer>
    </div>
  );
}

