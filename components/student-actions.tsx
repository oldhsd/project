'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, announceContentChange, useRemote } from '@/lib/client';
import { text, number, type Row } from '@/lib/content-schema';
import type { AccountData } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import { Card, Field, Input, Textarea } from '@/components/ui/primitives';
export function StudentAction({
  resource,
  item,
}: {
  resource: 'tracks' | 'lessons' | 'events' | 'opportunities' | 'projects';
  item: Row;
}) {
  const { status } = useSession();
  const account = useRemote<AccountData>(status === 'authenticated' ? '/api/me' : null, 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [consent, setConsent] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [notes, setNotes] = useState('');
  async function act(url: string, payload: unknown, message: string) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await api(url, { method: 'POST', body: JSON.stringify(payload) });
      setSuccess(message);
      account.reload();
      announceContentChange();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const path = resource === 'lessons' ? '/lessons' : `/${resource}`;
  if (status === 'loading')
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking account…
      </p>
    );
  if (status !== 'authenticated')
    return (
      <Button asChild>
        <Link href={`/login?next=${encodeURIComponent(`${path}/${item.id}`)}`}>
          Sign in to{' '}
          {resource === 'tracks'
            ? 'enroll'
            : resource === 'lessons'
              ? 'save progress'
              : resource === 'events'
                ? 'register'
                : resource === 'projects'
                  ? 'submit your project'
                  : 'apply'}
        </Link>
      </Button>
    );
  const existing =
    resource === 'tracks'
      ? account.data?.enrollments.find((r) => r.trackId === item.id)
      : resource === 'events'
        ? account.data?.registrations.find((r) => r.id === item.id)
        : resource === 'opportunities'
          ? account.data?.applications.find((r) => r.opportunityId === item.id)
          : resource === 'projects'
            ? account.data?.submissions.find((r) => r.projectId === item.id)
            : undefined;
  const lessonDone =
    resource === 'lessons' &&
    account.data?.enrollments.some(
      (enrollment) =>
        Array.isArray(enrollment.completedLessonIds) &&
        enrollment.completedLessonIds.includes(item.id)
    );
  const waiting = busy || account.loading || !account.data;
  const full =
    resource === 'events' &&
    (number(item, 'spotsFilled') >= number(item, 'spotsTotal') ||
      Date.parse(text(item, 'startsAt')) <= Date.now());
  const expired =
    resource === 'opportunities' &&
    !!text(item, 'deadline') &&
    Date.parse(text(item, 'deadline')) <= Date.now();
  return (
    <div className="space-y-4">
      {account.error && (
        <p role="alert" className="text-sm text-destructive">
          {account.error.message}{' '}
          <button className="underline" onClick={account.reload}>
            Retry
          </button>
        </p>
      )}
      {resource === 'tracks' && (
        <Button
          disabled={waiting || !!existing}
          onClick={() =>
            void act(
              '/api/enrollments',
              { trackId: item.id },
              'You are enrolled. Your progress will appear in Overview.'
            )
          }
        >
          {existing ? 'Enrolled in this track' : busy ? 'Enrolling…' : 'Enroll in track'}
        </Button>
      )}
      {resource === 'lessons' && (
        <Button
          disabled={waiting || !!lessonDone}
          onClick={() =>
            void act(`/api/lessons/${item.id}/complete`, {}, 'Lesson completion saved.')
          }
        >
          {lessonDone ? 'Lesson completed' : busy ? 'Saving…' : 'Mark lesson complete'}
        </Button>
      )}
      {resource === 'events' && (
        <Button
          disabled={waiting || !!existing || full}
          onClick={() =>
            void act(`/api/events/${item.id}/register`, {}, 'Your event registration is confirmed.')
          }
        >
          {existing
            ? 'You are registered'
            : full
              ? 'Registration closed'
              : busy
                ? 'Registering…'
                : 'Register for event'}
        </Button>
      )}
      {resource === 'opportunities' &&
        (existing ? (
          <p role="status" className="text-sm">
            Application saved ·{' '}
            <span className="font-medium capitalize">
              {text(existing, 'status').replaceAll('_', ' ')}
            </span>
          </p>
        ) : (
          <>
            <label className="flex max-w-2xl items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                I consent to share my BuildNext name, email and profile with the platform’s
                opportunity reviewers for this application.
              </span>
            </label>
            <Button
              disabled={waiting || !consent || expired}
              onClick={() =>
                void act(
                  `/api/opportunities/${item.id}/apply`,
                  { consent: true },
                  'Your application has been saved.'
                )
              }
            >
              {expired
                ? 'Application deadline passed'
                : busy
                  ? 'Submitting…'
                  : 'Submit application'}
            </Button>
          </>
        ))}
      {resource === 'projects' && (
        <>
          <h2 className="text-lg font-semibold">Submit your work</h2>
          {existing && (
            <Card className="space-y-2 p-4 text-sm">
              <p>
                Status:{' '}
                <span className="font-medium capitalize">
                  {text(existing, 'status').replaceAll('_', ' ')}
                </span>
              </p>
              <a
                className="break-all underline underline-offset-4"
                href={text(existing, 'repositoryUrl')}
                target="_blank"
                rel="noopener noreferrer"
              >
                View submitted project
              </a>
              {text(existing, 'feedback') && (
                <p className="whitespace-pre-wrap leading-6">
                  Feedback: {text(existing, 'feedback')}
                </p>
              )}
            </Card>
          )}
          {!existing || ['submitted', 'changes_requested'].includes(text(existing, 'status')) ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act(
                  `/api/projects/${item.id}/submit`,
                  { repositoryUrl, notes },
                  'Your project submission has been saved for review.'
                );
              }}
              className="max-w-2xl space-y-4"
            >
              <Field htmlFor="repository-url" label="Repository or project URL">
                <Input
                  id="repository-url"
                  type="url"
                  required
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
              </Field>
              <Field htmlFor="submission-notes" label="Notes for the reviewer">
                <Textarea
                  id="submission-notes"
                  maxLength={5000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
              <Button disabled={waiting}>
                {busy ? 'Submitting…' : existing ? 'Update submission' : 'Submit project'}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              This submission cannot be edited while it is under review or after acceptance.
            </p>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm font-medium">
          {success}
        </p>
      )}
    </div>
  );
}
