'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useRemote } from '@/lib/client';
import { text, number, type Row } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
import type { AccountData } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import {
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/ui/primitives';
function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="progress-glow h-full rounded-full transition-all duration-1000"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
function ActivityList({
  title,
  items,
  label,
  link,
}: {
  title: string;
  items: Row[];
  label: string;
  link?: (item: Row) => string;
}) {
  return (
    <section>
      <h3 className="font-display mb-3 text-sm font-bold text-foreground">{title}</h3>
      {items.length ? (
        <div className="card-premium divide-y divide-border/60">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium">{text(item, label)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dateLabel(item.startsAt || item.createdAt, !!item.startsAt)}
                </p>
                {text(item, 'feedback') && (
                  <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">
                    {text(item, 'feedback')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {text(item, 'status') && <Badge>{text(item, 'status').replaceAll('_', ' ')}</Badge>}
                {link && (
                  <Button variant="ghost" size="sm" asChild className="rounded-xl">
                    <Link href={link(item)}>
                      View
                      <ArrowRight />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      )}
    </section>
  );
}
export function AccountDashboard() {
  const remote = useRemote<AccountData>('/api/me');
  if (remote.error) return <ErrorState message={remote.error.message} retry={remote.reload} />;
  if (!remote.data) return <LoadingState />;
  const account = remote.data;
  const active =
    account.enrollments.find((e) => e.available && number(e, 'progress') < 100) ||
    account.enrollments[0];
  const others = account.enrollments.filter((e) => e.id !== active?.id);
  return (
    <>
      <header className="animate-fade-up relative mb-10 overflow-hidden rounded-3xl border border-border/70 p-8 sm:p-12">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_65%_85%_at_25%_15%,black,transparent)]" />
        <div
          aria-hidden
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-[110px] dark:bg-indigo-500/25"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet-500/15 blur-[110px] dark:bg-violet-500/20"
        />
        <div className="relative">
          <p className="eyebrow mb-3">My learning space</p>
          <h1 className="font-display max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome, <span className="text-gradient">{text(account.profile, 'name')}</span>
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Pick up where you left off, or explore something new.
          </p>
          <div className="mt-7">
            <Link href="/tracks" className="btn-gradient">
              Explore courses
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>
      <section className="mb-10">
        {active ? (
          <div
            className="card-premium animate-fade-up relative overflow-hidden p-8 sm:p-10"
            style={{ animationDelay: '90ms' }}
          >
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-500/20"
            />
            <div
              aria-hidden
              className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-violet-500/12 blur-[100px] dark:bg-violet-500/15"
            />
            <div className="relative">
              <p className="eyebrow mb-3">Continue learning</p>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {text(active, 'trackName')}
              </h2>
              {active.available ? (
                <>
                  <div className="mt-8">
                    <ProgressBar
                      value={number(active, 'progress')}
                      label={`Progress in ${text(active, 'trackName')}`}
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-display mr-2 text-2xl font-bold text-foreground tabular-nums">
                        {number(active, 'progress')}%
                      </span>
                      {number(active, 'completed')} of {number(active, 'totalLessons')} lessons
                      complete
                    </p>
                    <Link href={`/tracks/${text(active, 'trackId')}`} className="btn-gradient">
                      Continue learning
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  This track is not currently available. Your progress is retained.
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Your learning starts here"
            description="Enroll in a published course to save your progress."
          >
            <Link href="/tracks" className="btn-gradient">
              Browse courses
            </Link>
          </EmptyState>
        )}
      </section>
      {others.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display mb-5 text-xl font-bold tracking-tight">Other courses</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {others.map((enrollment, i) => (
              <div
                key={enrollment.id}
                className="card-premium card-lift animate-fade-up p-6 sm:p-7"
                style={{ animationDelay: `${Math.min(i, 4) * 70}ms` }}
              >
                <h3 className="font-display text-lg font-bold tracking-tight">
                  {text(enrollment, 'trackName')}
                </h3>
                {enrollment.available ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {number(enrollment, 'completed')} of {number(enrollment, 'totalLessons')}{' '}
                      lessons completed
                    </p>
                    <div className="mt-5">
                      <ProgressBar
                        value={number(enrollment, 'progress')}
                        label={`Progress in ${text(enrollment, 'trackName')}`}
                      />
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-display text-lg font-bold tabular-nums">
                        {number(enrollment, 'progress')}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-xl transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
                      >
                        <Link href={`/tracks/${text(enrollment, 'trackId')}`}>
                          Continue
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Not currently available. Your progress is retained.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      <details className="card-premium animate-fade-up group">
        <summary className="cursor-pointer list-none rounded-2xl px-6 py-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            Applications, event registrations & assessment results
            <ArrowRight className="size-4 transition-transform duration-300 group-open:rotate-90" />
          </span>
        </summary>
        <div className="space-y-8 border-t border-border/60 px-6 py-7">
          <ActivityList
            title="Project submissions"
            items={account.submissions}
            label="projectLabel"
            link={(item) => `/projects/${text(item, 'projectId')}`}
          />
          <ActivityList
            title="Applications"
            items={account.applications}
            label="opportunityLabel"
            link={(item) => `/opportunities/${text(item, 'opportunityId')}`}
          />
          <ActivityList
            title="Event registrations"
            items={account.registrations}
            label="title"
            link={(item) => `/events/${item.id}`}
          />
          <section>
            <h3 className="font-display mb-3 text-sm font-bold text-foreground">
              Recent assessment results
            </h3>
            {account.attempts.length ? (
              <div className="card-premium divide-y divide-border/60">
                {account.attempts.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{text(item, 'assessmentTitle')}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateLabel(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-bold tabular-nums">
                        {number(item, 'percentage')}%
                      </span>
                      <Badge>{item.passed ? 'Passed' : 'Completed'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            )}
          </section>
        </div>
      </details>
    </>
  );
}
