'use client';
import Link from 'next/link';
import { ArrowRight, BookOpen, FolderOpen, BriefcaseBusiness } from 'lucide-react';
import { useRemote } from '@/lib/client';
import { text } from '@/lib/content-schema';
import type { Collection } from '@/lib/view-types';
import { ContentCard } from '@/components/content-catalog';
import { PublicHeader, Brand } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Card, EmptyState, ErrorState, LoadingState } from '@/components/ui/primitives';
export function Home() {
  const settings = useRemote<Collection>('/api/content/settings');
  const tracks = useRemote<Collection>('/api/content/tracks?limit=3');
  const events = useRemote<Collection>('/api/content/events?limit=3');
  const content = settings.data?.items[0];
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
            {content && text(content, 'announcement') && (
              <p className="mb-7 max-w-3xl rounded-md border bg-muted/40 px-4 py-3 text-sm">
                {text(content, 'announcement')}
              </p>
            )}
            <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">
                  The BuildNext student platform
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl">
                  {content
                    ? text(content, 'heading')
                    : 'Learn with purpose. Build with confidence.'}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                  {content
                    ? text(content, 'description')
                    : 'Explore learning tracks, put your skills into practice and find your next opportunity. Your progress, projects and credentials in one place.'}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/tracks">
                      Explore learning tracks
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">My learning space</Link>
                  </Button>
                </div>
                {settings.error && (
                  <p role="status" className="mt-5 text-sm text-muted-foreground">
                    Platform announcements are temporarily unavailable.
                  </p>
                )}
              </div>
              <Card className="divide-y px-6">
                <div className="flex gap-4 py-6">
                  <BookOpen className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h2 className="font-medium">Learn step by step</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Follow tracks, modules and lessons.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 py-6">
                  <FolderOpen className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h2 className="font-medium">Put it into practice</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Submit project work for review.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 py-6">
                  <BriefcaseBusiness className="mt-1 size-5 shrink-0 text-muted-foreground" />
                  <div>
                    <h2 className="font-medium">Take the next step</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Explore events and opportunities.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl space-y-16 px-6 py-14">
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Start learning
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Find your next learning track
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/tracks">
                  View all tracks
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            {tracks.error ? (
              <ErrorState message={tracks.error.message} retry={tracks.reload} />
            ) : !tracks.data ? (
              <LoadingState />
            ) : tracks.data.items.length ? (
              <div className="grid gap-5 md:grid-cols-3">
                {tracks.data.items.map((item) => (
                  <ContentCard key={item.id} resource="tracks" item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Learning tracks are on their way"
                description="Published tracks will appear here. There is no course content available yet."
              />
            )}
          </section>
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Get involved
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Events and community</h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/events">
                  View all events
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            {events.error ? (
              <ErrorState message={events.error.message} retry={events.reload} />
            ) : !events.data ? (
              <LoadingState />
            ) : events.data.items.length ? (
              <div className="grid gap-5 md:grid-cols-3">
                {events.data.items.map((item) => (
                  <ContentCard key={item.id} resource="events" item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No events published yet"
                description="Check this space for workshops, challenges and community events."
              />
            )}
          </section>
          <section className="flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-card p-6 sm:p-8">
            <div>
              <h2 className="text-xl font-semibold">Check a BuildNext certificate</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Use its unique credential ID to check the issuance details and current status in the
                registry.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/verify">
                Verify a certificate
                <ArrowRight />
              </Link>
            </Button>
          </section>
        </div>
      </main>
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-8">
          <Brand />
          <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link href="/tracks">Tracks</Link>
            <Link href="/opportunities">Opportunities</Link>
            <Link href="/verify">Certificate registry</Link>
            <Link href="/admin-ops">Administration</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
