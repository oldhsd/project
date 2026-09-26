'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
  ArrowUpRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminConfig, adminSections } from '@/lib/admin-config';
export type ShellUser = { name: string; role: string } | null;
const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracks', label: 'Courses', icon: BookOpen },
  { href: '/assessments', label: 'Practice', icon: CheckSquare },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
];
const secondaryNav = [
  { href: '/certificates', label: 'Certificates', icon: GraduationCap },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { href: '/mentorship', label: 'Mentorship', icon: Users },
  { href: '/profile', label: 'Profile', icon: UserRound },
];
export function Brand() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5">
      <img
        src="/images/buildnext-logo.png"
        alt="BuildNext Community"
        className="size-9 rounded-xl object-cover ring-1 ring-white/10 transition-shadow group-hover:shadow-[0_0_24px_rgba(99,102,241,0.45)] shadow-[0_0_16px_rgba(99,102,241,0.25)]"
      />
      <span className="font-display text-lg font-bold tracking-tight">BuildNext</span>
    </Link>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="rounded-xl"
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    ['/tracks', 'Tracks'],
    ['/projects', 'Projects'],
    ['/events', 'Events'],
    ['/opportunities', 'Opportunities'],
    ['/verify', 'Verify a certificate'],
  ];
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="hidden gap-7 text-sm text-muted-foreground lg:flex"
          >
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild className="rounded-xl">
              <Link href="/login">Sign in</Link>
            </Button>
            <Link href="/signup" className="btn-gradient hidden !min-h-10 sm:inline-flex">
              Join BuildNext
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl lg:hidden"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Navigation"
        description="Explore BuildNext."
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          {links.map(([href, label]) => (
            <Link
              className="rounded-xl px-3 py-3 hover:bg-accent"
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="rounded-xl px-3 py-3 hover:bg-accent"
            href="/signup"
            onClick={() => setOpen(false)}
          >
            Join BuildNext
          </Link>
        </nav>
      </Dialog>
    </>
  );
}
export function Shell({
  children,
  user,
  admin = false,
}: {
  children: React.ReactNode;
  user: ShellUser;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navClass = (href: string) => {
    const active =
      pathname === href || (href !== '/admin-ops' && pathname.startsWith(href + '/'));
    return cn(
      'flex min-h-10 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent/70 hover:text-accent-foreground',
      active &&
        'border-indigo-500/25 bg-gradient-to-r from-indigo-500/15 to-violet-500/10 font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
    );
  };
  function Nav() {
    return (
      <nav aria-label={admin ? 'Administration' : 'Platform navigation'} className="space-y-1">
        {admin ? (
          <>
            <Link
              href="/admin-ops"
              className={navClass('/admin-ops')}
              onClick={() => setOpen(false)}
              aria-current={pathname === '/admin-ops' ? 'page' : undefined}
            >
              <LayoutDashboard className="size-4" />
              Overview
            </Link>
            {adminSections.map((section) => (
              <div key={section.label} className="pt-4">
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                  {section.label}
                </p>
                {section.resources.map((key) => {
                  const href = `/admin-ops/${key}`;
                  return (
                    <Link
                      key={key}
                      href={href}
                      className={navClass(href)}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === href ? 'page' : undefined}
                    >
                      {adminConfig[key].label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <>
            {primaryNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={navClass(href)}
                onClick={() => setOpen(false)}
                aria-current={pathname === href ? 'page' : undefined}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
            <div className="pt-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                More
              </p>
              {secondaryNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={navClass(href)}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === href ? 'page' : undefined}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </div>
          </>
        )}
        {!admin && user?.role === 'admin' && (
          <div className="pt-5">
            <Link
              href="/admin-ops"
              className={navClass('/admin-ops')}
              onClick={() => setOpen(false)}
            >
              <ShieldCheck className="size-4" />
              Administration
            </Link>
          </div>
        )}
      </nav>
    );
  }
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {!admin && (
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black,transparent)]" />
          <div className="absolute -top-40 left-1/2 h-[26rem] w-[54rem] -translate-x-1/2 rounded-full bg-indigo-500/[0.13] blur-[130px] dark:bg-indigo-500/[0.17]" />
          <div className="absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-violet-500/[0.09] blur-[110px] dark:bg-violet-500/[0.12]" />
          <div className="absolute -right-48 top-2/3 h-96 w-96 rounded-full bg-indigo-500/[0.07] blur-[110px] dark:bg-indigo-500/[0.1]" />
        </div>
      )}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-card/70 backdrop-blur-xl lg:flex">
        <div className="border-b border-border/70 px-6 py-5">
          <Brand />
          <p className="mt-2 text-xs text-muted-foreground">
            {admin ? 'Administration' : 'Student platform'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <Nav />
        </div>
        <div className="border-t border-border/70 p-4">
          <Link
            href={admin ? '/dashboard' : '/verify'}
            className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {admin ? 'View student platform' : 'Verify a certificate'}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </aside>
      <div className="relative min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-background/75 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Open navigation"
              className="rounded-xl lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <p className="font-display text-sm font-semibold tracking-tight">
              <span className="sm:hidden">BuildNext</span>
              <span className="hidden sm:inline">
                {admin ? 'Admin workspace' : 'Learn. Build. Progress.'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">
                  {user.name}
                </span>
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })} className="rounded-xl">
                  <LogOut />
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto min-w-0 w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12"
        >
          {children}
        </main>
      </div>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={admin ? 'Administration' : 'BuildNext'}
        description="Choose a section of the platform."
      >
        <Nav />
      </Dialog>
    </div>
  );
}
