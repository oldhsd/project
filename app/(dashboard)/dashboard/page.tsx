import Image from 'next/image'; import Link from 'next/link'; import { auth } from '@/auth'; import { ArrowUpRight, ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, Sparkles, Trophy, Flame, Code2 } from 'lucide-react';
const stats=[{label:'Learning XP',value:'1,280',delta:'+160 this week',icon:Sparkles,tone:'bg-[var(--accent)]'},{label:'Track progress',value:'42%',delta:'Modern Web Dev',icon:BookOpen,tone:'bg-[var(--lime)]'},{label:'Project streak',value:'05',delta:'days in a row',icon:Trophy,tone:'bg-[var(--coral)]'}];
import { DataStore } from '@/lib/data-service';

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name?.split(' ')[0] || 'Builder';

  const tracks = DataStore.getTracks();
  const opportunities = DataStore.getOpportunities().slice(0, 3);
  const events = DataStore.getEvents().slice(0, 2);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Apple-styled Hero Greeting */}
      <section className="apple-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[#e8590c]">
            <Sparkles className="h-3 w-3" />
            <span>BUILDNEXT STUDENT HUB</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
            Welcome back, {userName}.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Your active pathway: <span className="text-[var(--ink)] font-semibold">Full Stack Engineering & Cloud Systems</span>. 4 modules remaining for certified completion.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/tracks/full-stack-engineering" className="apple-btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span>Resume Module 3</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/opportunities" className="apple-btn-secondary h-9 px-4 rounded-xl text-xs font-medium">
              Browse Elite Globex Internships
            </Link>
          </div>
        </div>
      </section>

      {/* Real Metric Highlights */}
      <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Learning XP', val: '680 XP', note: 'Level 2 · Builder', icon: Trophy, color: 'text-[#ffd60a]' },
          { label: 'Weekly Streak', val: '5 Days', note: 'Consistent Builder', icon: Flame, color: 'text-orange-500' },
          { label: 'Verified Proofs', val: '2 Projects', note: 'GitHub Verified', icon: Code2, color: 'text-[#e8590c]' },
          { label: 'Active Pipeline', val: '1 Application', note: 'Under Review', icon: BriefcaseBusiness, color: 'text-emerald-500' }
        ].map(({ label, val, note, icon: Icon, color }) => (
          <div key={label} className="apple-card p-4 rounded-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)] font-medium">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="mt-3 text-xl font-bold text-[var(--ink)] tracking-tight">{val}</p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">{note}</p>
          </div>
        ))}
      </section>

      {/* Main Grid: Track Progress & Next Milestone */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Track In-Progress */}
        <div className="lg:col-span-2 apple-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <p className="apple-eyebrow">IN PROGRESS</p>
              <h2 className="text-base font-bold text-[var(--ink)] mt-0.5">
                {tracks.length > 0 ? tracks[0].name : 'No active tracks yet'}
              </h2>
            </div>
            {tracks.length > 0 && <span className="text-xs font-semibold text-[#e8590c]">0% Complete</span>}
          </div>

          {tracks.length > 0 ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Current: Module 1 ({tracks[0].syllabus?.[0]?.title || 'Getting Started'})</span>
                  <span>0 / {tracks[0].modulesCount || tracks[0].syllabus?.length || 0} Modules Done</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <div className="h-full w-0 rounded-full bg-[#e8590c]" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 pt-1">
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">Next Lesson</p>
                  <p className="text-xs font-semibold text-[var(--ink)] mt-1 line-clamp-1">{tracks[0].syllabus?.[0]?.lessons?.[0] || 'Start learning'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">Estimated Time</p>
                  <p className="text-xs font-semibold text-[var(--ink)] mt-1">{tracks[0].syllabus?.[0]?.duration || '0 hrs'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
                  <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">XP Completion</p>
                  <p className="text-xs font-semibold text-[var(--ink)] mt-1">+{tracks[0].syllabus?.[0]?.xp || 0} XP</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/tracks/${tracks[0].id}`}
                  className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-medium flex items-center gap-1.5"
                >
                  <span>Start Lesson</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/assessments" className="text-xs text-[#e8590c] hover:underline">
                  Test skill signal →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--muted)]">Start by creating tracks from the Admin panel.</p>
            </div>
          )}
        </div>

        {/* Upcoming Competitions & Contests */}
        <div className="apple-panel p-6 rounded-2xl space-y-4">
          <div className="pb-3 border-b border-[var(--line)]">
            <p className="apple-eyebrow">COMPETITIONS</p>
            <h2 className="text-base font-bold text-[var(--ink)] mt-0.5">Upcoming Challenges</h2>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? events.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#e8590c]">{ev.organizer}</span>
                  <span className="text-[var(--muted)]">{ev.date}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--ink)] mt-1">{ev.title}</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{ev.time}</p>
              </div>
            )) : (
              <p className="text-xs text-[var(--muted)] text-center py-4">No events scheduled yet.</p>
            )}
          </div>

          <Link
            href="/events"
            className="apple-btn-secondary w-full h-8 rounded-xl text-xs flex items-center justify-center gap-1"
          >
            <span>View All Competitions</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Partner Opportunities Spotlight (Elite Globex, GFG) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="apple-eyebrow">INDUSTRY PIPELINE</p>
            <h2 className="text-lg font-bold text-[var(--ink)]">Curated Internship Roles</h2>
          </div>
          <Link href="/opportunities" className="text-xs font-semibold text-[#e8590c] hover:underline">
            See All Roles ({DataStore.getOpportunities().length}) →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {opportunities.length > 0 ? opportunities.map((opp) => (
            <div key={opp.id} className="apple-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#e8590c]">{opp.company}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                    {opp.mode}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--ink)] mt-2">{opp.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{opp.description}</p>
                <p className="text-xs font-semibold text-[var(--ink)] mt-3">{opp.stipend}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">Deadline: {opp.deadline}</span>
                <Link
                  href="/opportunities"
                  className="text-xs font-medium text-[#e8590c] hover:underline flex items-center gap-1"
                >
                  <span>Apply</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center py-10 apple-card rounded-2xl border-dashed">
              <p className="text-sm text-[var(--muted)]">No opportunities published yet. Start posting from the admin panel.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
