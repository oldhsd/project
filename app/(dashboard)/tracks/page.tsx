import Link from 'next/link'; import { sampleTracks } from '@/lib/catalog';
export default function Tracks(){return <><header className="mb-8"><p className="text-sm font-medium text-[#0071e3]">LEARNING PATHS</p><h1 className="mt-2 text-3xl font-bold">Find your next discipline.</h1><p className="muted mt-2">Focused paths designed to turn curiosity into practical work.</p></header><div className="mb-6 flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search tracks" /><button className="btn btn-secondary">All categories</button><button className="btn btn-secondary">All levels</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sampleTracks.map(track=><article className="panel flex min-h-72 flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg" key={track.id}><div className="flex items-start justify-between"><span className="rounded-apple bg-[#0071e3]/10 px-3 py-1 text-sm font-medium text-[#0071e3]">{track.category}</span><span className="muted text-sm">{track.estimatedHours}h</span></div><h2 className="mt-7 text-xl font-bold">{track.name}</h2><p className="muted mt-3 text-sm leading-6">{track.description}</p><div className="mt-auto flex items-center justify-between pt-6"><span className="text-sm">{track.modules} modules · {track.difficulty}</span><Link className="text-sm font-semibold text-[#0071e3]" href={`/tracks/${track.id}`}>Explore</Link></div></article>)}</div></>}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  BookOpen, 
  Brain, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Figma, 
  FileText, 
  Layers, 
  Search, 
  TrendingUp 
} from 'lucide-react';
import { Track } from '@/lib/data-service';

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/tracks')
      .then(r => r.json())
      .then(data => {
        if (data.tracks) setTracks(data.tracks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    'All',
    'Technology',
    'AI & Data',
    'Design',
    'Business',
    'Finance',
    'Core Engineering',
    'Career & Research'
  ];

  const filtered = tracks.filter((t) => {
    const matchCat = category === 'All' || t.category === category;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <header>
        <p className="apple-eyebrow">MULTI-DISCIPLINARY CURRICULUM</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Explore Learning Tracks
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl">
          BuildNext is stream-agnostic. Choose any track regardless of your college branch, earn verified project proofs, and unlock internship pathways.
        </p>
      </header>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                category === c
                  ? 'bg-[#0071e3] text-white shadow-sm font-semibold'
                  : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="apple-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="apple-card p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                  {t.category}
                </span>
                <span className="text-[11px] text-[var(--muted)]">{t.difficulty}</span>
              </div>

              <h2 className="mt-4 text-base font-bold text-[var(--ink)] tracking-tight">
                {t.name}
              </h2>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                {t.description}
              </p>

              {/* Module Outline */}
              <div className="mt-4 space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Modules</p>
                {t.syllabus && t.syllabus.slice(0, 2).map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5 text-xs text-[var(--ink)] font-medium">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{m.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--muted)]">
                {t.estimatedHours} hrs · {t.modulesCount || t.syllabus?.length || 4} modules
              </span>
              <Link
                href={`/tracks/${t.id}`}
                className="text-xs font-semibold text-[#0071e3] hover:underline flex items-center gap-1"
              >
                <span>Syllabus & Start</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
