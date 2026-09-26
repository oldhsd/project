'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock,
  ExternalLink,
  FileText,
  LayoutGrid,
  ListVideo,
  Youtube,
} from 'lucide-react';
import { api, useRemote } from '@/lib/client';
import { type Row, text, number, list } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { catalogConfig, type CatalogResource } from '@/components/content-catalog';
import { StudentAction } from '@/components/student-actions';
import { AssessmentRunner } from '@/components/assessment-runner';
import type { AccountData } from '@/lib/view-types';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from '@/components/ui/primitives';
function TextSection({ title, content }: { title: string; content: string }) {
  return content ? (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{content}</p>
    </section>
  ) : null;
}
function Items({ title, items }: { title: string; items: string[] }) {
  return items.length ? (
    <section>
      <h2 className="font-display mb-3 text-lg font-bold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  ) : null;
}
function LessonDoneCheckbox({
  lessonId,
  done,
  canSave,
  saveHint,
  onToggled,
  onError,
}: {
  lessonId: string;
  done: boolean;
  canSave: boolean;
  saveHint: string;
  onToggled: (done: boolean) => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (busy || !canSave) return;
    setBusy(true);
    try {
      await api(`/api/lessons/${lessonId}/complete`, {
        method: done ? 'DELETE' : 'POST',
        body: JSON.stringify({}),
      });
      onToggled(!done);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  const disabled = busy || !canSave;
  return (
    <label
      className={cn('inline-flex items-center justify-center', !disabled && 'cursor-pointer')}
      title={saveHint}
    >
      <input
        type="checkbox"
        className="sr-only"
        aria-label={done ? 'Mark lesson not done' : 'Mark lesson done'}
        checked={done}
        disabled={disabled}
        onChange={toggle}
      />
      <span
        aria-hidden
        className={cn(
          'flex size-6 items-center justify-center rounded-lg border transition-all duration-200',
          done
            ? 'border-transparent bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.55)]'
            : 'border-input bg-background hover:border-indigo-400 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <Check
          className={cn(
            'size-4 text-white transition-all duration-200',
            done ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
          strokeWidth={3}
        />
      </span>
    </label>
  );
}
type ModuleResource = { label: string; url: string };
function resourceKind(url: string, label: string): 'pdf' | 'video' {
  if (url.startsWith('/api/files/')) return 'pdf';
  return /\.pdf(\?|#|$)/i.test(`${url} ${label}`) ? 'pdf' : 'video';
}
function VideoButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-500/20 hover:shadow-[0_0_16px_rgba(239,68,68,0.3)] dark:text-red-400"
    >
      <Youtube className="size-4 shrink-0" />
      Watch Video
      <ExternalLink className="size-3 shrink-0 opacity-60" />
    </a>
  );
}
function PdfButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-500/20 hover:shadow-[0_0_16px_rgba(59,130,246,0.3)] dark:text-blue-400"
    >
      <FileText className="size-4 shrink-0" />
      View PDF
      <ExternalLink className="size-3 shrink-0 opacity-60" />
    </a>
  );
}
const tableDash = <span className="text-xs text-muted-foreground">—</span>;
function LessonResourcesTable({
  lessons,
  resources,
  category,
  trackId,
}: {
  lessons: Row[];
  resources: ModuleResource[];
  category: string;
  trackId: string;
}) {
  const { status } = useSession();
  const account = useRemote<AccountData>(status === 'authenticated' ? '/api/me' : null, 0);
  const signedIn = status === 'authenticated';
  const enrollments = account.data?.enrollments ?? [];
  const enrolled = enrollments.some((e) => String(e.trackId) === String(trackId));
  const completedIds = new Set(
    enrollments.flatMap((e) =>
      Array.isArray(e.completedLessonIds)
        ? (e.completedLessonIds as unknown[]).map(String)
        : []
    )
  );
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; message: string } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isDone = (id: string) => toggled[id] ?? completedIds.has(id);

  async function enroll() {
    if (enrolling || !signedIn) return;
    setEnrolling(true);
    try {
      await api('/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({ trackId }),
      });
      account.reload();
      setNotice({ kind: 'ok', message: 'You are enrolled — your progress will now be saved.' });
    } catch (error) {
      setNotice({
        kind: 'err',
        message: error instanceof Error ? error.message : 'Could not enroll. Please try again.',
      });
    } finally {
      setEnrolling(false);
    }
  }

  function saveHint(done: boolean) {
    if (done) return 'Lesson completed — click to unmark';
    if (!signedIn) return 'Sign in to save your progress';
    if (account.loading) return 'Checking your account…';
    if (!enrolled) return 'Enroll in this track to save your progress';
    return 'Mark lesson done';
  }

  return (
    <div>
      {signedIn && !account.loading && !enrolled && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/[0.06] p-4 sm:p-5">
          <p className="text-sm">
            <span className="font-semibold">Save your progress.</span>{' '}
            <span className="text-muted-foreground">
              Enroll in this track to track every lesson you finish.
            </span>
          </p>
          <button
            type="button"
            className="btn-gradient !min-h-9 px-4 text-[13px]"
            disabled={enrolling}
            onClick={enroll}
          >
            {enrolling ? 'Enrolling…' : 'Enroll in track'}
          </button>
        </div>
      )}
      {notice && (
        <p
          role={notice.kind === 'err' ? 'alert' : 'status'}
          className={`mb-4 text-sm ${notice.kind === 'err' ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {notice.message}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/40">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left">
              <th className="w-14 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                #
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Video Link
              </th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                PDF Link
              </th>
              <th className="w-20 px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Done
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {resources.map((resource, index) => {
              const kind = resourceKind(resource.url, resource.label);
              return (
                <tr key={`resource-${index}`} className="transition-colors hover:bg-indigo-500/[0.05]">
                  <td className="px-5 py-3.5">
                    <span className="font-display flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium">{resource.label || 'Resource'}</span>
                    {category && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {kind === 'video' ? <VideoButton url={resource.url} /> : tableDash}
                  </td>
                  <td className="px-4 py-3.5">
                    {kind === 'pdf' ? <PdfButton url={resource.url} /> : tableDash}
                  </td>
                  <td className="px-4 py-3.5 text-center">{tableDash}</td>
                </tr>
              );
            })}
            {lessons.map((lesson, index) => {
              const videoUrl = text(lesson, 'videoUrl');
              const pdfUrl = text(lesson, 'pdfUrl');
              return (
                <tr key={lesson.id} className="transition-colors hover:bg-indigo-500/[0.05]">
                  <td className="px-5 py-3.5">
                    <span className="font-display flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      {resources.length + index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="font-medium decoration-indigo-400 decoration-2 underline-offset-4 hover:underline"
                    >
                      {text(lesson, 'title')}
                    </Link>
                    {category && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {videoUrl ? <VideoButton url={videoUrl} /> : tableDash}
                  </td>
                  <td className="px-4 py-3.5">
                    {pdfUrl ? <PdfButton url={pdfUrl} /> : tableDash}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <LessonDoneCheckbox
                      lessonId={lesson.id}
                      done={isDone(String(lesson.id))}
                      canSave={signedIn && enrolled && !account.loading}
                      saveHint={saveHint(isDone(String(lesson.id)))}
                      onToggled={(next) => {
                        setToggled((previous) => ({ ...previous, [String(lesson.id)]: next }));
                        account.reload();
                        setNotice({
                          kind: 'ok',
                          message: next ? 'Lesson marked as done.' : 'Lesson marked as not done.',
                        });
                      }}
                      onError={(message) => setNotice({ kind: 'err', message })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function TrackHero({ item }: { item: Row }) {
  return (
    <>
      <p className="eyebrow animate-fade-up mb-3">Learning track</p>
      <h1 className="font-display animate-fade-up max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl" style={{ animationDelay: '60ms' }}>
        {text(item, 'name') || text(item, 'title')}
      </h1>
      {text(item, 'description') && (
        <p className="animate-fade-up mt-4 max-w-2xl leading-7 text-muted-foreground" style={{ animationDelay: '120ms' }}>
          {text(item, 'description')}
        </p>
      )}
      <div className="animate-fade-up mt-5 flex flex-wrap gap-2" style={{ animationDelay: '160ms' }}>
        {[
          text(item, 'category') || text(item, 'trackCategory') || text(item, 'domain'),
          text(item, 'difficulty'),
          text(item, 'mode'),
          text(item, 'type'),
        ]
          .filter(Boolean)
          .map((label, i) => (
            <Badge key={i} className="rounded-full border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-indigo-600 dark:text-indigo-300">
              {label}
            </Badge>
          ))}
      </div>
    </>
  );
}
export function ContentDetail({
  resource,
  id,
}: {
  resource: CatalogResource | 'lessons';
  id: string;
}) {
  const remote = useRemote<{ item: Row }>(`/api/content/${resource}/${id}`);
  const parent =
    resource === 'lessons'
      ? { href: '/tracks', title: 'Learning tracks' }
      : catalogConfig[resource];
  if (remote.error)
    return (
      <>
        <Button variant="ghost" asChild className="mb-5 rounded-xl">
          <Link href={parent.href}>
            <ArrowLeft />
            Back to {parent.title.toLowerCase()}
          </Link>
        </Button>
        {remote.error.status === 404 ? (
          <EmptyState
            title="Content not available"
            description="This record is not published or its parent content has been withdrawn."
          />
        ) : (
          <ErrorState message={remote.error.message} retry={remote.reload} />
        )}
      </>
    );
  if (!remote.data) return <LoadingState />;
  const item = remote.data.item;
  const modules = Array.isArray(item.modules) ? (item.modules as (Row & { lessons: Row[] })[]) : [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  return (
    <div className={resource === 'tracks' ? 'mx-auto max-w-5xl' : 'mx-auto max-w-4xl'}>
      <Button variant="ghost" asChild className="mb-7 -ml-3 rounded-xl text-muted-foreground hover:text-foreground">
        <Link href={parent.href}>
          <ArrowLeft />
          Back to {parent.title.toLowerCase()}
        </Link>
      </Button>
      {resource === 'tracks' ? (
        <TrackHero item={item} />
      ) : (
        <PageHeading
          title={text(item, 'name') || text(item, 'title')}
          eyebrow={resource === 'lessons' ? 'Lesson' : undefined}
          description={
            resource === 'projects'
              ? text(item, 'summary')
              : resource === 'mentors'
                ? [text(item, 'role'), text(item, 'company')].filter(Boolean).join(' · ')
                : resource === 'lessons'
                  ? undefined
                  : text(item, 'description')
          }
        />
      )}
      <div className="mt-8 space-y-10">
        {resource === 'tracks' && (
          <>
            <div
              className="card-premium animate-fade-up relative overflow-hidden p-6 sm:p-7"
              style={{ animationDelay: '200ms' }}
            >
              <div
                aria-hidden
                className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-[90px] dark:bg-indigo-500/20"
              />
              <div className="relative flex flex-wrap items-center gap-x-10 gap-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                    <LayoutGrid className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold tabular-nums">{modules.length}</p>
                    <p className="text-xs text-muted-foreground">Published modules</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 dark:text-violet-300">
                    <ListVideo className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-bold tabular-nums">{totalLessons}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                </div>
                {number(item, 'estimatedHours') > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                      <Clock className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-bold tabular-nums">
                        {number(item, 'estimatedHours')}
                      </p>
                      <p className="text-xs text-muted-foreground">Estimated hours</p>
                    </div>
                  </div>
                )}
                <div className="w-full sm:ml-auto sm:w-auto">
                  <StudentAction resource="tracks" item={item} />
                </div>
              </div>
            </div>
            <Items title="Prerequisites" items={list(item, 'prerequisites')} />
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tight">Curriculum</h2>
                <p className="text-sm text-muted-foreground">
                  {modules.length} {modules.length === 1 ? 'module' : 'modules'} · {totalLessons}{' '}
                  {totalLessons === 1 ? 'lesson' : 'lessons'}
                </p>
              </div>
              {modules.length ? (
                <div className="space-y-6">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="card-premium animate-fade-up overflow-hidden"
                      style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}
                    >
                      <div className="p-6 sm:p-8 sm:pb-6">
                        <div className="flex items-center gap-4">
                          <span className="font-display flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-base font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.45)]">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="eyebrow">Module {index + 1}</p>
                            <h3 className="font-display mt-1 truncate text-xl font-bold tracking-tight">
                              {text(module, 'title')}
                            </h3>
                          </div>
                        </div>
                        {text(module, 'description') && (
                          <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            {text(module, 'description')}
                          </p>
                        )}
                      </div>
                      {(() => {
                        const moduleResources = (
                          Array.isArray(module.resources) ? module.resources : []
                        )
                          .filter(
                            (link): link is { label?: unknown; url?: unknown } =>
                              !!link && typeof link === 'object'
                          )
                          .filter(
                            (link) => typeof link.url === 'string' && link.url
                          )
                          .map((link) => ({
                            label:
                              typeof link.label === 'string' && link.label
                                ? link.label
                                : 'Resource',
                            url: link.url as string,
                          }));
                        return (
                          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                            {module.lessons.length || moduleResources.length ? (
                              <LessonResourcesTable
                                lessons={module.lessons}
                                resources={moduleResources}
                                category={text(item, 'category')}
                                trackId={item.id}
                              />
                            ) : (
                              <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                                No lessons published in this module yet.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Curriculum not published yet"
                  description="Modules and lessons will appear here when the team publishes them."
                />
              )}
            </section>
          </>
        )}
        {resource === 'lessons' && (
          <>
            <div className="card-premium animate-fade-up relative overflow-hidden p-6 sm:p-10">
              <div
                aria-hidden
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px] dark:bg-indigo-500/20"
              />
              <div className="relative">
                <p className="whitespace-pre-wrap text-base leading-8 text-foreground/90">
                  {text(item, 'body')}
                </p>
                {(text(item, 'videoUrl') || text(item, 'pdfUrl') || text(item, 'resourceUrl')) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {text(item, 'videoUrl') && (
                      <a
                        href={text(item, 'videoUrl')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-gradient"
                      >
                        <Youtube className="size-5" />
                        Watch Video
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                    {text(item, 'pdfUrl') && (
                      <a
                        href={text(item, 'pdfUrl')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:text-blue-300"
                      >
                        <FileText className="size-5" />
                        View PDF
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                    {text(item, 'resourceUrl') && (
                      <a
                        href={text(item, 'resourceUrl')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border/70 px-5 py-2.5 text-sm font-medium transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/10"
                      >
                        Supporting resource
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              className="card-premium animate-fade-up flex flex-wrap items-center justify-between gap-4 p-6"
              style={{ animationDelay: '100ms' }}
            >
              <div>
                <p className="font-display font-bold">Track your progress</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mark this lesson complete to move your track progress forward.
                </p>
              </div>
              <StudentAction resource="lessons" item={item} />
            </div>
          </>
        )}
        {resource === 'projects' && (
          <>
            <TextSection title="Project brief" content={text(item, 'problemStatement')} />
            <Items title="Deliverables" items={list(item, 'deliverables')} />
            <Items title="Tools and technologies" items={list(item, 'stack')} />
            <Card className="p-6">
              <StudentAction resource="projects" item={item} />
            </Card>
          </>
        )}
        {resource === 'events' && (
          <>
            <Card className="p-6">
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                {[
                  ['Organizer', text(item, 'organizer')],
                  ['When', dateLabel(item.startsAt, true)],
                  ['Location / joining instructions', text(item, 'location') || 'Not specified'],
                  [
                    'Registration',
                    `${number(item, 'spotsFilled')} of ${number(item, 'spotsTotal')} places filled`,
                  ],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 border-t pt-6">
                <StudentAction resource="events" item={item} />
              </div>
            </Card>
            <Items title="Additional information" items={list(item, 'perks')} />
          </>
        )}
        {resource === 'opportunities' && (
          <>
            <Card className="p-6">
              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                {[
                  ['Organization', text(item, 'company')],
                  ['Location', text(item, 'location') || 'Not specified'],
                  ['Compensation', text(item, 'stipend') || 'Not specified'],
                  [
                    'Deadline',
                    text(item, 'deadline') ? dateLabel(item.deadline, true) : 'No fixed deadline',
                  ],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="mt-1 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Items title="Responsibilities" items={list(item, 'responsibilities')} />
            <Items title="Skills" items={list(item, 'skills')} />
            <TextSection title="Eligibility" content={text(item, 'eligibility')} />
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Apply for this opportunity</h2>
              <StudentAction resource="opportunities" item={item} />
            </Card>
          </>
        )}
        {resource === 'mentors' && (
          <>
            <TextSection title="About" content={text(item, 'bio')} />
            <TextSection title="Experience" content={text(item, 'experience')} />
            {text(item, 'bookingUrl') ? (
              <Button asChild>
                <a href={text(item, 'bookingUrl')} target="_blank" rel="noopener noreferrer">
                  Open booking page
                  <ArrowUpRight />
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                This mentor has not provided a booking link.
              </p>
            )}
          </>
        )}
        {resource === 'assessments' && (
          <AssessmentRunner key={`${item.id}-${item.version}`} assessment={item} />
        )}
      </div>
    </div>
  );
}
