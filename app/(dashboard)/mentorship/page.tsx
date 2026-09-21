import { CalendarDays, MessageSquareText, Star, UsersRound } from 'lucide-react';
const mentors=[['Ananya Mehta','Product design · UX research','Wednesday, 6:30 PM'],['Kabir Shah','Frontend engineering · React','Thursday, 7:00 PM'],['Nisha Rao','Data analytics · storytelling','Saturday, 11:00 AM']];
export default function Mentorship(){return <div><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">CONNECT</p><h1 className="mt-2 text-3xl font-black">Build with people ahead of you.</h1><p className="muted mt-2">Request a review, join office hours, or find the right mentor for your next step.</p></div><button className="btn btn-primary"><MessageSquareText className="h-4 w-4" />Ask for guidance</button></header><section className="mt-8 grid gap-4 md:grid-cols-3">{mentors.map(([name,expertise,time],index)=><article className="panel p-5" key={name}><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--surface-2)] font-black text-[var(--accent)]">{name.charAt(0)}</span><span className="flex items-center gap-1 text-xs font-bold text-[var(--coral)]"><Star className="h-3.5 w-3.5 fill-current" />4.{9-index}</span></div><h2 className="mt-5 font-black">{name}</h2><p className="muted mt-1 text-sm">{expertise}</p><p className="mt-5 flex items-center gap-2 text-xs font-semibold"><CalendarDays className="h-3.5 w-3.5 text-[var(--accent)]" />{time}</p><button className="btn btn-secondary mt-5 w-full">Request session</button></article>)}</section><section className="panel mt-7 p-6"><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--lime)] text-[#2c400d]"><UsersRound className="h-5 w-5" /></span><div><p className="eyebrow">PEER CIRCLE</p><h2 className="mt-1 text-xl font-black">Portfolio review circle</h2><p className="muted mt-2 text-sm">Four open seats · Thursday · share work, get clear feedback, leave with next steps.</p><button className="btn btn-primary mt-5">Join circle</button></div></div></section></div>}
'use client';

import { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Star, 
  UsersRound, 
  X 
} from 'lucide-react';
import { initialMentors, Mentor } from '@/lib/data-service';

export default function MentorshipPage() {
  const [mentors] = useState<Mentor[]>(initialMentors);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [doubtModal, setDoubtModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookedSessions, setBookedSessions] = useState([
    {
      mentorName: 'Ananya Deshmukh (Google)',
      slot: 'Saturday, 11:00 AM',
      topic: 'Distributed Systems & Indexing Concurrency',
      status: 'Confirmed'
    }
  ]);
  const [doubtText, setDoubtText] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);

  const handleConfirmBooking = () => {
    if (!bookingMentor || !selectedSlot) return;
    setBookedSessions([
      {
        mentorName: `${bookingMentor.name} (${bookingMentor.company})`,
        slot: selectedSlot,
        topic: '1-on-1 Architecture & Career Review',
        status: 'Confirmed'
      },
      ...bookedSessions
    ]);
    setBookingMentor(null);
    setSelectedSlot('');
  };

  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    setDoubtSubmitted(true);
    setTimeout(() => {
      setDoubtModal(false);
      setDoubtSubmitted(false);
      setDoubtText('');
      alert('Your technical doubt has been submitted to the mentor review queue.');
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="apple-eyebrow">INDUSTRY GUIDANCE</p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
            Mentorship & Technical Advisory
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Get 1-on-1 feedback on your project architecture, code reviews, and career direction from senior engineers at leading tech firms.
          </p>
        </div>

        <button
          onClick={() => setDoubtModal(true)}
          className="apple-btn-primary h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Ask a Technical Doubt</span>
        </button>
      </header>

      {/* Booked Sessions */}
      {bookedSessions.length > 0 && (
        <section className="apple-panel p-5 rounded-2xl space-y-3">
          <p className="apple-eyebrow">UPCOMING SESSIONS</p>
          <div className="divide-y divide-[var(--line)]">
            {bookedSessions.map((s, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-[var(--ink)]">{s.topic}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">With {s.mentorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#0071e3]" />
                    <span>{s.slot}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mentors Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {mentors.map((m) => (
          <div
            key={m.id}
            className="apple-card p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3]">
                  {m.company}
                </span>
                <span className="text-[11px] text-[var(--muted)]">{m.experience}</span>
              </div>

              <h2 className="mt-4 text-base font-bold text-[var(--ink)]">
                {m.name}
              </h2>
              <p className="text-xs font-semibold text-[#0071e3] mt-0.5">{m.role} · {m.company}</p>
              <p className="text-[11px] text-[var(--muted)] font-medium mt-1">{m.domain}</p>

              <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">
                {m.bio}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--muted)]">{m.availableSlots.length} slots available</span>
              <button
                onClick={() => setBookingMentor(m)}
                className="apple-btn-primary h-8 px-3 rounded-lg text-xs font-semibold"
              >
                Book 1:1 Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="apple-eyebrow">BOOK ADVISORY SESSION</span>
                <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">
                  Session with {bookingMentor.name}
                </h3>
                <p className="text-xs text-[var(--muted)]">{bookingMentor.role} at {bookingMentor.company}</p>
              </div>
              <button onClick={() => setBookingMentor(null)} className="p-1 text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-semibold text-[var(--ink)]">Select Available Slot</p>
              <div className="grid gap-2">
                {bookingMentor.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition ${
                      selectedSlot === slot
                        ? 'border-[#0071e3] bg-[#0071e3]/10 text-[var(--ink)] font-semibold'
                        : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setBookingMentor(null)} className="apple-btn-secondary h-8 px-3 rounded-xl text-xs">
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedSlot}
                className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOUBT SUBMISSION MODAL */}
      {doubtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="apple-eyebrow">TECHNICAL DOUBT ENGINE</span>
                <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">Ask the Mentor Queue</h3>
              </div>
              <button onClick={() => setDoubtModal(false)} className="p-1 text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAskDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted)] mb-1 font-medium">Describe your architecture doubt or bug</label>
                <textarea
                  required
                  rows={4}
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  placeholder="e.g. In my Next.js App Router project, I am seeing cache hydration issues when streaming data..."
                  className="apple-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDoubtModal(false)} className="apple-btn-secondary h-8 px-3 rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={doubtSubmitted} className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-semibold">
                  {doubtSubmitted ? 'Submitting...' : 'Send to Mentors'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
