import Link from 'next/link'; import { notFound } from 'next/navigation'; import { sampleTracks } from '@/lib/catalog'; import { EnrollButton } from '@/components/enroll-button';
export default function TrackDetail({params}:{params:{id:string}}){const track=sampleTracks.find(x=>x.id===params.id);if(!track)return notFound();return <><Link href="/tracks" className="text-sm text-[#0071e3]">Back to tracks</Link><section className="mt-6 panel p-7 sm:p-10"><p className="text-sm font-medium text-[#0071e3]">{track.category.toUpperCase()} · {track.difficulty.toUpperCase()}</p><h1 className="mt-3 text-3xl font-bold">{track.name}</h1><p className="muted mt-4 max-w-2xl text-lg">{track.description}</p><div className="mt-7 flex flex-wrap gap-4 text-sm"><span>{track.estimatedHours} hours</span><span>{track.modules} guided modules</span></div><EnrollButton trackId={track.id} /></section><section className="mt-9"><h2 className="text-xl font-bold">Course modules</h2><div className="mt-4 divide-y panel">{Array.from({length:track.modules},(_,i)=><div className="flex items-center justify-between p-5" key={i}><div><p className="text-sm font-medium text-[#0071e3]">MODULE {i+1}</p><h3 className="mt-1 font-semibold">{['Foundations and setup','Core concepts','Hands-on practice','Build a portfolio piece'][i%4]}</h3></div><span className="muted text-sm">45 min</span></div>)}</div></section></>}
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Sparkles, Trophy } from 'lucide-react';
import { DataStore } from '@/lib/data-service';
import { EnrollButton } from '@/components/enroll-button';

export default function TrackDetailPage({ params }: { params: { id: string } }) {
  const track = DataStore.getTrackById(params.id);
  if (!track) return notFound();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/tracks"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0071e3] hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all tracks</span>
      </Link>

      {/* Hero Header */}
      <section className="apple-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0071e3]/10 text-[#0071e3]">
            {track.category}
          </span>
          <span className="text-xs text-[var(--muted)]">Level: {track.difficulty}</span>
          <span className="text-xs text-[var(--muted)]">•</span>
          <span className="text-xs text-[var(--muted)]">{track.estimatedHours} Total Hours</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]">
          {track.name}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
          {track.description}
        </p>

        {/* Prerequisites */}
        {track.prerequisites && track.prerequisites.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--line)]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Prerequisites
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {track.prerequisites.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-0.5 rounded-md bg-[var(--surface-2)] text-xs text-[var(--ink)] border border-[var(--line)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <EnrollButton trackId={track.id} />
          <Link
            href="/assessments"
            className="apple-btn-secondary h-10 px-4 rounded-xl text-xs font-medium"
          >
            Take Track Assessment
          </Link>
        </div>
      </section>

      {/* Syllabus / Modules */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--ink)]">Curriculum & Modules</h2>
        <div className="apple-panel rounded-2xl divide-y divide-[var(--line)] overflow-hidden">
          {track.syllabus && track.syllabus.length > 0 ? (
            track.syllabus.map((m, idx) => (
              <div key={m.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0071e3]">MODULE {idx + 1}</span>
                    <span className="text-xs text-[var(--muted)]">({m.duration})</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">{m.title}</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.lessons.map((lesson) => (
                      <span key={lesson} className="text-[11px] text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded">
                        • {lesson}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-[#0071e3]">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>+{m.xp} XP</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[var(--muted)]">
              Core module material is active in the student interactive sandbox.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
