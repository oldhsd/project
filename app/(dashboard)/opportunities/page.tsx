import Image from 'next/image';
import { OpportunityBoard } from '@/components/opportunity-board';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1015] px-6 py-8 sm:px-10 sm:py-10 text-white">
        <Image
          src="/images/buildnext-opportunities-3d.png"
          alt="Career pathway visual"
          fill
          className="object-cover opacity-35"
        />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/10 text-[11px] font-semibold text-[#2997ff] backdrop-blur-xl mb-3">
            <Sparkles className="h-3 w-3" />
            <span>INDUSTRY HIRING PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Internships & Fellowships
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Verified roles with hiring partners like Elite Globex and GeeksforGeeks. Apply directly with your BuildNext project proofs and assessment scores.
          </p>
        </div>
      </section>

      {/* Board */}
      <section>
        <div className="mb-4">
          <p className="apple-eyebrow">OPEN ROLES</p>
          <h2 className="text-xl font-bold text-[var(--ink)]">Curated Opportunities</h2>
        </div>
        <OpportunityBoard />
      </section>
    </div>
  );
}
