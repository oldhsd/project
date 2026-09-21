'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Award, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Certificate } from '@/lib/data-service';

export default function DirectCertificateVerifyPage() {
  const params = useParams();
  const certId = params.id as string;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!certId) return;
    fetch(`/api/content/certificates?id=${encodeURIComponent(certId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.certificate) {
          setCert(data.certificate);
        } else {
          setError('Credential not found or has been revoked.');
        }
      })
      .catch(() => setError('Verification server unavailable.'))
      .finally(() => setLoading(false));
  }, [certId]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between selection:bg-[#0071e3] selection:text-white">
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <Link href="/verify" className="flex items-center gap-2">
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

      <main className="px-4 py-16 max-w-xl mx-auto w-full">
        {loading && (
          <div className="text-center text-xs text-[#86868b]">
            Verifying cryptographic credential on BuildNext registry...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-xs text-red-300">
            <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <Link href="/verify" className="mt-4 inline-block text-[#2997ff] underline">
              Return to search
            </Link>
          </div>
        )}

        {cert && (
          <div className="rounded-2xl border border-[#2997ff]/30 bg-[#121218] p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">Authentic & Verified</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#86868b]">
                      Official Proof
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#86868b] mt-0.5">ID: {cert.certificateId}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/25">
                {cert.grade}
              </span>
            </div>

            <div className="py-8 space-y-4 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#86868b]">Conferred To</p>
                <h1 className="mt-1 text-2xl font-bold text-white tracking-tight sm:text-3xl">
                  {cert.studentName}
                </h1>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#86868b]">For Mastery in Track</p>
                <h2 className="mt-1 text-lg font-semibold text-[#2997ff]">
                  {cert.trackName}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.06] text-left text-xs">
                <div>
                  <p className="text-[#86868b] text-[11px]">Issue Date</p>
                  <p className="text-white font-medium mt-0.5">{cert.issueDate}</p>
                </div>
                <div>
                  <p className="text-[#86868b] text-[11px]">Academic Category</p>
                  <p className="text-white font-medium mt-0.5">{cert.category}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#86868b]">
              <span>BuildNext Academic Verification Board</span>
              <span className="text-emerald-400 font-medium">Valid Credential</span>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.08] px-6 py-4 text-center text-xs text-[#6e6e73]">
        BuildNext Student Ecosystem · Official Verification Registry
      </footer>
    </div>
  );
}

