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
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from '@/components/ui/primitives';
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
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
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
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description="Your saved activity will appear here."
        />
      )}
    </section>
  );
}
export function AccountDashboard() {
  const remote = useRemote<AccountData>('/api/me');
  if (remote.error) return <ErrorState message={remote.error.message} retry={remote.reload} />;
  if (!remote.data) return <LoadingState />;
  const account = remote.data;
  return (
    <>
      <PageHeading
        eyebrow="My learning space"
        title={`Welcome, ${text(account.profile, 'name')}`}
        description="Continue your learning and keep track of the work you have submitted."
      >
        <Button asChild>
          <Link href="/tracks">
            Explore tracks
            <ArrowRight />
          </Link>
        </Button>
      </PageHeading>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tracks enrolled', account.counts.enrollments],
          ['Project submissions', account.counts.submissions],
          ['Applications', account.counts.applications],
          ['Active certificates', account.counts.certificates],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
          </Card>
        ))}
      </div>
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">My learning tracks</h2>
          {account.enrollments.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {account.enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-6">
                  <h3 className="font-semibold">{text(enrollment, 'trackName')}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {enrollment.available
                      ? `${number(enrollment, 'completed')} of ${number(enrollment, 'totalLessons')} currently published lessons completed`
                      : 'This track is not currently available. Your progress is retained.'}
                  </p>
                  {!!enrollment.available && (
                    <>
                      <progress
                        aria-label={`Progress in ${text(enrollment, 'trackName')}`}
                        className="mt-5 h-2 w-full accent-primary"
                        max={100}
                        value={number(enrollment, 'progress')}
                      />
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {number(enrollment, 'progress')}%
                        </span>
                        <Button variant="outline" asChild>
                          <Link href={`/tracks/${text(enrollment, 'trackId')}`}>
                            Continue learning
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your learning starts here"
              description="Enroll in a published track to save your progress."
            >
              <Button asChild>
                <Link href="/tracks">Browse learning tracks</Link>
              </Button>
            </EmptyState>
          )}
        </section>
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
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Recent assessment results</h2>
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
            <EmptyState
              title="No assessment results yet"
              description="Complete an assessment to see a saved result here."
            >
              <Button variant="outline" asChild>
                <Link href="/assessments">Explore assessments</Link>
              </Button>
            </EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
