'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpen, BriefcaseBusiness, CalendarDays, ClipboardCheck, Compass, LayoutDashboard, LogOut, Moon, Sparkles, Sun, UserRound, UsersRound } from 'lucide-react';
import { 
  Award, 
  BookOpen, 
  BriefcaseBusiness, 
  CalendarDays, 
  CheckCircle2, 
  Code2, 
  Compass, 
  LayoutDashboard, 
  LogOut, 
  Moon, 
  Sun, 
  UserRound, 
  UsersRound,
  ShieldCheck
} from 'lucide-react';

const nav = [['/dashboard', 'Overview', LayoutDashboard], ['/tracks', 'Learn', BookOpen], ['/assessments', 'Assess', ClipboardCheck], ['/projects', 'Build', Compass], ['/events', 'Compete', CalendarDays], ['/opportunities', 'Opportunities', BriefcaseBusiness], ['/mentorship', 'Mentorship', UsersRound], ['/certificates', 'Certificates', Award], ['/profile', 'Profile', UserRound]] as const;
// Student navigation strictly for regular users (ZERO admin cues)
const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/tracks', label: 'Learn', icon: BookOpen },
  { href: '/assessments', label: 'Assess', icon: CheckCircle2 },
  { href: '/projects', label: 'Build', icon: Code2 },
  { href: '/events', label: 'Compete', icon: CalendarDays },
  { href: '/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { href: '/mentorship', label: 'Mentorship', icon: UsersRound },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/profile', label: 'Profile', icon: UserRound }
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const { data } = useSession(); const { theme, setTheme } = useTheme();
  const admin = (data?.user as { role?: string } | undefined)?.role === 'admin';
  return <div className="min-h-screen md:grid md:grid-cols-[248px_minmax(0,1fr)]">
    <aside className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-5 backdrop-blur-xl md:sticky md:inset-auto md:h-screen md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-4 md:py-7">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-black"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-sm text-[#062325]">B</span>BuildNext</Link>
      <nav className="hidden space-y-1 md:block">{nav.map(([href, label, Icon]) => { const active = path === href; return <Link key={href} href={href} className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? 'text-[var(--ink)]' : 'muted hover:bg-[var(--surface-2)] hover:text-[var(--ink)]'}`}>{active && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-lg bg-[var(--surface-2)]" />}<Icon className="relative h-4 w-4" /><span className="relative">{label}</span></Link>; })}{admin && <Link href="/admin" className={`relative mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${path.startsWith('/admin') ? 'bg-[var(--coral)] text-[#30110b]' : 'text-[var(--coral)] hover:bg-[color-mix(in_srgb,var(--coral)_12%,transparent)]'}`}><Sparkles className="h-4 w-4" />Admin studio</Link>}</nav>
      <div className="hidden space-y-3 md:block"><div className="rounded-lg bg-[var(--surface-2)] p-3"><p className="text-xs font-bold">Level 1 · Explorer</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full w-[42%] rounded-full bg-[var(--lime)]" /></div><p className="muted mt-2 text-[11px]">380 XP to Learner</p></div><div className="flex gap-2"><button aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn btn-secondary min-h-9 flex-1 px-2">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><button aria-label="Sign out" title="Sign out" onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-secondary min-h-9 px-2 text-[var(--coral)]"><LogOut className="h-4 w-4" /></button></div></div>
    </aside>
    <main className="min-w-0 px-4 pb-24 pt-24 md:px-10 md:pb-10 md:pt-10"><AnimatePresence mode="wait"><motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22 }}>{children}</motion.div></AnimatePresence></main>
    <nav className="fixed bottom-3 left-3 right-3 z-30 flex justify-between rounded-xl border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-2 shadow-xl backdrop-blur-xl md:hidden">{nav.slice(0, 5).map(([href, label, Icon]) => <Link key={href} href={href} className={`grid min-h-12 flex-1 place-items-center rounded-lg ${path === href ? 'bg-[var(--accent)] text-[#062325]' : 'muted'}`}><Icon className="h-4 w-4" /><span className="text-[10px] font-bold">{label}</span></Link>)}</nav>
  </div>;
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      {/* Desktop Apple-Style Sidebar */}
      <aside className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-[var(--surface)]/80 px-4 backdrop-blur-2xl md:sticky md:inset-auto md:h-screen md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-3.5 md:py-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0071e3] text-white font-semibold text-xs shadow-sm">
              BN
            </div>
            <span className="font-semibold tracking-tight text-sm text-[var(--ink)]">
              BuildNext
            </span>
          </Link>
        </div>

        {/* Navigation Links (strictly student features) */}
        <nav className="hidden space-y-0.5 md:mt-6 md:block">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'text-[var(--ink)] bg-[var(--surface-2)] font-semibold'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--ink)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-lg bg-[var(--surface-2)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`relative h-4 w-4 shrink-0 ${isActive ? 'text-[#0071e3]' : 'text-[var(--muted)]'}`} />
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Student Profile & Controls */}
        <div className="hidden space-y-3 md:mt-auto md:block">
          {/* XP & Level Status */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--ink)]">Level 2 · Builder</span>
              <span className="text-[10px] font-medium text-[#0071e3]">680 XP</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
              <div className="h-full w-[68%] rounded-full bg-[#0071e3] transition-all duration-500" />
            </div>
            <p className="mt-2 text-[10px] text-[var(--muted)]">320 XP to Developer</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="apple-btn-secondary h-8 flex-1 rounded-lg text-xs"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="text-[11px]">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="apple-btn-secondary h-8 w-8 rounded-lg p-0 text-[var(--coral)] hover:bg-[var(--coral)]/10"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 px-4 pb-24 pt-20 md:px-8 md:pb-12 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Apple-style Navigation Bar */}
      <nav className="fixed bottom-3 inset-x-3 z-30 flex items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 p-1.5 shadow-lg backdrop-blur-2xl md:hidden">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition ${
                isActive ? 'text-[#0071e3] font-semibold' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
