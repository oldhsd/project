import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { initialTracks } from '@/lib/data-service';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] selection:bg-[#0071e3] selection:text-white">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.08] bg-[#000000]/70 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0071e3] text-white font-semibold text-xs shadow-sm">
            BN
          </div>
          <span className="font-semibold tracking-tight text-sm text-white">BuildNext</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs text-[#86868b]">
          <Link href="/tracks" className="hover:text-white transition">Curriculum</Link>
          <Link href="/assessments" className="hover:text-white transition">Assessments</Link>
          <Link href="/projects" className="hover:text-white transition">Projects</Link>
          <Link href="/events" className="hover:text-white transition">Competitions</Link>
          <Link href="/opportunities" className="hover:text-white transition">Internships</Link>
          <Link href="/verify" className="hover:text-white transition">Verify Credential</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs text-[#86868b] hover:text-white transition">Sign In</Link>
          <Link href="/signup" className="apple-btn-primary h-8 px-4 rounded-full text-xs font-semibold">Get Started</Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] text-xs font-medium text-[#2997ff] backdrop-blur-xl mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Multi-Disciplinary Student Ecosystem</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
          Skills that prove the work.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed">
          From verified learning tracks to live industry internships with Elite Globex and national coding contests on GeeksforGeeks. Built for every student, every stream.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/dashboard" className="apple-btn-primary h-11 px-6 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#0071e3]/20">
            <span>Enter Student Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/tracks" className="apple-btn-secondary h-11 px-6 rounded-full text-sm font-medium border border-white/[0.15] bg-white/[0.06] hover:bg-white/[0.1] text-white">
            Explore 8 Disciplinary Tracks
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          {[
            { label: 'Multi-Disciplinary Tracks', val: '8 Tracks' },
            { label: 'Partner Opportunities', val: '₹30k /mo' },
            { label: 'Contest Registrations', val: '400+ GFG' },
            { label: 'Verified Certificates', val: '100% Valid' }
          ].map(({ label, val }) => (
            <div key={label} className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <p className="text-lg sm:text-xl font-bold text-white tracking-tight">{val}</p>
              <p className="text-xs text-[#86868b] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/[0.08] max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="apple-eyebrow">STREAM-AGNOSTIC CURRICULUM</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">Designed for what you want to build.</h2>
          <p className="mt-3 text-xs sm:text-sm text-[#86868b]">
            Whether you study Computer Science, Mechanical Engineering, Commerce, or Design, BuildNext creates tailored pathways for your ambition.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialTracks.slice(0, 6).map((track) => (
            <div key={track.id} className="rounded-2xl border border-white/[0.08] bg-[#0d0d11] p-6 hover:border-[#2997ff]/40 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2997ff] px-2.5 py-1 rounded-full bg-[#0071e3]/15">
                    {track.category}
                  </span>
                  <span className="text-xs text-[#6e6e73]">{track.difficulty}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white tracking-tight">{track.name}</h3>
                <p className="mt-2 text-xs text-[#86868b] leading-relaxed line-clamp-3">{track.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#6e6e73]">{track.estimatedHours} hrs · {track.modulesCount} modules</span>
                <Link href={`/tracks/${track.id}`} className="text-[#2997ff] font-medium hover:underline flex items-center gap-1">
                  <span>View Track</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/[0.08] bg-[#0a0a0e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="apple-eyebrow">INDUSTRY ALLIANCES</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Official Partners & Direct Hiring Pathways</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-400">GeeksforGeeks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">Contests</span>
              </div>
              <p className="mt-3 text-xs text-[#86868b]">National coding clash with 400+ participants, co-branded participation certificates, and problem-setter fellowships.</p>
              <div className="mt-4 text-xs font-semibold text-white">400+ Guaranteed Registrations</div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#2997ff]">Elite Globex</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071e3]/15 text-[#2997ff]">Internships</span>
              </div>
              <p className="mt-3 text-xs text-[#86868b]">Direct pipeline into full stack and applied AI research roles with stipends up to ₹30,000/month.</p>
              <div className="mt-4 text-xs font-semibold text-white">Pre-Placement Offers (PPOs)</div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#121218] p-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#ffd60a]">Unstop</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300">Hackathons</span>
              </div>
              <p className="mt-3 text-xs text-[#86868b]">48-hour innovation challenges with ₹1,50,000 prize pools, mentor reviews, and verified profile credentials.</p>
              <div className="mt-4 text-xs font-semibold text-white">National Innovation Challenge</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/[0.08] text-center max-w-3xl mx-auto">
        <ShieldCheck className="h-10 w-10 text-[#2997ff] mx-auto mb-4" />
        <h2 className="text-3xl font-bold tracking-tight text-white">Every achievement is publicly verifiable.</h2>
        <p className="mt-3 text-xs sm:text-sm text-[#86868b]">
          Employers and academic partners can verify authentic credentials using our tamper-proof verification engine.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/verify" className="apple-btn-secondary h-10 px-5 rounded-full text-xs font-medium border border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1]">
            Check Certificate Registry
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] py-8 px-6 text-center text-xs text-[#6e6e73]">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/tracks" className="hover:text-white">Tracks</Link>
          <Link href="/opportunities" className="hover:text-white">Opportunities</Link>
          <Link href="/verify" className="hover:text-white">Verify</Link>
          <Link href="/login" className="hover:text-white">Login</Link>
        </div>
        <p>© 2026 BuildNext Community. Learn · Build · Collaborate · Contribute · Lead.</p>
      </footer>
    </div>
  );
}

