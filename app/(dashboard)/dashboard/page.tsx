import Image from 'next/image'; import Link from 'next/link'; import { auth } from '@/auth'; import { ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, Sparkles, Trophy } from 'lucide-react';
const stats=[{label:'Learning XP',value:'1,280',delta:'+160 this week',icon:Sparkles,tone:'bg-[var(--accent)]'},{label:'Track progress',value:'42%',delta:'Modern Web Dev',icon:BookOpen,tone:'bg-[var(--lime)]'},{label:'Project streak',value:'05',delta:'days in a row',icon:Trophy,tone:'bg-[var(--coral)]'}];
export default async function Dashboard(){const session=await auth(),name=session?.user?.name?.split(' ')[0]||'Builder';return <div className="space-y-8"><section className="grid-glow relative isolate overflow-hidden rounded-xl border bg-[var(--surface)] px-6 py-8 sm:px-9 sm:py-10"><div className="relative z-10 max-w-xl"><p className="eyebrow">BUILD YOUR NEXT CHAPTER</p><h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Good afternoon, {name}. <span className="text-[var(--accent)]">Make a mark.</span></h1><p className="muted mt-4 max-w-lg leading-7">Your next milestone is closer than it looks. Continue your track, ship a project, or meet a collaborator.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/tracks" className="btn btn-primary">Continue learning <ChevronRight className="h-4 w-4" /></Link><Link href="/opportunities" className="btn btn-secondary">Explore opportunities</Link></div></div><Image priority src="/images/buildnext-learning-3d.png" alt="Abstract 3D learning sculpture" width={1536} height={1024} className="pointer-events-none absolute -right-28 -top-16 hidden h-[130%] w-auto max-w-none opacity-90 mix-blend-screen md:block" /></section><section className="grid gap-3 sm:grid-cols-3">{stats.map(({label,value,delta,icon:Icon,tone})=><article className="panel p-5" key={label}><div className="flex items-start justify-between"><span className="muted text-sm font-semibold">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-lg ${tone} text-[#102027]`}><Icon className="h-4 w-4" /></span></div><p className="mt-6 text-3xl font-black">{value}</p><p className="muted mt-1 text-xs">{delta}</p></article>)}</section><section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.75fr)]"><div className="panel overflow-hidden"><div className="flex items-center justify-between border-b px-6 py-5"><div><p className="eyebrow">CONTINUE</p><h2 className="mt-1 text-xl font-black">Modern Web Development</h2></div><Link href="/tracks/web-development" className="btn btn-secondary min-h-9 px-3"><ArrowUpRight className="h-4 w-4" /></Link></div><div className="p-6"><div className="flex items-center justify-between text-sm"><span className="font-bold">Module 3: Layout systems</span><span className="text-[var(--accent)]">42% complete</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full w-[42%] rounded-full bg-[var(--accent)]" /></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[var(--surface-2)] p-4"><p className="muted text-xs">NEXT LESSON</p><p className="mt-2 text-sm font-bold">Grid architecture</p></div><div className="rounded-lg bg-[var(--surface-2)] p-4"><p className="muted text-xs">ESTIMATE</p><p className="mt-2 text-sm font-bold">24 minutes</p></div><div className="rounded-lg bg-[var(--surface-2)] p-4"><p className="muted text-xs">REWARD</p><p className="mt-2 text-sm font-bold">+40 XP</p></div></div><Link href="/tracks/web-development" className="btn btn-primary mt-5">Resume module <ChevronRight className="h-4 w-4" /></Link></div></div><div className="panel"><div className="border-b px-6 py-5"><p className="eyebrow">UP NEXT</p><h2 className="mt-1 text-xl font-black">Your momentum</h2></div><div className="divide-y">{[['Tonight','Web accessibility quiz',CheckCircle2],['Thu, 6:30 PM','Portfolio review circle',CalendarDays],['Fri','AI internship closes',BriefcaseBusiness]].map(([when,title,Icon])=><div className="flex gap-3 p-4" key={title as string}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold">{title as string}</p><p className="muted mt-1 text-xs">{when as string}</p></div></div>)}</div></div></section><section className="grid gap-5 lg:grid-cols-2"><div><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">DISCOVER</p><h2 className="mt-1 text-2xl font-black">Career moves, curated.</h2></div><Link href="/opportunities" className="text-sm font-bold text-[var(--accent)]">See all</Link></div><Link href="/opportunities" className="group relative block min-h-56 overflow-hidden rounded-xl border bg-[#0f1c24] p-6 text-white"><Image src="/images/buildnext-opportunities-3d.png" alt="Career pathway visual" fill className="object-cover opacity-55 transition duration-500 group-hover:scale-105" /><div className="relative z-10 max-w-xs"><span className="rounded-md bg-white/15 px-2 py-1 text-xs font-bold backdrop-blur">NEW THIS WEEK</span><h3 className="mt-5 text-2xl font-black">Product & AI internship pathways</h3><p className="mt-2 text-sm text-white/75">Filter by your skills, save roles, and track every application.</p></div></Link></div><div><div className="mb-4"><p className="eyebrow">ACTIVITY</p><h2 className="mt-1 text-2xl font-black">Small wins add up.</h2></div><div className="panel divide-y">{['Completed Intro to responsive systems','Earned the First step badge','Saved Applied AI Foundations'].map((item,index)=><div className="flex items-center gap-3 px-5 py-4" key={item}><span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--surface-2)] text-xs font-black text-[var(--accent)]">0{index+1}</span><p className="text-sm font-semibold">{item}</p></div>)}</div></div></section></div>}
import Link from 'next/link';
import { auth } from '@/auth';
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  BriefcaseBusiness, 
  CalendarDays, 
  CheckCircle2, 
  ChevronRight, 
  Code2, 
  Flame, 
  Sparkles, 
  Trophy, 
  UsersRound 
} from 'lucide-react';
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[11px] font-semibold text-[#0071e3]">
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
          { label: 'Verified Proofs', val: '2 Projects', note: 'GitHub Verified', icon: Code2, color: 'text-[#0071e3]' },
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
                Full Stack Engineering & Cloud Systems
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#0071e3]">52% Complete</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Current: Module 3 (Relational DB & PostgreSQL)</span>
              <span>4 / 8 Modules Done</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full w-[52%] rounded-full bg-[#0071e3]" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-1">
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">Next Lesson</p>
              <p className="text-xs font-semibold text-[var(--ink)] mt-1">Indexing & B-Tree Optimization</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">Estimated Time</p>
              <p className="text-xs font-semibold text-[var(--ink)] mt-1">25 Minutes</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
              <p className="text-[10px] text-[var(--muted)] uppercase font-semibold">XP Completion</p>
              <p className="text-xs font-semibold text-[var(--ink)] mt-1">+60 XP</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/tracks/full-stack-engineering"
              className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-medium flex items-center gap-1.5"
            >
              <span>Continue Lesson</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link href="/assessments" className="text-xs text-[#0071e3] hover:underline">
              Test skill signal →
            </Link>
          </div>
        </div>

        {/* Upcoming Competitions & Contests */}
        <div className="apple-panel p-6 rounded-2xl space-y-4">
          <div className="pb-3 border-b border-[var(--line)]">
            <p className="apple-eyebrow">COMPETITIONS</p>
            <h2 className="text-base font-bold text-[var(--ink)] mt-0.5">Upcoming Challenges</h2>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#0071e3]">{ev.organizer}</span>
                  <span className="text-[var(--muted)]">{ev.date}</span>
                </div>
                <h3 className="text-xs font-semibold text-[var(--ink)] mt-1">{ev.title}</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">{ev.time}</p>
              </div>
            ))}
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
          <Link href="/opportunities" className="text-xs font-semibold text-[#0071e3] hover:underline">
            See All Roles ({DataStore.getOpportunities().length}) →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="apple-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0071e3]">{opp.company}</span>
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
                  className="text-xs font-medium text-[#0071e3] hover:underline flex items-center gap-1"
                >
                  <span>Apply</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
