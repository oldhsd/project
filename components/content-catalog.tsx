'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRemote } from '@/lib/client';
import { text, number, type Resource, type Row } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
import type { Collection } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeading,
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
export function ContentCard({ resource, item }: { resource: CatalogResource; item: Row }) {
  const config = catalogConfig[resource];
  return (
    <Card className="flex min-w-0 flex-col p-6">
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
            <Badge key={`${value}-${i}`}>{value}</Badge>
          ))}
      </div>
      <h2 className="text-lg font-semibold tracking-tight">
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
      <div className="mt-auto pt-6">
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={`${config.href}/${item.id}`}>
            View {config.singular}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
export function ContentCatalog({ resource }: { resource: CatalogResource }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const config = catalogConfig[resource];
  const remote = useRemote<Collection>(
    `/api/content/${resource}?page=${page}&q=${encodeURIComponent(query)}`
  );
  return (
    <>
      <PageHeading
        title={config.title}
        eyebrow="Explore BuildNext"
        description={config.description}
      />
      <div className="mb-6 max-w-lg">
        <label htmlFor="content-search" className="sr-only">
          Search {config.title.toLowerCase()}
        </label>
        <Input
          id="content-search"
          type="search"
          placeholder={`Search ${config.title.toLowerCase()}…`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : remote.loading || !remote.data ? (
        <LoadingState />
      ) : remote.data.items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {remote.data.items.map((item) => (
            <ContentCard key={item.id} resource={resource} item={item} />
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
