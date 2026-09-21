'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, MapPin, Send, SlidersHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Send, 
  ShieldCheck, 
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';
import { Opportunity } from '@/lib/data-service';

type Opportunity = { _id?: string; title: string; company: string; type: string; location: string; mode: string; description: string; skills: string[]; eligibility?: string; deadline?: string; featured?: boolean };
const seeded: Opportunity[] = [{ title: 'Product Design Intern', company: 'Luma Labs', type: 'Internship', location: 'Bengaluru', mode: 'Hybrid', description: 'Work with a small product team on research, interaction systems, and a live student-facing product.', skills: ['Figma', 'Research', 'UI systems'], featured: true }, { title: 'Applied AI Fellow', company: 'Northstar', type: 'Fellowship', location: 'Remote', mode: 'Remote', description: 'Build practical AI workflows with mentors and publish a portfolio-ready capstone.', skills: ['Python', 'LLMs', 'Problem solving'] }, { title: 'Community Challenge 04', company: 'BuildNext', type: 'Competition', location: 'Online', mode: 'Online', description: 'Form a cross-disciplinary crew and solve a real workflow challenge in 72 hours.', skills: ['Collaboration', 'Pitching', 'Build'] }];
export function OpportunityBoard() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [filter, setFilter] = useState('All');
  const [activeModal, setActiveModal] = useState<Opportunity | null>(null);
  const [consent, setConsent] = useState(true);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [applying, setApplying] = useState(false);

export function OpportunityBoard() { const [items, setItems] = useState<Opportunity[]>(seeded); const [filter, setFilter] = useState('All'); const [applied, setApplied] = useState<string | null>(null); const [message, setMessage] = useState(''); useEffect(() => { fetch('/api/opportunities').then(r => r.ok ? r.json() : []).then(data => { if (data.length) setItems(data); }).catch(() => undefined); }, []); const visible = filter === 'All' ? items : items.filter(item => item.type === filter); async function apply(item: Opportunity) { if (!item._id) { setMessage('This featured opportunity is a preview. Admin-published roles can be applied to here.'); return; } const response = await fetch(`/api/opportunities/${item._id}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consent: true }) }); setMessage(response.ok ? 'Application sent. Your profile was shared with your consent.' : (await response.json()).error); if (response.ok) setApplied(item._id); }
return <><div className="mb-6 flex flex-wrap items-center gap-2"><SlidersHorizontal className="h-4 w-4 muted" />{['All', 'Internship', 'Fellowship', 'Competition', 'Job'].map(type => <button key={type} onClick={() => setFilter(type)} className={`btn min-h-9 px-3 ${filter === type ? 'btn-primary' : 'btn-secondary'}`}>{type}</button>)}</div>{message && <p className="mb-4 rounded-lg border border-[var(--accent)]/30 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-3 text-sm">{message}</p>}<div className="grid gap-4 lg:grid-cols-2">{visible.map((item, index) => <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .05 }} className="panel relative overflow-hidden p-6" key={item._id || item.title}>{item.featured && <span className="absolute right-4 top-4 rounded-md bg-[var(--lime)] px-2 py-1 text-[10px] font-black text-[#24320c]">FEATURED</span>}<div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]"><Building2 className="h-5 w-5" /></span><div><p className="text-lg font-black">{item.title}</p><p className="muted text-sm">{item.company} · {item.mode}</p></div></div><p className="muted mt-5 text-sm leading-6">{item.description}</p><div className="mt-5 flex flex-wrap gap-2">{item.skills.map(skill => <span key={skill} className="rounded-md bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold">{skill}</span>)}</div><div className="mt-6 flex items-center justify-between"><span className="flex items-center gap-1 text-xs muted"><MapPin className="h-3.5 w-3.5" />{item.location}</span><button onClick={() => apply(item)} disabled={applied === item._id} className="btn btn-primary min-h-9 px-3">{applied === item._id ? 'Applied' : 'Apply'} {applied === item._id ? <ArrowUpRight className="h-4 w-4" /> : <Send className="h-4 w-4" />}</button></div></motion.article>)}</div></> }
  useEffect(() => {
    fetch('/api/content/opportunities')
      .then(r => r.json())
      .then(data => {
        if (data.opportunities) setItems(data.opportunities);
      })
      .catch(console.error);
  }, []);

  const visible = filter === 'All' ? items : items.filter(item => item.type === filter);

  const handleApply = async () => {
    if (!activeModal) return;
    if (!consent) {
      alert('Please check the consent box to share your verified BuildNext profile with the partner.');
      return;
    }

    setApplying(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/content/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: activeModal.id,
          roleTitle: activeModal.title,
          company: activeModal.company,
          studentName: session?.user?.name || 'Harsh Dixit',
          studentEmail: session?.user?.email || 'harsh@buildnext.local',
          stream: 'Computer Science & Engineering',
          year: 3,
          consentGranted: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        setAppliedIds([...appliedIds, activeModal.id]);
        setStatusMessage(`Application submitted to ${activeModal.company}! Status: Under Review.`);
        setActiveModal(null);
        setTimeout(() => setStatusMessage(''), 5000);
      } else {
        alert(data.error || 'Failed to submit application.');
      }
    } catch (err) {
      alert('Application server error.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-[var(--muted)]" />
        {['All', 'Internship', 'Fellowship', 'Competition', 'Job'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === type
                ? 'bg-[#0071e3] text-white shadow-sm'
                : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((item) => {
          const isApplied = appliedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="apple-card p-6 rounded-2xl flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0071e3]/10 text-[#0071e3] font-semibold text-xs shrink-0">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[var(--ink)]">{item.title}</h2>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-[var(--ink)]">{item.company}</span>
                        <span>•</span>
                        <span>{item.mode}</span>
                      </div>
                    </div>
                  </div>

                  {item.partnerBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 shrink-0">
                      {item.partnerBadge}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[11px] font-medium text-[var(--ink)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--ink)]">{item.stipend}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Deadline: {item.deadline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal(item)}
                    className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => setActiveModal(item)}
                    disabled={isApplied}
                    className={`h-8 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      isApplied
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'apple-btn-primary'
                    }`}
                  >
                    {isApplied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                    <span>{isApplied ? 'Applied' : 'Apply'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* APPLICATION MODAL WITH EXPLICIT CONSENT */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="apple-eyebrow">{activeModal.company}</span>
                <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5">{activeModal.title}</h3>
                <p className="text-xs text-[var(--muted)]">{activeModal.location} ({activeModal.mode}) • {activeModal.stipend}</p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--muted)] space-y-3 max-h-60 overflow-y-auto pr-1">
              <div>
                <p className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider mb-1">About the Role</p>
                <p className="leading-relaxed">{activeModal.description}</p>
              </div>

              {activeModal.responsibilities && activeModal.responsibilities.length > 0 && (
                <div>
                  <p className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider mb-1">Key Deliverables</p>
                  <ul className="space-y-1 pl-3 list-disc">
                    {activeModal.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <p className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider mb-1">Eligibility</p>
                <p>{activeModal.eligibility}</p>
              </div>
            </div>

            {/* Explicit Consent Box (Mandated by PDF Blueprint) */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#0071e3]"
                />
                <span className="text-[11px] text-[var(--ink)] leading-snug">
                  I give explicit consent to share my verified BuildNext student profile, assessment scores, and project proofs with <strong>{activeModal.company}</strong> for candidate evaluation.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="apple-btn-secondary h-9 px-4 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !consent || appliedIds.includes(activeModal.id)}
                className="apple-btn-primary h-9 px-5 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
