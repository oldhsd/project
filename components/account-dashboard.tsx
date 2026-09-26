'use client';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  FolderOpen,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import { useRemote } from '@/lib/client';
import { text, number, type Row } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
import type { AccountData } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from '@/components/ui/primitives';
function QuickLink({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="flex h-full flex-col justify-between p-5 transition-colors hover:bg-accent">
        <div className="flex items-center justify-between">
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
          <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="mt-5">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </Card>
    </Link>
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
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {items.length ? (
        <Card className="divide-y">
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={link(item)}>
                      View
                      <ArrowRight />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
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
      <PageHeading
        eyebrow="My learning space"
        title={`Welcome, ${text(account.profile, 'name')}`}
        description="Pick up where you left off, or explore something new."
      >
        <Button asChild variant="outline">
          <Link href="/tracks">
            Explore courses
            <ArrowRight />
          </Link>
        </Button>
      </PageHeading>
      <section className="mb-8">
        {active ? (
          <Card className="p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Continue learning
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {text(active, 'trackName')}
            </h2>
            {active.available ? (
              <>
                <progress
                  aria-label={`Progress in ${text(active, 'trackName')}`}
                  className="mt-6 h-2 w-full accent-primary"
                  max={100}
                  value={number(active, 'progress')}
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {number(active, 'progress')}% complete · {number(active, 'completed')} of{' '}
                    {number(active, 'totalLessons')} lessons
                  </span>
                  <Button asChild>
                    <Link href={`/tracks/${text(active, 'trackId')}`}>
                      Continue learning
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                This track is not currently available. Your progress is retained.
              </p>
            )}
          </Card>
        ) : (
          <EmptyState
            title="Your learning starts here"
            description="Enroll in a published course to save your progress."
          >
            <Button asChild>
              <Link href="/tracks">Browse courses</Link>
            </Button>
          </EmptyState>
        )}
      </section>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickLink
          icon={BookOpen}
          value={account.counts.enrollments}
          label="Courses enrolled"
          href="/tracks"
        />
        <QuickLink
          icon={CheckSquare}
          value={account.attempts.length}
          label="Practice attempts"
          href="/assessments"
        />
        <QuickLink
          icon={FolderOpen}
          value={account.counts.submissions}
          label="Projects submitted"
          href="/projects"
        />
        <QuickLink
          icon={GraduationCap}
          value={account.counts.certificates}
          label="Active certificates"
          href="/certificates"
        />
      </div>
      {others.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Other courses</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((enrollment) => (
              <Card key={enrollment.id} className="p-6">
                <h3 className="font-semibold">{text(enrollment, 'trackName')}</h3>
                {enrollment.available ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {number(enrollment, 'completed')} of {number(enrollment, 'totalLessons')}{' '}
                      lessons completed
                    </p>
                    <progress
                      aria-label={`Progress in ${text(enrollment, 'trackName')}`}
                      className="mt-4 h-2 w-full accent-primary"
                      max={100}
                      value={number(enrollment, 'progress')}
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {number(enrollment, 'progress')}%
                      </span>
                      <Button variant="outline" size="sm" asChild>
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
              </Card>
            ))}
          </div>
        </section>
      )}
      <details className="rounded-lg border">
        <summary className="cursor-pointer list-none rounded-lg px-5 py-4 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
          Applications, event registrations & assessment results
        </summary>
        <div className="space-y-8 border-t px-5 py-6">
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
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Recent assessment results
            </h3>
            {account.attempts.length ? (
              <Card className="divide-y">
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
                      <span className="text-sm font-semibold">{number(item, 'percentage')}%</span>
                      <Badge>{item.passed ? 'Passed' : 'Completed'}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            )}
          </section>
        </div>
      </details>
    </>
  );
}
