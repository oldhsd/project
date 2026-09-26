'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRemote } from '@/lib/client';
import { text, number, type Resource, type Row } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
import type { AccountData, Collection } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import {
  Badge,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Pagination,
} from '@/components/ui/primitives';
export const catalogConfig = {
  tracks: {
    title: 'Learning tracks',
    description: 'Choose a pathway and work through its modules and lessons at your own pace.',
    singular: 'track',
    href: '/tracks',
  },
  projects: {
    title: 'Projects',
    description: 'Put your learning into practice with a clear brief and concrete deliverables.',
    singular: 'project',
    href: '/projects',
  },
  events: {
    title: 'Events',
    description: 'Find workshops, challenges and community events. All times are shown in UTC.',
    singular: 'event',
    href: '/events',
  },
  opportunities: {
    title: 'Opportunities',
    description: 'Explore roles and opportunities published by the BuildNext team.',
    singular: 'opportunity',
    href: '/opportunities',
  },
  mentors: {
    title: 'Mentorship',
    description: 'Find people who can help you develop your skills and plan your next steps.',
    singular: 'mentor',
    href: '/mentorship',
  },
  assessments: {
    title: 'Assessments',
    description:
      'Check your understanding. Answers are graded on the server and results are saved to your account.',
    singular: 'assessment',
    href: '/assessments',
  },
};
export type CatalogResource = keyof typeof catalogConfig;
function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="progress-glow h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        <span className="text-gradient font-display text-sm font-bold">{clamped}%</span> complete
      </p>
    </div>
  );
}
export function ContentCard({
  resource,
  item,
  progress,
  index = 0,
}: {
  resource: CatalogResource;
  item: Row;
  progress?: number | null;
  index?: number;
}) {
  const config = catalogConfig[resource];
  return (
    <div
      className="card-premium card-lift animate-fade-up group flex min-w-0 flex-col p-6 sm:p-7"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          text(item, 'category') ||
            text(item, 'type') ||
            text(item, 'domain') ||
            text(item, 'trackCategory'),
          text(item, 'difficulty') || text(item, 'mode'),
        ]
          .filter(Boolean)
          .map((value, i) => (
            <Badge key={`${value}-${i}`} className="rounded-full border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              {value}
            </Badge>
          ))}
      </div>
      <h2 className="font-display text-xl font-bold tracking-tight">
        {text(item, 'name') || text(item, 'title')}
      </h2>
      {(text(item, 'company') || text(item, 'organizer') || text(item, 'role')) && (
        <p className="mt-1 text-sm text-muted-foreground">
          {text(item, 'company') || text(item, 'organizer') || text(item, 'role')}
        </p>
      )}
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {text(item, 'description') || text(item, 'summary') || text(item, 'bio')}
      </p>
      <div className="mt-5 space-y-1 text-xs text-muted-foreground">
        {resource === 'tracks' && (
          <p>
            {number(item, 'modulesCount')} published modules
            {number(item, 'estimatedHours') > 0
              ? ` · ${number(item, 'estimatedHours')} estimated hours`
              : ''}
          </p>
        )}
        {resource === 'events' && (
          <>
            <p>{dateLabel(item.startsAt, true)}</p>
            <p>
              {Math.max(0, number(item, 'spotsTotal') - number(item, 'spotsFilled'))} places
              remaining
            </p>
          </>
        )}
        {resource === 'opportunities' && (
          <>
            <p>{text(item, 'stipend')}</p>
            {text(item, 'deadline') && <p>Apply by {dateLabel(item.deadline, true)}</p>}
          </>
        )}
        {resource === 'assessments' && (
          <p>
            {number(item, 'totalQuestions')} questions · {number(item, 'durationMinutes')} suggested
            minutes
          </p>
        )}
        {resource === 'projects' && text(item, 'duration') && <p>{text(item, 'duration')}</p>}
      </div>
      {resource === 'tracks' && progress != null && (
        <div className="mt-5">
          <ProgressBar
            value={progress}
            label={`Progress in ${text(item, 'name') || text(item, 'title')}`}
          />
        </div>
      )}
      <div className="mt-auto pt-6">
        <Button
          asChild
          variant="outline"
          className="w-full justify-between rounded-xl border-border/70 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10"
        >
          <Link href={`${config.href}/${item.id}`}>
            View {config.singular}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
export function ContentCatalog({ resource }: { resource: CatalogResource }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const config = catalogConfig[resource];
  const remote = useRemote<Collection>(
    `/api/content/${resource}?page=${page}&q=${encodeURIComponent(query)}`
  );
  const { status } = useSession();
  const account = useRemote<AccountData>(status === 'authenticated' ? '/api/me' : null, 0);
  const enrollments = account.data?.enrollments;
  function trackProgress(item: Row): number | null {
    const found = enrollments?.find((e) => String(e.trackId) === String(item.id));
    return found ? number(found, 'progress') : null;
  }
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
          <p className="eyebrow mb-3">Explore BuildNext</p>
          <h1 className="font-display max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{config.description}</p>
        </div>
      </header>
      <div className="animate-fade-up relative mb-8 max-w-lg" style={{ animationDelay: '90ms' }}>
        <label htmlFor="content-search" className="sr-only">
          Search {config.title.toLowerCase()}
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="content-search"
          type="search"
          placeholder={`Search ${config.title.toLowerCase()}…`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="h-12 rounded-2xl border-border/70 bg-card/70 pl-11 backdrop-blur transition-colors focus-visible:ring-indigo-500/50"
        />
      </div>
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : remote.loading || !remote.data ? (
        <LoadingState />
      ) : remote.data.items.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remote.data.items.map((item, i) => (
            <ContentCard
              key={item.id}
              resource={resource}
              item={item}
              index={i}
              progress={resource === 'tracks' ? trackProgress(item) : null}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            query
              ? 'No matching results'
              : `No ${resource === 'mentors' ? 'mentors' : config.title.toLowerCase()} published yet`
          }
          description={
            query
              ? 'Try another search term.'
              : 'Published content will appear here when it is available.'
          }
        />
      )}
      {remote.data && (
        <Pagination
          page={page}
          pages={remote.data.pages}
          total={remote.data.total}
          change={setPage}
        />
      )}
    </>
  );
}
