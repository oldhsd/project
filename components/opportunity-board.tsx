'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, MapPin, Send, SlidersHorizontal } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

// Unified Opportunity type
export type Opportunity = {
  _id?: string; // from DB
  id?: string;   // seeded data uses id
  title: string;
  company: string;
  type: string;
  location: string;
  mode: string;
  description: string;
  skills: string[];
  eligibility?: string;
  deadline?: string;
  featured?: boolean;
  stipend?: string;
  partnerBadge?: string;
};

// Seeded demo data (used when API is unavailable)
const seeded: Opportunity[] = [
  {
    id: 'design-intern',
    title: 'Product Design Intern',
    company: 'Luma Labs',
    type: 'Internship',
    location: 'Bengaluru',
    mode: 'Hybrid',
    description: 'Work with a small product team on research, interaction systems, and a live student‑facing product.',
    skills: ['Figma', 'Research', 'UI systems'],
    featured: true,
    stipend: '₹15k / month',
    deadline: '18 Aug',
    partnerBadge: 'Featured'
  },
  {
    id: 'ai-fellow',
    title: 'Applied AI Fellow',
    company: 'Northstar',
    type: 'Fellowship',
    location: 'Remote',
    mode: 'Remote',
    description: 'Build practical AI workflows with mentors and publish a portfolio‑ready capstone.',
    skills: ['Python', 'LLMs', 'Problem solving'],
    stipend: 'Stipend available',
    deadline: '22 Aug'
  },
  {
    id: 'community-challenge',
    title: 'Community Challenge 04',
    company: 'BuildNext',
    type: 'Competition',
    location: 'Online',
    mode: 'Online',
    description: 'Form a cross‑disciplinary crew and solve a real workflow challenge in 72 hours.',
    skills: ['Collaboration', 'Pitching', 'Build'],
    stipend: 'Prize pool',
    deadline: '30 Aug'
  }
];

export function OpportunityBoard() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Opportunity[]>(seeded);
  const [filter, setFilter] = useState('All');
  const [activeModal, setActiveModal] = useState<Opportunity | null>(null);
  const [consent, setConsent] = useState(true);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [applying, setApplying] = useState(false);

  // Load opportunities from API, fallback to seeded data
  useEffect(() => {
    fetch('/api/content/opportunities')
      .then((r) => r.json())
      .then((data) => {
        if (data.opportunities) setItems(data.opportunities);
      })
      .catch(() => setItems(seeded));
  }, []);

  const visible = filter === 'All' ? items : items.filter((i) => i.type === filter);

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
        setAppliedIds((cur) => [...cur, activeModal.id as string]);
        setStatusMessage(`Application submitted to ${activeModal.company}! Status: Under Review.`);
        setActiveModal(null);
        setTimeout(() => setStatusMessage(''), 5000);
      } else {
        alert(data.error || 'Failed to submit application.');
      }
    } catch {
      alert('Application server error.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-[var(--muted)]" />
        {['All', 'Internship', 'Fellowship', 'Competition', 'Job'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === type ? 'bg-[#0071e3] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Opportunities Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((item, index) => {
          const isApplied = appliedIds.includes(item.id as string);
          return (
            <motion.article
              key={item.id || item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
                <p className="mt-4 text-xs text-[var(--muted)] leading-relaxed line-clamp-3">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[11px] font-medium text-[var(--ink)]">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs muted">
                  <MapPin className="h-3.5 w-3.5" />{item.location}
                </span>
                <button
                  onClick={() => setActiveModal(item)}
                  disabled={isApplied}
                  className="btn btn-primary min-h-9 px-3"
                >
                  {isApplied ? 'Applied' : 'Apply'} {isApplied ? <ArrowRight className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Modal for detailed view & consent */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">{activeModal.title}</h3>
            <p className="mb-4 text-sm text-[var(--muted)]">{activeModal.description}</p>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span className="text-sm">I consent to share my profile with {activeModal.company}</span>
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setActiveModal(null)} className="btn btn-secondary min-h-9 px-3">Cancel</button>
              <button onClick={handleApply} disabled={applying || !consent} className="btn btn-primary min-h-9 px-3">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
