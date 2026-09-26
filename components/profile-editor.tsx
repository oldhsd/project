'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type Row, text, list, number } from '@/lib/content-schema';
import { api, announceContentChange, useRemote } from '@/lib/client';
import type { AccountData } from '@/lib/view-types';
import { Button } from '@/components/ui/button';
import {
  Card,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeading,
  Select,
  Textarea,
} from '@/components/ui/primitives';
function Editor({ profile }: { profile: Row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [version, setVersion] = useState(profile.version);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    setSuccess('');
    const data = {
      name: form.get('name'),
      stream: form.get('stream'),
      year: Number(form.get('year')),
      bio: form.get('bio'),
      interests: String(form.get('interests'))
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      github: form.get('github'),
      linkedin: form.get('linkedin'),
      version,
    };
    try {
      const result = await api<{ profile: Row }>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setVersion(result.profile.version);
      setSuccess('Your profile has been saved.');
      announceContentChange();
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="profile-name" label="Full name">
          <Input
            id="profile-name"
            name="name"
            required
            minLength={2}
            maxLength={180}
            defaultValue={text(profile, 'name')}
            autoComplete="name"
          />
        </Field>
        <Field
          htmlFor="profile-email"
          label="Email"
          hint="Contact a platform administrator to correct your email address."
        >
          <Input id="profile-email" type="email" value={text(profile, 'email')} readOnly />
        </Field>
        <Field htmlFor="profile-stream" label="Study stream">
          <Input
            id="profile-stream"
            name="stream"
            maxLength={300}
            defaultValue={text(profile, 'stream')}
          />
        </Field>
        <Field htmlFor="profile-year" label="Study year">
          <Select id="profile-year" name="year" defaultValue={number(profile, 'year') || 1}>
            {Array.from({ length: 4 }, (_, i) => (
              <option key={i} value={i + 1}>
                Year {i + 1}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field htmlFor="profile-bio" label="About you">
        <Textarea
          id="profile-bio"
          name="bio"
          maxLength={2000}
          defaultValue={text(profile, 'bio')}
        />
      </Field>
      <Field htmlFor="profile-interests" label="Interests" hint="Enter one interest per line.">
        <Textarea
          id="profile-interests"
          name="interests"
          defaultValue={list(profile, 'interests').join('\n')}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="profile-github" label="GitHub URL">
          <Input
            id="profile-github"
            name="github"
            type="url"
            defaultValue={text(profile, 'github')}
          />
        </Field>
        <Field htmlFor="profile-linkedin" label="LinkedIn URL">
          <Input
            id="profile-linkedin"
            name="linkedin"
            type="url"
            defaultValue={text(profile, 'linkedin')}
          />
        </Field>
      </div>
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
      <Button disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</Button>
    </form>
  );
}
export function ProfileEditor() {
  const remote = useRemote<AccountData>('/api/me', 0);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        title="My profile"
        description="Keep your personal details and interests up to date."
      />
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : !remote.data ? (
        <LoadingState />
      ) : (
        <Card className="p-6 sm:p-8">
          <Editor key={remote.data.profile.id} profile={remote.data.profile} />
        </Card>
      )}
    </div>
  );
}
