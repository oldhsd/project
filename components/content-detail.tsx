'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Youtube,
} from 'lucide-react';
import { api, useRemote } from '@/lib/client';
import { type Row, text, number, list } from '@/lib/content-schema';
import { dateLabel } from '@/lib/utils';
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
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{content}</p>
    </section>
  ) : null;
}
function Items({ title, items }: { title: string; items: string[] }) {
  return items.length ? (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
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
  return (
    <input
      type="checkbox"
      className="size-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={done ? 'Mark lesson not done' : 'Mark lesson done'}
      title={saveHint}
      checked={done}
      disabled={busy || !canSave}
      onChange={toggle}
    />
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
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
    >
      <Youtube className="size-4 shrink-0 text-red-500" />
      Watch Video
      <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
    </a>
  );
}
function PdfButton({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
    >
      <FileText className="size-4 shrink-0 text-blue-500" />
      View PDF
      <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-4">
          <p className="text-sm text-muted-foreground">
            Enroll in this track to save your lesson progress.
          </p>
          <Button size="sm" disabled={enrolling} onClick={enroll}>
            {enrolling ? 'Enrolling…' : 'Enroll in track'}
          </Button>
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
      <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="w-10 px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Video Link</th>
            <th className="px-4 py-3 font-medium">PDF Link</th>
            <th className="w-16 px-4 py-3 text-center font-medium">Done</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource, index) => {
            const kind = resourceKind(resource.url, resource.label);
            return (
              <tr key={`resource-${index}`} className="border-b hover:bg-accent/50">
                <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-medium">{resource.label || 'Resource'}</span>
                  {category && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {kind === 'video' ? <VideoButton url={resource.url} /> : tableDash}
                </td>
                <td className="px-4 py-3">
                  {kind === 'pdf' ? <PdfButton url={resource.url} /> : tableDash}
                </td>
                <td className="px-4 py-3 text-center">{tableDash}</td>
              </tr>
            );
          })}
          {lessons.map((lesson, index) => {
            const videoUrl = text(lesson, 'videoUrl');
            const pdfUrl = text(lesson, 'pdfUrl');
            return (
              <tr key={lesson.id} className="border-b last:border-0 hover:bg-accent/50">
                <td className="px-4 py-3 text-muted-foreground">
                  {resources.length + index + 1}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/lessons/${lesson.id}`} className="font-medium hover:underline">
                    {text(lesson, 'title')}
                  </Link>
                  {category && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {videoUrl ? <VideoButton url={videoUrl} /> : tableDash}
                </td>
                <td className="px-4 py-3">
                  {pdfUrl ? <PdfButton url={pdfUrl} /> : tableDash}
                </td>
                <td className="px-4 py-3 text-center">
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
        <Button variant="ghost" asChild className="mb-5">
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
  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 -ml-3">
        <Link href={parent.href}>
          <ArrowLeft />
          Back to {parent.title.toLowerCase()}
        </Link>
      </Button>
      <PageHeading
        title={text(item, 'name') || text(item, 'title')}
        description={
          resource === 'projects'
            ? text(item, 'summary')
            : resource === 'mentors'
              ? [text(item, 'role'), text(item, 'company')].filter(Boolean).join(' · ')
              : text(item, 'description')
        }
      />
      <div className="mb-8 flex flex-wrap gap-2">
        {[
          text(item, 'category') || text(item, 'trackCategory') || text(item, 'domain'),
          text(item, 'difficulty'),
          text(item, 'mode'),
          text(item, 'type'),
        ]
          .filter(Boolean)
          .map((label, i) => (
            <Badge key={i}>{label}</Badge>
          ))}
      </div>
      <div className="space-y-8">
        {resource === 'tracks' && (
          <>
            <Card className="space-y-5 p-6">
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                <p>{modules.length} published modules</p>
                {number(item, 'estimatedHours') > 0 && (
                  <p>{number(item, 'estimatedHours')} estimated hours</p>
                )}
              </div>
              <StudentAction resource="tracks" item={item} />
            </Card>
            <Items title="Prerequisites" items={list(item, 'prerequisites')} />
            <section>
              <h2 className="mb-5 text-xl font-semibold">Curriculum</h2>
              {modules.length ? (
                <div className="space-y-6">
                  {modules.map((module, index) => (
                    <Card key={module.id} className="p-6 sm:p-8">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Module {index + 1}
                      </p>
                      <h3 className="text-lg font-semibold">{text(module, 'title')}</h3>
                      {text(module, 'description') && (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {text(module, 'description')}
                        </p>
                      )}
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
                          <div className="mt-5">
                            {module.lessons.length || moduleResources.length ? (
                              <LessonResourcesTable
                                lessons={module.lessons}
                                resources={moduleResources}
                                category={text(item, 'category')}
                                trackId={item.id}
                              />
                            ) : (
                              <p className="rounded-md border p-4 text-sm text-muted-foreground">
                                No lessons published in this module yet.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </Card>
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
            <Card className="p-6 sm:p-8">
              <p className="whitespace-pre-wrap text-base leading-8">{text(item, 'body')}</p>
              {(text(item, 'videoUrl') || text(item, 'pdfUrl') || text(item, 'resourceUrl')) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {text(item, 'videoUrl') && (
                    <Button asChild variant="outline">
                      <a
                        href={text(item, 'videoUrl')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="text-red-500" />
                        Watch Video
                        <ArrowUpRight />
                      </a>
                    </Button>
                  )}
                  {text(item, 'pdfUrl') && (
                    <Button asChild variant="outline">
                      <a href={text(item, 'pdfUrl')} target="_blank" rel="noopener noreferrer">
                        <FileText className="text-blue-500" />
                        View PDF
                        <ArrowUpRight />
                      </a>
                    </Button>
                  )}
                  {text(item, 'resourceUrl') && (
                    <Button asChild variant="outline">
                      <a
                        href={text(item, 'resourceUrl')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Supporting resource
                        <ArrowUpRight />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </Card>
            <StudentAction resource="lessons" item={item} />
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
