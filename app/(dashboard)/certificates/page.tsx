'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ExternalLink, QrCode, Search, ShieldCheck } from 'lucide-react';
import { Certificate } from '@/lib/data-service';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/certificates')
      .then(r => r.json())
      .then(data => {
        if (data.certificates) setCertificates(data.certificates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="apple-eyebrow">ACCREDITATION & PROOFS</p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Verified Credentials & Certificates
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Every certificate awarded on BuildNext is linked to a cryptographic identifier and verifiable by corporate hiring partners.
          </p>
        </div>

        <Link
          href="/verify"
          className="apple-btn-secondary h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Search className="h-3.5 w-3.5 text-[#0071e3]" />
          <span>Public Verification Registry</span>
        </Link>
      </header>

      {/* Certificates List */}
      <div className="grid gap-6 md:grid-cols-2">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="apple-card p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top Seal */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">BuildNext Verified</span>
                    <p className="font-mono text-xs font-bold text-[var(--ink)]">{cert.certificateId}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/25">
                  {cert.grade}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Conferred To</p>
                <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">{cert.studentName}</h3>
                <p className="text-xs font-semibold text-[#0071e3] mt-2">{cert.trackName}</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Domain: {cert.category}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">Issued: {cert.issueDate}</span>
              <Link
                href={`/verify/${cert.certificateId}`}
                target="_blank"
                className="apple-btn-primary h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>View Public Proof</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
