import { AssessmentRunner } from '@/components/assessment-runner';
export default function Assessments(){return <div><header className="mb-8"><p className="eyebrow">ASSESS</p><h1 className="mt-2 text-3xl font-black">Practice with proof.</h1><p className="muted mt-2">Short, focused assessments turn learning activity into an actionable skill signal.</p></header><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><AssessmentRunner /><aside className="panel h-fit p-5"><p className="eyebrow">SKILL SIGNALS</p><h2 className="mt-2 text-lg font-black">What this measures</h2><ul className="muted mt-5 space-y-3 text-sm"><li>Layout systems</li><li>Accessibility basics</li><li>Product judgement</li></ul><div className="mt-6 rounded-lg bg-[var(--surface-2)] p-4"><p className="text-xs font-bold">UP NEXT</p><p className="mt-2 text-sm">JavaScript data flows</p></div></aside></div></div>}
import { Award, Brain, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AssessmentsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <p className="apple-eyebrow">SKILL BENCHMARKING</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Practice with Verified Proof
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
          Rigorous assessments turn learning activity into actionable skill signals for partner hiring reviews (Elite Globex, GeeksforGeeks).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <AssessmentRunner />
        </div>

        <aside className="space-y-4">
          <div className="apple-panel p-5 rounded-2xl">
            <p className="apple-eyebrow">SKILL SIGNALS</p>
            <h2 className="mt-1 text-sm font-bold text-[var(--ink)]">Measured Competencies</h2>
            <ul className="mt-4 space-y-2.5 text-xs text-[var(--muted)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Distributed Systems & Caching</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Next.js RSC Architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Database Index Optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>RAG & Dense Vector Retrieval</span>
              </li>
            </ul>
          </div>

          <div className="apple-panel p-5 rounded-2xl bg-[var(--surface-2)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--ink)]">
              <Award className="h-4 w-4 text-[#ffd60a]" />
              <span>Partner Review Ready</span>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              Achieving 70%+ automatically flags your profile to hiring recruiters on Elite Globex and GFG.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
