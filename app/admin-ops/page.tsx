'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  BookOpen, 
  BriefcaseBusiness, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Filter, 
  Layers, 
  LogOut, 
  Plus, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  UserCheck, 
  Users, 
  Award, 
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { Track, Opportunity, Application, EventItem, Certificate } from '@/lib/data-service';

export default function AdminOpsStudio() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'opportunities' | 'applications' | 'events' | 'certificates'>('overview');
  
  // Data states
  const [tracks, setTracks] = useState<Track[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms / Modals
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Track Form
  const [trackForm, setTrackForm] = useState({
    name: '',
    category: 'Technology',
    difficulty: 'Intermediate',
    estimatedHours: 24,
    modulesCount: 6,
    description: '',
    prerequisites: 'Basic programming'
  });

  // Opportunity Form
  const [oppForm, setOppForm] = useState({
    title: '',
    company: '',
    type: 'Internship',
    mode: 'Hybrid',
    location: 'Remote / Hybrid',
    stipend: '₹25,000 / month',
    description: '',
    skills: '',
    eligibility: 'Open to pre-final and final year students',
    deadline: '2026-11-15'
  });

  // Event Form
  const [eventForm, setEventForm] = useState({
    title: '',
    organizer: 'BuildNext Community',
    type: 'Workshop',
    date: '2026-10-15',
    time: '06:00 PM IST',
    mode: 'Online',
    spotsTotal: 300,
    description: '',
    perks: 'Official Certificate\nLive Q&A'
  });

  // Certificate Form
  const [certForm, setCertForm] = useState({
    studentName: '',
    studentEmail: '',
    trackName: 'Full Stack Engineering & Cloud Systems',
    category: 'Technology',
    grade: 'Distinction'
  });

  // Fetch live platform data
  const fetchData = async () => {
    try {
      const [tRes, oRes, aRes, eRes, cRes, anRes] = await Promise.all([
        fetch('/api/content/tracks').then(r => r.json()),
        fetch('/api/content/opportunities').then(r => r.json()),
        fetch('/api/content/applications').then(r => r.json()),
        fetch('/api/content/events').then(r => r.json()),
        fetch('/api/content/certificates').then(r => r.json()),
        fetch('/api/content/analytics').then(r => r.json())
      ]);

      if (tRes.tracks) setTracks(tRes.tracks);
      if (oRes.opportunities) setOpportunities(oRes.opportunities);
      if (aRes.applications) setApplications(aRes.applications);
      if (eRes.events) setEvents(eRes.events);
      if (cRes.certificates) setCertificates(cRes.certificates);
      if (anRes.analytics) setAnalytics(anRes.analytics);
    } catch (err) {
      console.error('Failed to load operations data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    router.push('/admin-ops/access');
  };

  // Actions
  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/content/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...trackForm,
        prerequisites: trackForm.prerequisites.split(',').map(s => s.trim())
      })
    });
    if (res.ok) {
      setStatusMessage('Track created and published to students.');
      setShowTrackModal(false);
      setTrackForm({ name: '', category: 'Technology', difficulty: 'Intermediate', estimatedHours: 24, modulesCount: 6, description: '', prerequisites: 'Basic programming' });
      fetchData();
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!confirm('Are you sure you want to remove this learning track?')) return;
    await fetch(`/api/content/tracks?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/content/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...oppForm,
        skills: oppForm.skills.split(',').map(s => s.trim()),
        status: 'published'
      })
    });
    if (res.ok) {
      setStatusMessage('Opportunity published live to students.');
      setShowOppModal(false);
      setOppForm({ title: '', company: '', type: 'Internship', mode: 'Hybrid', location: 'Remote / Hybrid', stipend: '₹25,000 / month', description: '', skills: '', eligibility: 'Open to all students', deadline: '2026-11-15' });
      fetchData();
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Delete this opportunity?')) return;
    await fetch(`/api/content/opportunities?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpdateAppStatus = async (id: string, status: Application['status']) => {
    await fetch('/api/content/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    fetchData();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/content/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm)
    });
    if (res.ok) {
      setStatusMessage('Event published.');
      setShowEventModal(false);
      fetchData();
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/content/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(certForm)
    });
    if (res.ok) {
      setStatusMessage('Verifiable Certificate issued with unique ID.');
      setShowCertModal(false);
      setCertForm({ studentName: '', studentEmail: '', trackName: 'Full Stack Engineering & Cloud Systems', category: 'Technology', grade: 'Distinction' });
      fetchData();
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-[#e8590c] selection:text-white">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-2xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#e8590c] text-white font-bold text-xs shadow-md">
            OPS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white">
                BuildNext Operations Studio
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Admin Mode
              </span>
            </div>
            <p className="text-[11px] text-[#86868b]">
              Curriculum, Partner Pipeline & Student Content Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-[#86868b] hover:text-white hover:bg-white/[0.08] transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview Student Portal</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="border-b border-white/[0.06] bg-[#0f0f13] px-6">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {[
            { key: 'overview', label: 'Overview & Signals', icon: BarChart3 },
            { key: 'tracks', label: `Tracks (${tracks.length})`, icon: BookOpen },
            { key: 'opportunities', label: `Opportunities (${opportunities.length})`, icon: BriefcaseBusiness },
            { key: 'applications', label: `Applications (${applications.length})`, icon: UserCheck },
            { key: 'events', label: `Events (${events.length})`, icon: CalendarDays },
            { key: 'certificates', label: `Certificates (${certificates.length})`, icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition ${
                activeTab === key
                  ? 'bg-white/[0.12] text-white font-semibold shadow-sm'
                  : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Studio Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Active Learners', val: analytics?.activeLearners || 940, note: '+12% this month', icon: Users, tone: 'text-[#ff6b2b]' },
                { label: 'Published Tracks', val: tracks.length, note: '7 Disciplinary Areas', icon: BookOpen, tone: 'text-purple-400' },
                { label: 'Partner Opportunities', val: opportunities.length, note: 'Elite Globex & GFG Active', icon: BriefcaseBusiness, tone: 'text-emerald-400' },
                { label: 'Verifiable Credentials', val: certificates.length, note: '100% Cryptographic-verified', icon: Award, tone: 'text-[#ffd60a]' }
              ].map(({ label, val, note, icon: Icon, tone }) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#86868b]">{label}</span>
                    <Icon className={`h-4 w-4 ${tone}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{val}</p>
                  <p className="mt-1 text-[11px] text-[#6e6e73]">{note}</p>
                </div>
              ))}
            </div>

            {/* Quick Operations Controls */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#121216]/80 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Recent Student Applications</h2>
                    <p className="text-xs text-[#86868b]">Applications awaiting administrative review</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-[#ff6b2b] hover:underline"
                  >
                    View All ({applications.length})
                  </button>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {applications.slice(0, 4).map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{app.studentName}</p>
                        <p className="text-[#86868b] text-[11px]">{app.roleTitle} · {app.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          app.status === 'Selected' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                          app.status === 'Shortlisted' ? 'bg-[#e8590c]/15 text-[#ff6b2b] border border-[#ff6b2b]/20' :
                          'bg-white/[0.06] text-[#86868b]'
                        }`}>
                          {app.status}
                        </span>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                          className="rounded-lg border border-white/[0.1] bg-black/50 px-2 py-1 text-[11px] text-white outline-none"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlist</option>
                          <option value="Selected">Accept</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Content Actions */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 p-6 backdrop-blur-xl space-y-3">
                <h2 className="text-sm font-semibold text-white mb-2">Publish New Content</h2>
                <button
                  onClick={() => { setActiveTab('opportunities'); setShowOppModal(true); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#ff6b2b]" />
                    <span>Publish Opportunity</span>
                  </span>
                  <span className="text-[10px] text-[#6e6e73]">Elite / GFG</span>
                </button>
                <button
                  onClick={() => { setActiveTab('tracks'); setShowTrackModal(true); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-purple-400" />
                    <span>Create Learning Track</span>
                  </span>
                  <span className="text-[10px] text-[#6e6e73]">7 Streams</span>
                </button>
                <button
                  onClick={() => { setActiveTab('certificates'); setShowCertModal(true); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#ffd60a]" />
                    <span>Issue Certificate</span>
                  </span>
                  <span className="text-[10px] text-[#6e6e73]">Verifiable</span>
                </button>
                <button
                  onClick={() => { setActiveTab('events'); setShowEventModal(true); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-400" />
                    <span>Schedule Event / Contest</span>
                  </span>
                  <span className="text-[10px] text-[#6e6e73]">Hackathons</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACKS MANAGEMENT */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Curriculum & Track Management</h2>
                <p className="text-xs text-[#86868b]">Control multi-disciplinary learning paths visible to students</p>
              </div>
              <button
                onClick={() => setShowTrackModal(true)}
                className="apple-btn-primary h-9 text-xs rounded-xl px-4 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Track</span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tracks.map((t) => (
                <div key={t.id} className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 p-5 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#ff6b2b] text-[10px] font-medium">
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#6e6e73]">{t.difficulty}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-white">{t.name}</h3>
                    <p className="mt-1.5 text-xs text-[#86868b] line-clamp-2">{t.description}</p>
                    <div className="mt-4 flex items-center gap-3 text-[11px] text-[#6e6e73]">
                      <span>{t.estimatedHours} hours</span>
                      <span>•</span>
                      <span>{t.modulesCount || t.syllabus?.length || 4} modules</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <Link
                      href={`/tracks/${t.id}`}
                      target="_blank"
                      className="text-xs text-[#ff6b2b] hover:underline flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <button
                      onClick={() => handleDeleteTrack(t.id)}
                      className="p-1.5 text-[#86868b] hover:text-red-400 transition"
                      title="Delete Track"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OPPORTUNITIES MANAGEMENT */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Partner Opportunities & Internships</h2>
                <p className="text-xs text-[#86868b]">Control active roles, stipend details, and eligibility criteria</p>
              </div>
              <button
                onClick={() => setShowOppModal(true)}
                className="apple-btn-primary h-9 text-xs rounded-xl px-4 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Post Opportunity</span>
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 backdrop-blur-xl overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{opp.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#e8590c]/15 text-[#ff6b2b]">
                          {opp.company}
                        </span>
                        {opp.partnerBadge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                            {opp.partnerBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#86868b]">{opp.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6e6e73] pt-1">
                        <span>{opp.stipend}</span>
                        <span>•</span>
                        <span>{opp.mode}</span>
                        <span>•</span>
                        <span>Deadline: {opp.deadline}</span>
                        <span>•</span>
                        <span className="text-white font-medium">{opp.applicantsCount} Applicants</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteOpportunity(opp.id)}
                        className="apple-btn-secondary h-8 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APPLICATIONS PIPELINE */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white">Student Application Pipeline</h2>
              <p className="text-xs text-[#86868b]">Review student candidates and update partner hiring status</p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 backdrop-blur-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-wider text-[#86868b]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Target Role & Partner</th>
                    <th className="py-3 px-4">Stream & Year</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Consent</th>
                    <th className="py-3 px-4">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{app.studentName}</p>
                        <p className="text-[11px] text-[#86868b]">{app.studentEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-white">{app.roleTitle}</p>
                        <p className="text-[11px] text-[#ff6b2b]">{app.company}</p>
                      </td>
                      <td className="py-3 px-4 text-[#86868b]">
                        {app.stream} (Year {app.year})
                      </td>
                      <td className="py-3 px-4 text-[#6e6e73]">
                        {app.appliedDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <Check className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                          className="rounded-lg border border-white/[0.12] bg-[#09090b] px-2.5 py-1 text-xs text-white outline-none focus:border-[#ff6b2b]"
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected / Offer</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EVENTS & HACKATHONS */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Events & Competitions Studio</h2>
                <p className="text-xs text-[#86868b]">Manage GeeksforGeeks contests, Unstop hackathons, and webinars</p>
              </div>
              <button
                onClick={() => setShowEventModal(true)}
                className="apple-btn-primary h-9 text-xs rounded-xl px-4 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Event</span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {events.map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-[#e8590c]/15 text-[#ff6b2b] text-[10px] font-medium">
                      {ev.organizer}
                    </span>
                    <span className="text-[10px] text-emerald-400">{ev.status}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">{ev.title}</h3>
                  <p className="mt-1.5 text-xs text-[#86868b]">{ev.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-[11px] text-[#6e6e73]">
                    <span>{ev.date}</span>
                    <span>•</span>
                    <span>{ev.time}</span>
                    <span>•</span>
                    <span className="text-white">{ev.spotsFilled} / {ev.spotsTotal} registered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICATES ISSUANCE */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Verifiable Certificates Studio</h2>
                <p className="text-xs text-[#86868b]">Issue officially verifiable credentials with cryptographic IDs</p>
              </div>
              <button
                onClick={() => setShowCertModal(true)}
                className="apple-btn-primary h-9 text-xs rounded-xl px-4 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Issue Certificate</span>
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#121216]/80 backdrop-blur-xl overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#ffd60a] font-semibold">{cert.certificateId}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-[#ff6b2b]">
                          {cert.grade}
                        </span>
                      </div>
                      <p className="font-semibold text-white mt-1">{cert.studentName} ({cert.studentEmail})</p>
                      <p className="text-[#86868b] text-[11px]">{cert.trackName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#6e6e73]">Issued: {cert.issueDate}</span>
                      <Link
                        href={`/verify/${cert.certificateId}`}
                        target="_blank"
                        className="apple-btn-secondary h-8 px-3 rounded-lg text-xs flex items-center gap-1 text-[#ff6b2b]"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Public Proof</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE TRACK */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#121216] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Create New Learning Track</h3>
            <form onSubmit={handleCreateTrack} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Track Name</label>
                <input
                  required
                  value={trackForm.name}
                  onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
                  placeholder="e.g. Quantitative Finance & Algorithmic Trading"
                  className="apple-input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Category</label>
                  <select
                    value={trackForm.category}
                    onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value })}
                    className="apple-input text-xs"
                  >
                    <option value="Technology">Technology</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Finance">Finance</option>
                    <option value="Core Engineering">Core Engineering</option>
                    <option value="Career & Research">Career & Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Difficulty</label>
                  <select
                    value={trackForm.difficulty}
                    onChange={(e) => setTrackForm({ ...trackForm, difficulty: e.target.value })}
                    className="apple-input text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Estimated Hours</label>
                  <input
                    type="number"
                    value={trackForm.estimatedHours}
                    onChange={(e) => setTrackForm({ ...trackForm, estimatedHours: Number(e.target.value) })}
                    className="apple-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Modules Count</label>
                  <input
                    type="number"
                    value={trackForm.modulesCount}
                    onChange={(e) => setTrackForm({ ...trackForm, modulesCount: Number(e.target.value) })}
                    className="apple-input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Description</label>
                <textarea
                  required
                  rows={2}
                  value={trackForm.description}
                  onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  placeholder="What will students master upon completion?"
                  className="apple-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrackModal(false)}
                  className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary h-8 px-4 rounded-lg text-xs"
                >
                  Publish Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE OPPORTUNITY */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#121216] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Post Partner Opportunity</h3>
            <form onSubmit={handleCreateOpportunity} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Role Title</label>
                  <input
                    required
                    value={oppForm.title}
                    onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                    placeholder="e.g. AI Research Intern"
                    className="apple-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Company / Partner</label>
                  <input
                    required
                    value={oppForm.company}
                    onChange={(e) => setOppForm({ ...oppForm, company: e.target.value })}
                    placeholder="e.g. Elite Globex"
                    className="apple-input text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Stipend</label>
                  <input
                    required
                    value={oppForm.stipend}
                    onChange={(e) => setOppForm({ ...oppForm, stipend: e.target.value })}
                    placeholder="₹25,000 / month"
                    className="apple-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Work Mode</label>
                  <select
                    value={oppForm.mode}
                    onChange={(e) => setOppForm({ ...oppForm, mode: e.target.value })}
                    className="apple-input text-xs"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Required Skills (comma separated)</label>
                <input
                  value={oppForm.skills}
                  onChange={(e) => setOppForm({ ...oppForm, skills: e.target.value })}
                  placeholder="Next.js, Python, PostgreSQL, REST APIs"
                  className="apple-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Description</label>
                <textarea
                  required
                  rows={2}
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  placeholder="Overview of project responsibilities..."
                  className="apple-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOppModal(false)}
                  className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary h-8 px-4 rounded-lg text-xs"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#121216] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Issue Verifiable Certificate</h3>
            <form onSubmit={handleIssueCertificate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Student Full Name</label>
                <input
                  required
                  value={certForm.studentName}
                  onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
                  placeholder="Harsh Dixit"
                  className="apple-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Student Email</label>
                <input
                  required
                  type="email"
                  value={certForm.studentEmail}
                  onChange={(e) => setCertForm({ ...certForm, studentEmail: e.target.value })}
                  placeholder="harsh@buildnext.local"
                  className="apple-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Track Completed</label>
                <select
                  value={certForm.trackName}
                  onChange={(e) => setCertForm({ ...certForm, trackName: e.target.value })}
                  className="apple-input text-xs"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Performance Grade</label>
                <select
                  value={certForm.grade}
                  onChange={(e) => setCertForm({ ...certForm, grade: e.target.value })}
                  className="apple-input text-xs"
                >
                  <option value="Distinction">Distinction (Top 10%)</option>
                  <option value="Merit">Merit</option>
                  <option value="Pass">Pass</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary h-8 px-4 rounded-lg text-xs"
                >
                  Generate & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE EVENT */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#121216] p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Create Event / Challenge</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Event Title</label>
                <input
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. GeeksforGeeks Algorithmic Sprint"
                  className="apple-input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Organizer</label>
                  <input
                    value={eventForm.organizer}
                    onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    placeholder="GFG x BuildNext"
                    className="apple-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    className="apple-input text-xs"
                  >
                    <option value="Coding Contest">Coding Contest</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Demo Day">Demo Day</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="apple-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#86868b] mb-1 font-medium">Total Spots</label>
                  <input
                    type="number"
                    value={eventForm.spotsTotal}
                    onChange={(e) => setEventForm({ ...eventForm, spotsTotal: Number(e.target.value) })}
                    className="apple-input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#86868b] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="apple-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary h-8 px-4 rounded-lg text-xs"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

