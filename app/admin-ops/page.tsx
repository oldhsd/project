'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, BookOpen, BriefcaseBusiness, Users, LogOut,
  Menu, Shield, Trash2, Plus, Search, CheckCircle2,
  AlertCircle, Activity, RefreshCw, X
} from 'lucide-react';

/* ── Types ── */
interface Analytics { students: number; tracks: number; opportunities: number }
interface TrackItem  { id: string; name: string; category: string; difficulty: string; estimatedHours: number; modulesCount: number; description: string }
interface OppItem    { id: string; title: string; company: string; type: string; mode: string; location: string; stipend: string; deadline: string; status: string }
interface Toast      { id: string; message: string; type: 'success'|'error'|'info' }

/* ── Toast ── */
function Toasts({ list }: { list: Toast[] }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {list.map(t => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border backdrop-blur-xl pointer-events-auto animate-in slide-in-from-right-4 duration-200
          ${t.type==='success'?'bg-emerald-950/95 border-emerald-500/30 text-emerald-300':t.type==='error'?'bg-red-950/95 border-red-500/30 text-red-300':'bg-blue-950/95 border-blue-500/30 text-blue-300'}`}>
          {t.type==='success'&&<CheckCircle2 size={15}/>}{t.type==='error'&&<AlertCircle size={15}/>}{t.type==='info'&&<Activity size={15}/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ── Stat Card ── */
function Stat({ label, value, icon: Icon, g1, g2 }: { label:string;value:number;icon:any;g1:string;g2:string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${g1} ${g2} border border-white/[0.08] shadow-2xl hover:scale-[1.02] transition-transform duration-200 select-none`}>
      <div className="absolute -right-4 -top-4 opacity-[0.07]"><Icon size={88}/></div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-2">{label}</p>
      <p className="text-5xl font-black text-white tabular-nums">{value}</p>
    </div>
  );
}

