'use client';

import { useState } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Code2, 
  ExternalLink, 
  Github, 
  Layers, 
  Send, 
  Sparkles, 
  Trophy, 
  X 
} from 'lucide-react';
import { initialProjects, Project } from '@/lib/data-service';

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'All' | 'Mini Project' | 'Minor Project' | 'Major Project'>('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [submitModal, setSubmitModal] = useState<Project | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([
    {
      projectId: 'project-portfolio',
      projectTitle: 'Personal Engineer Portfolio with Proof-of-Work',
      githubUrl: 'https://github.com/oldhsd/portfolio-v2',
      demoUrl: 'https://harsh-portfolio.vercel.app',
      status: 'Approved',
      grade: 'Distinction',
      xpEarned: 150
    }
  ]);

  const visible = filter === 'All' ? initialProjects : initialProjects.filter(p => p.category === filter);

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModal) return;
    setSubmitting(true);

    setTimeout(() => {
      setSubmissions([
        {
          projectId: submitModal.id,
          projectTitle: submitModal.title,
          githubUrl,
          demoUrl,
          status: 'In Mentor Review',
          grade: 'Pending Review',
          xpEarned: submitModal.xp
        },
        ...submissions
      ]);
      setSubmitting(false);
      setSubmitModal(null);
      setGithubUrl('');
      setDemoUrl('');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <p className="apple-eyebrow">PROOF OF WORK</p>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
          Project Hub & Submissions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
          Solve production problem statements, push verified GitHub repositories, and earn portfolio proofs reviewed by industry mentors.
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['All', 'Mini Project', 'Minor Project', 'Major Project'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === cat
                ? 'bg-[#e8590c] text-white shadow-sm'
                : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Submissions Status */}
      {submissions.length > 0 && (
        <section className="apple-panel p-5 rounded-2xl space-y-3">
          <p className="apple-eyebrow">YOUR SUBMISSIONS</p>
          <div className="divide-y divide-[var(--line)]">
            {submissions.map((sub, idx) => (
              <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-[var(--ink)]">{sub.projectTitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--muted)]">
                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-[#e8590c] hover:underline flex items-center gap-1">
                      <Github className="h-3 w-3" />
                      <span>Repository</span>
                    </a>
                    {sub.demoUrl && (
                      <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-[#e8590c] hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    sub.status === 'Approved'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : 'bg-[#ffd60a]/15 text-[#ffd60a]'
                  }`}>
                    {sub.status}
                  </span>
                  <span className="text-[11px] font-semibold text-[#e8590c]">+{sub.xpEarned} XP</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <div
            key={project.id}
            className="apple-card p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8590c]/10 text-[#e8590c]">
                  {project.category}
                </span>
                <span className="text-[11px] text-[var(--muted)]">{project.difficulty}</span>
              </div>

              <h2 className="mt-4 text-base font-bold text-[var(--ink)] tracking-tight">
                {project.title}
              </h2>
              <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                {project.summary}
              </p>

              {/* Tech Stack */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[11px] font-medium text-[var(--ink)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#e8590c]">+{project.xp} XP</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveProject(project)}
                  className="apple-btn-secondary h-8 px-3 rounded-lg text-xs"
                >
                  Brief
                </button>
                <button
                  onClick={() => setSubmitModal(project)}
                  className="apple-btn-primary h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PROJECT DETAIL MODAL */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="apple-eyebrow">{activeProject.category}</span>
                <h3 className="text-lg font-bold text-[var(--ink)] mt-0.5">{activeProject.title}</h3>
                <p className="text-xs text-[var(--muted)]">{activeProject.duration} • Level: {activeProject.difficulty}</p>
              </div>
              <button onClick={() => setActiveProject(null)} className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--muted)]">
              <div>
                <p className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider mb-1">Problem Statement</p>
                <p className="leading-relaxed">{activeProject.problemStatement}</p>
              </div>

              <div>
                <p className="font-bold text-[var(--ink)] uppercase text-[10px] tracking-wider mb-1">Required Deliverables</p>
                <ul className="space-y-1 pl-4 list-disc">
                  {activeProject.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setActiveProject(null)} className="apple-btn-secondary h-8 px-4 rounded-xl text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  const target = activeProject;
                  setActiveProject(null);
                  setSubmitModal(target);
                }}
                className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-semibold"
              >
                Proceed to Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="apple-eyebrow">SUBMIT PROOF</span>
                <h3 className="text-base font-bold text-[var(--ink)] mt-0.5">{submitModal.title}</h3>
              </div>
              <button onClick={() => setSubmitModal(null)} className="p-1 text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">GitHub Repository Link</label>
                <input
                  required
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="apple-input text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--ink)] mb-1">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://project.vercel.app"
                  className="apple-input text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--surface-2)] text-[11px] text-[var(--muted)]">
                Mentors evaluate clean code structure, README documentation, and responsive interface quality.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setSubmitModal(null)} className="apple-btn-secondary h-8 px-3 rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="apple-btn-primary h-8 px-4 rounded-xl text-xs font-semibold">
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
