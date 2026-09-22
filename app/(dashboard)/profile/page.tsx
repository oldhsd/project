import { auth } from '@/auth';
import { 
  Award, 
  BookOpen, 
  Briefcase, 
  CheckCircle2, 
  Code2, 
  ExternalLink, 
  Flame, 
  Github, 
  Globe, 
  Linkedin, 
  Sparkles, 
  Trophy, 
  UserRound 
} from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();
  const userName = session?.user?.name || 'Harsh Dixit';
  const userEmail = session?.user?.email || 'harsh@buildnext.local';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <section className="apple-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0071e3] text-white text-2xl font-bold shadow-md">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
                  {userName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                  Level 2 Builder
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">{userEmail}</p>
              <p className="text-xs font-medium text-[var(--ink)] mt-1">
                B.Tech Computer Science & Engineering · Year 3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/oldhsd"
              target="_blank"
              rel="noreferrer"
              className="apple-btn-secondary h-9 px-3 rounded-xl text-xs flex items-center gap-1.5"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <Link
              href="/verify/BN-2026-WD8921"
              target="_blank"
              className="apple-btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <span>Public Credential</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="apple-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Cumulative XP</span>
            <Trophy className="h-4 w-4 text-[#ffd60a]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--ink)]">680 XP</p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Top 15% this cohort</p>
        </div>

        <div className="apple-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Verified Credentials</span>
            <Award className="h-4 w-4 text-[#0071e3]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--ink)]">1 Issued</p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Distinction in Web Systems</p>
        </div>

        <div className="apple-card p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Project Proofs</span>
            <Code2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--ink)]">2 Shipped</p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Reviewed by Industry Mentors</p>
        </div>
      </section>

      {/* Badges & Milestones */}
      <section className="apple-panel p-6 rounded-2xl space-y-4">
        <p className="apple-eyebrow">VERIFIED BADGES</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'First Project Shipped', note: 'Portfolio proof verified', icon: Code2, tone: 'text-[#0071e3]' },
            { title: '7-Day Challenge Streak', note: 'Consistent daily problem solve', icon: Flame, tone: 'text-orange-500' },
            { title: 'Assessment Distinction', note: 'Score > 85% in System Design', icon: Award, tone: 'text-[#ffd60a]' }
          ].map(({ title, note, icon: Icon, tone }) => (
            <div key={title} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--ink)]">{title}</p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bio & Skills */}
      <section className="apple-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)]">About & Career Intent</h2>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Focused on building high-performance full stack web systems, distributed microservices, and practical RAG AI workflows. Aiming for product engineering internships at fast-growing technology companies.
        </p>

        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Verified Skill Stack</p>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React Server Components', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'FastAPI', 'System Architecture'].map((s) => (
              <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