/* ── Modal ── */
function Modal({ title, onClose, children }: { title:string;onClose:()=>void;children:React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-[#0f0f1a] border border-white/[0.09] rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0f0f1a]/95 backdrop-blur border-b border-white/[0.07] px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors"><X size={17} className="text-white/40"/></button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

/* ── Field ── */
const F = ({ label, children }: { label:string;children:React.ReactNode }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-[0.12em] text-white/35 mb-1.5">{label}</label>
    {children}
  </div>
);
const inp = "w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all";
const sel = "w-full px-3.5 py-2.5 bg-[#16162a] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all";

/* ═══════════════ MAIN ═══════════════ */
export default function AdminOpsStudio() {
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(true);
  const [tab, setTab]   = useState<'overview'|'tracks'|'opportunities'|'students'>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [stats,  setStats]  = useState<Analytics>({students:0,tracks:0,opportunities:0});
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [opps,   setOpps]   = useState<OppItem[]>([]);
  const [q, setQ] = useState('');

  const [tModal, setTModal] = useState(false);
  const [oModal, setOModal] = useState(false);

  const initT = { name:'', category:'Technology', difficulty:'Intermediate', estimatedHours:40, modulesCount:8, description:'', prerequisites:'' };
  const initO = { title:'', company:'', type:'Internship', mode:'Remote', location:'', stipend:'', description:'', skills:'', eligibility:'Open to all students', deadline:new Date(Date.now()+30*864e5).toISOString().slice(0,10) };
  const [tf, setTf] = useState(initT);
  const [of, setOf] = useState(initO);

  const toast = useCallback((message:string, type:Toast['type']='info') => {
    const id = Date.now().toString();
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3500);
  },[]);

  const load = useCallback(async (silent=false) => {
    if (!silent) setLoading(true); else setBusy(true);
    try {
      const [a,t,o] = await Promise.all([
        fetch('/api/admin/overview').then(r=>r.ok?r.json():{students:0,tracks:0,opportunities:0}),
        fetch('/api/content/tracks').then(r=>r.ok?r.json():{tracks:[]}),
        fetch('/api/content/opportunities').then(r=>r.ok?r.json():{opportunities:[]}),
      ]);
      setStats(a);
      setTracks(t.tracks||[]);
      setOpps(o.opportunities||[]);
    } catch { toast('Failed to load','error'); }
    finally { setLoading(false); setBusy(false); }
  },[toast]);

  useEffect(()=>{ load(); },[load]);

  const logout = async () => {
    await fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
    router.push('/admin-ops/access');
  };

  const createTrack = async (e:React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/content/tracks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...tf,prerequisites:tf.prerequisites.split(',').map(s=>s.trim()).filter(Boolean)})});
    const d = await r.json();
    if (r.ok) { toast('Track created!','success'); setTModal(false); setTf(initT); load(true); }
    else toast(d.error||'Failed','error');
  };

  const delTrack = async (id:string) => {
    if (!confirm('Delete this track?')) return;
    const r = await fetch(`/api/content/tracks?id=${id}`,{method:'DELETE'});
    if (r.ok) { toast('Deleted','success'); setTracks(p=>p.filter(t=>t.id!==id)); setStats(p=>({...p,tracks:Math.max(0,p.tracks-1)})); }
    else toast('Failed','error');
  };

  const createOpp = async (e:React.FormEvent) => {
    e.preventDefault();
    const r = await fetch('/api/content/opportunities',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...of,skills:of.skills.split(',').map(s=>s.trim()).filter(Boolean)})});
    const d = await r.json();
    if (r.ok) { toast('Opportunity posted!','success'); setOModal(false); setOf(initO); load(true); }
    else toast(d.error||'Failed','error');
  };

  const delOpp = async (id:string) => {
    if (!confirm('Delete?')) return;
    const r = await fetch(`/api/content/opportunities?id=${id}`,{method:'DELETE'});
    if (r.ok) { toast('Removed','success'); setOpps(p=>p.filter(o=>o.id!==id)); setStats(p=>({...p,opportunities:Math.max(0,p.opportunities-1)})); }
    else toast('Failed','error');
  };

  const nav = [
    {id:'overview',label:'Overview',icon:BarChart3},
    {id:'tracks',label:'Tracks',icon:BookOpen},
    {id:'opportunities',label:'Opportunities',icon:BriefcaseBusiness},
    {id:'students',label:'Students',icon:Users},
  ] as const;

  const fT = tracks.filter(t=>t.name?.toLowerCase().includes(q.toLowerCase()));
  const fO = opps.filter(o=>o.title?.toLowerCase().includes(q.toLowerCase())||o.company?.toLowerCase().includes(q.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#07070f]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin"/>
        <p className="text-white/25 text-xs font-bold tracking-widest uppercase">Loading Admin Studio</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#07070f] text-white overflow-hidden">
      <Toasts list={toasts}/>

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`${sideOpen?'w-56':'w-[66px]'} flex-shrink-0 flex flex-col bg-[#0b0b17] border-r border-white/[0.05] transition-all duration-300 ease-in-out`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.05]">
          {sideOpen && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                <Shield size={12} className="text-white"/>
              </div>
              <span className="text-xs font-bold text-white/70 whitespace-nowrap">Admin Studio</span>
            </div>
          )}
          <button onClick={()=>setSideOpen(p=>!p)} className="ml-auto p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors flex-shrink-0">
            <Menu size={16} className="text-white/35"/>
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5">
          {nav.map(({id,label,icon:Icon})=>{
            const active=tab===id;
            return (
              <button key={id} onClick={()=>setTab(id)}
                title={!sideOpen?label:undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all
                  ${active?'bg-white/[0.07] text-white':'text-white/30 hover:text-white/65 hover:bg-white/[0.04]'}`}>
                <Icon size={16} className={`flex-shrink-0 ${active?'text-blue-400':''}`}/>
                {sideOpen&&<span className="whitespace-nowrap">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 border-t border-white/[0.05]">
          <button onClick={logout} title={!sideOpen?'Sign Out':undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/40 hover:text-red-400 hover:bg-red-500/[0.07] transition-all">
            <LogOut size={16} className="flex-shrink-0"/>
            {sideOpen&&<span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[#0b0b17]/70 backdrop-blur border-b border-white/[0.05] flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-white/70">
              {tab==='overview'?'Operations Overview':tab==='tracks'?'Tracks':tab==='opportunities'?'Opportunities':'Students'}
            </h1>
            {busy&&<RefreshCw size={12} className="text-blue-400/60 animate-spin"/>}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-xs text-white placeholder:text-white/15 focus:outline-none focus:border-blue-500/40 w-40 transition-all"/>
            </div>
            <button onClick={()=>load(true)} className="p-1.5 hover:bg-white/[0.06] rounded-xl transition-colors">
              <RefreshCw size={13} className="text-white/25 hover:text-white/50 transition-colors"/>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ─── OVERVIEW ─── */}
          {tab==='overview'&&(
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat label="Students"     value={stats.students}      icon={Users}             g1="from-blue-900/60"   g2="to-indigo-900/40"/>
                <Stat label="Tracks"       value={stats.tracks}        icon={BookOpen}          g1="from-violet-900/60" g2="to-purple-900/40"/>
                <Stat label="Opportunities"value={stats.opportunities} icon={BriefcaseBusiness} g1="from-orange-900/60" g2="to-red-900/40"/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={()=>{setTab('tracks');setTModal(true);}}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-blue-600/[0.06] border border-blue-500/[0.12] hover:border-blue-500/30 hover:bg-blue-600/[0.10] transition-all text-left">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                    <Plus size={18} className="text-blue-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Add Learning Track</p>
                    <p className="text-xs text-white/30 mt-0.5">Create a new curriculum pathway</p>
                  </div>
                </button>
                <button onClick={()=>{setTab('opportunities');setOModal(true);}}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-orange-600/[0.06] border border-orange-500/[0.12] hover:border-orange-500/30 hover:bg-orange-600/[0.10] transition-all text-left">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors flex-shrink-0">
                    <Plus size={18} className="text-orange-400"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Post Opportunity</p>
                    <p className="text-xs text-white/30 mt-0.5">Add internship or job listing</p>
                  </div>
                </button>
              </div>

              {/* Recent list */}
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">Recent Tracks</p>
                  <button onClick={()=>setTab('tracks')} className="text-[11px] text-blue-400/60 hover:text-blue-400 transition-colors">View all →</button>
                </div>
                {tracks.length===0
                  ?<p className="text-center text-white/15 text-xs py-10">No tracks yet — create one above</p>
                  :tracks.slice(0,5).map(t=>(
                    <div key={t.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-white/80">{t.name}</p>
                        <p className="text-[11px] text-white/25 mt-0.5">{t.category} · {t.difficulty}</p>
                      </div>
                      <span className="text-[11px] text-white/20 flex-shrink-0 ml-4">{t.estimatedHours}h</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ─── TRACKS ─── */}
          {tab==='tracks'&&(
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/25">{fT.length} track{fT.length!==1?'s':''}</p>
                <button onClick={()=>setTModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:brightness-110 transition-all">
                  <Plus size={14}/> Add Track
                </button>
              </div>
              {fT.length===0
                ?<div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.06]">
                  <BookOpen size={36} className="text-white/[0.08] mb-3"/>
                  <p className="text-white/20 text-sm">No tracks yet</p>
                </div>
                :<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {fT.map(t=>(
                    <div key={t.id} className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-white/[0.09] hover:bg-white/[0.03] transition-all hover:shadow-xl hover:shadow-black/50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white/85 text-sm leading-tight flex-1 pr-2">{t.name}</h3>
                        <button onClick={()=>delTrack(t.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/15 rounded-lg transition-all flex-shrink-0">
                          <Trash2 size={13} className="text-red-400"/>
                        </button>
                      </div>
                      {t.description&&<p className="text-[11px] text-white/25 line-clamp-2 mb-3">{t.description}</p>}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border
                          ${t.difficulty==='Beginner'?'bg-green-500/10 text-green-400 border-green-500/20':t.difficulty==='Intermediate'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {t.difficulty}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/30 border border-white/[0.06]">{t.category}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/30 border border-white/[0.06]">{t.estimatedHours}h · {t.modulesCount} mod</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ─── OPPORTUNITIES ─── */}
          {tab==='opportunities'&&(
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/25">{fO.length} listing{fO.length!==1?'s':''}</p>
                <button onClick={()=>setOModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all">
                  <Plus size={14}/> Post Opportunity
                </button>
              </div>
              {fO.length===0
                ?<div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.06]">
                  <BriefcaseBusiness size={36} className="text-white/[0.08] mb-3"/>
                  <p className="text-white/20 text-sm">No listings yet</p>
                </div>
                :<div className="space-y-3">
                  {fO.map(o=>(
                    <div key={o.id} className="group flex items-center gap-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 hover:border-white/[0.09] hover:bg-white/[0.03] transition-all">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/[0.08] border border-orange-500/[0.12] flex items-center justify-center flex-shrink-0">
                        <BriefcaseBusiness size={16} className="text-orange-400"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-white/85 text-sm">{o.title}</p>
                            <p className="text-[11px] text-white/30 mt-0.5">{o.company} · {o.mode} · {o.location}</p>
                          </div>
                          <button onClick={()=>delOpp(o.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/15 rounded-lg transition-all flex-shrink-0">
                            <Trash2 size={13} className="text-red-400"/>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">{o.type}</span>
                          {o.stipend&&<span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{o.stipend}</span>}
                          {o.deadline&&<span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-white/25 border border-white/[0.06]">Due {o.deadline}</span>}
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${o.status==='published'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-white/[0.04] text-white/20 border-white/[0.06]'}`}>{o.status||'draft'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ─── STUDENTS ─── */}
          {tab==='students'&&(
            <div className="max-w-lg">
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.05]">
                  <p className="text-sm font-bold text-white/60">Student Registry</p>
                  <p className="text-xs text-white/25 mt-0.5">Total: <span className="text-white/50 font-semibold">{stats.students}</span> registered</p>
                </div>
                <div className="p-10 text-center">
                  <Users size={36} className="mx-auto text-white/[0.08] mb-3"/>
                  <p className="text-white/20 text-sm">Full student list</p>
                  <p className="text-white/12 text-xs mt-1">Manage via MongoDB Compass or add /api/admin/users route</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ═══ TRACK MODAL ═══ */}
      {tModal&&(
        <Modal title="Add Learning Track" onClose={()=>setTModal(false)}>
          <form onSubmit={createTrack} className="space-y-4">
            <F label="Track Name *"><input required value={tf.name} onChange={e=>setTf(p=>({...p,name:e.target.value}))} placeholder="e.g. Full Stack Web Development" className={inp}/></F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Category *">
                <select value={tf.category} onChange={e=>setTf(p=>({...p,category:e.target.value}))} className={sel}>
                  {['Technology','AI & Data','Design','Business','Finance','Core Engineering','Career & Research'].map(c=><option key={c}>{c}</option>)}
                </select>
              </F>
              <F label="Difficulty *">
                <select value={tf.difficulty} onChange={e=>setTf(p=>({...p,difficulty:e.target.value}))} className={sel}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Est. Hours"><input type="number" min={1} value={tf.estimatedHours} onChange={e=>setTf(p=>({...p,estimatedHours:+e.target.value}))} className={inp}/></F>
              <F label="Modules"><input type="number" min={1} value={tf.modulesCount} onChange={e=>setTf(p=>({...p,modulesCount:+e.target.value}))} className={inp}/></F>
            </div>
            <F label="Description"><textarea rows={3} value={tf.description} onChange={e=>setTf(p=>({...p,description:e.target.value}))} placeholder="Brief overview…" className={`${inp} resize-none`}/></F>
            <F label="Prerequisites (comma-separated)"><input value={tf.prerequisites} onChange={e=>setTf(p=>({...p,prerequisites:e.target.value}))} placeholder="e.g. Basic HTML, JavaScript" className={inp}/></F>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-blue-500/20">Create Track</button>
              <button type="button" onClick={()=>setTModal(false)} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 text-sm font-semibold rounded-xl hover:bg-white/[0.06] transition-all">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══ OPP MODAL ═══ */}
      {oModal&&(
        <Modal title="Post Opportunity" onClose={()=>setOModal(false)}>
          <form onSubmit={createOpp} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <F label="Title *"><input required value={of.title} onChange={e=>setOf(p=>({...p,title:e.target.value}))} placeholder="e.g. Frontend Intern" className={inp}/></F>
              <F label="Company *"><input required value={of.company} onChange={e=>setOf(p=>({...p,company:e.target.value}))} placeholder="e.g. TechCorp" className={inp}/></F>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <F label="Type">
                <select value={of.type} onChange={e=>setOf(p=>({...p,type:e.target.value}))} className={sel}>
                  <option>Internship</option><option>Fellowship</option><option>Job</option><option>Competition</option>
                </select>
              </F>
              <F label="Mode">
                <select value={of.mode} onChange={e=>setOf(p=>({...p,mode:e.target.value}))} className={sel}>
                  <option>Remote</option><option>Hybrid</option><option>On-site</option>
                </select>
              </F>
              <F label="Location *"><input required value={of.location} onChange={e=>setOf(p=>({...p,location:e.target.value}))} placeholder="Bangalore" className={inp}/></F>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <F label="Stipend"><input value={of.stipend} onChange={e=>setOf(p=>({...p,stipend:e.target.value}))} placeholder="₹25,000/month" className={inp}/></F>
              <F label="Deadline *"><input type="date" required value={of.deadline} onChange={e=>setOf(p=>({...p,deadline:e.target.value}))} className={inp}/></F>
            </div>
            <F label="Skills (comma-separated)"><input value={of.skills} onChange={e=>setOf(p=>({...p,skills:e.target.value}))} placeholder="React, Node.js, MongoDB" className={inp}/></F>
            <F label="Description *"><textarea required rows={3} value={of.description} onChange={e=>setOf(p=>({...p,description:e.target.value}))} placeholder="Role overview and responsibilities…" className={`${inp} resize-none`}/></F>
            <F label="Eligibility"><input value={of.eligibility} onChange={e=>setOf(p=>({...p,eligibility:e.target.value}))} className={inp}/></F>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-orange-500/20">Post Opportunity</button>
              <button type="button" onClick={()=>setOModal(false)} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 text-sm font-semibold rounded-xl hover:bg-white/[0.06] transition-all">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
