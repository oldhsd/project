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
const navigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/tracks', label: 'Learning tracks', icon: BookOpen },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/assessments', label: 'Assessments', icon: CheckSquare },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { href: '/mentorship', label: 'Mentorship', icon: Users },
  { href: '/certificates', label: 'My certificates', icon: GraduationCap },
  { href: '/profile', label: 'My profile', icon: UserRound },
];
export function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md bg-orange-700 text-xs font-bold text-white"
      >
        BN
      </span>
      <span>BuildNext</span>
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
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="hidden gap-6 text-sm text-muted-foreground lg:flex"
          >
            {links.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/signup">Join BuildNext</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
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
              className="rounded-md px-3 py-3 hover:bg-accent"
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="rounded-md px-3 py-3 hover:bg-accent"
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
  const navClass = (href: string) =>
    cn(
      'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      (pathname === href || (href !== '/admin-ops' && pathname.startsWith(href + '/'))) &&
        'bg-accent font-medium text-accent-foreground'
    );
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
                <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
          navigation.map(({ href, label, icon: Icon }) => (
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
          ))
        )}
        {!admin && user?.role === 'admin' && (
          <div className="pt-4">
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
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-card lg:flex">
        <div className="border-b px-6 py-5">
          <Brand />
          <p className="mt-2 text-xs text-muted-foreground">
            {admin ? 'Administration' : 'Student platform'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <Nav />
        </div>
        <div className="border-t p-4">
          <Link
            href={admin ? '/dashboard' : '/verify'}
            className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"
          >
            {admin ? 'View student platform' : 'Verify a certificate'}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Open navigation"
              className="lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <p className="text-sm font-medium">
              <span className="sm:hidden">{admin ? 'Admin' : 'BuildNext'}</span>
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
                <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut />
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto min-w-0 w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-10"
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
