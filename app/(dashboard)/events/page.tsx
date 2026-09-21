export default function Events(){return <><header><p className="text-sm font-medium text-[#0071e3]">COMMUNITY</p><h1 className="mt-2 text-3xl font-bold">Meet the people building next.</h1></header><article className="panel mt-8 p-7"><p className="text-sm font-medium text-[#0071e3]">OCT 04 · ONLINE</p><h2 className="mt-2 text-xl font-bold">BuildNext Product Night</h2><p className="muted mt-3">A practical look at turning student projects into compelling case studies.</p><div className="mt-5 flex items-center justify-between"><span className="muted text-sm">28 / 100 registered</span><button className="btn btn-primary">Register</button></div></article></>}
'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MapPin, 
  Sparkles, 
  Trophy, 
  Users 
} from 'lucide-react';
import { EventItem } from '@/lib/data-service';

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>(['gfg-coding-clash-2026']);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/content/events')
      .then(r => r.json())
      .then(data => {
        if (data.events) setEvents(data.events);
      })
      .catch(console.error);
  }, []);

  const handleRegister = async (eventId: string, title: string) => {
    try {
      const res = await fetch('/api/content/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', eventId })
      });
      if (res.ok) {
        setRegisteredIds([...registeredIds, eventId]);
        setMessage(`You have registered for "${title}". Details sent to your email.`);
        setTimeout(() => setMessage(''), 4500);
      }
    } catch (err) {
      alert('Registration error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <p className="apple-eyebrow">COMPETE & SHOWCASE</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Contests, Hackathons & Masterclasses
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
          National coding contests with GeeksforGeeks, multi-track hackathons with Unstop, and live project demo days with Elite Globex leaders.
        </p>
      </header>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Featured Partner Banner */}
      <div className="apple-panel p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#0071e3]/10 to-transparent border border-[#0071e3]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0071e3] text-white">
                OFFICIAL PARTNERSHIP
              </span>
              <span className="text-xs font-semibold text-[var(--ink)]">GeeksforGeeks x BuildNext</span>
            </div>
            <h2 className="mt-2 text-lg sm:text-xl font-bold text-[var(--ink)]">
              GeeksforGeeks National Coding Clash 2026
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)] max-w-xl">
              Minimum 400 registrations committed. Co-branded participation certificates, course discount coupons, and problem-setter fellowships for top rankers.
            </p>
          </div>
          <button
            onClick={() => handleRegister('gfg-coding-clash-2026', 'GFG National Coding Clash')}
            disabled={registeredIds.includes('gfg-coding-clash-2026')}
            className={`apple-btn h-10 px-5 rounded-xl text-xs font-semibold shrink-0 ${
              registeredIds.includes('gfg-coding-clash-2026')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'apple-btn-primary'
            }`}
          >
            {registeredIds.includes('gfg-coding-clash-2026') ? 'Registered' : 'Register Now'}
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {events.map((ev) => {
          const isRegistered = registeredIds.includes(ev.id);
          return (
            <div
              key={ev.id}
              className="apple-card p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0071e3]">{ev.organizer}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    ev.status === 'Open' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {ev.status}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-[var(--ink)] tracking-tight">
                  {ev.title}
                </h3>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  {ev.description}
                </p>

                {/* Event Metadata */}
                <div className="mt-4 space-y-1.5 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{ev.date} · {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{ev.spotsFilled} / {ev.spotsTotal} students registered ({ev.mode})</span>
                  </div>
                </div>

                {/* Perks */}
                {ev.perks && ev.perks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--line)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Included Perks
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ev.perks.map((p) => (
                        <span key={p} className="text-[11px] text-[var(--ink)] bg-[var(--surface-2)] px-2 py-0.5 rounded">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">{ev.type}</span>
                <button
                  onClick={() => handleRegister(ev.id, ev.title)}
                  disabled={isRegistered}
                  className={`h-8 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isRegistered
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                      : 'apple-btn-primary'
                  }`}
                >
                  {isRegistered ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  <span>{isRegistered ? 'Seat Confirmed' : 'Claim Seat'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
