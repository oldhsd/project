'use client';
import { useRef, useState } from 'react';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import { api, ClientError, useRemote } from '@/lib/client';
import { adminConfig, type EditorField } from '@/lib/admin-config';
import { text, number, type Resource, type Row } from '@/lib/content-schema';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { Field, Input, Select, Textarea } from '@/components/ui/primitives';

type Question = { question: string; options: string[]; correctIndex: number; explanation: string };
function QuestionEditor({
  value,
  onChange,
}: {
  value: Question[];
  onChange: (value: Question[]) => void;
}) {
  function update(index: number, patch: Partial<Question>) {
    onChange(value.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }
  return (
    <fieldset className="space-y-5">
      <legend className="mb-2 text-sm font-medium">Questions and answer keys</legend>
      <p className="text-xs leading-5 text-muted-foreground">
        Select the correct answer for every question. Answer keys are only available to
        administrators.
      </p>
      {value.map((question, index) => (
        <fieldset key={index} className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-semibold">Question {index + 1}</legend>
          <Field htmlFor={`question-${index}`} label="Question text">
            <Textarea
              id={`question-${index}`}
              required
              value={question.question}
              onChange={(e) => update(index, { question: e.target.value })}
            />
          </Field>
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-medium">Answer choices</legend>
            {question.options.map((option, choice) => (
              <div key={choice} className="flex items-start gap-2">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  aria-label={`Mark option ${choice + 1} correct for question ${index + 1}`}
                  className="mt-3 size-4 shrink-0"
                  checked={question.correctIndex === choice}
                  onChange={() => update(index, { correctIndex: choice })}
                />
                <Input
                  aria-label={`Question ${index + 1}, option ${choice + 1}`}
                  required
                  value={option}
                  onChange={(e) =>
                    update(index, {
                      options: question.options.map((item, i) =>
                        i === choice ? e.target.value : item
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove option ${choice + 1} from question ${index + 1}`}
                  disabled={question.options.length <= 2}
                  onClick={() =>
                    update(index, {
                      options: question.options.filter((_, i) => i !== choice),
                      correctIndex:
                        question.correctIndex === choice
                          ? 0
                          : question.correctIndex > choice
                            ? question.correctIndex - 1
                            : question.correctIndex,
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={question.options.length >= 8}
              onClick={() => update(index, { options: [...question.options, ''] })}
            >
              Add answer choice
            </Button>
          </fieldset>
          <Field htmlFor={`explanation-${index}`} label="Explanation (admin reference)">
            <Textarea
              id={`explanation-${index}`}
              value={question.explanation}
              onChange={(e) => update(index, { explanation: e.target.value })}
            />
          </Field>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <Trash2 />
            Remove question
          </Button>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={value.length >= 100}
        onClick={() =>
          onChange([
            ...value,
            { question: '', options: ['', ''], correctIndex: 0, explanation: '' },
          ])
        }
      >
        <Plus />
        Add question
      </Button>
    </fieldset>
  );
}
function PdfUploadEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await api<{ url: string; label: string }>('/api/admin/uploads', {
        method: 'POST',
        body: form,
      });
      onChange(result.url);
    } catch (err) {
      setError(err instanceof ClientError ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            View uploaded PDF
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => onChange('')}
          >
            <Trash2 />
            Remove
          </Button>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          {busy ? 'Uploading…' : value ? 'Replace PDF' : 'Upload PDF from computer'}
        </Button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
function AddContentDialog({
  moduleId,
  order,
  open,
  onOpenChange,
  onSaved,
}: {
  moduleId: string;
  order: number;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function close() {
    if (!busy) onOpenChange(false);
  }

  async function save() {
    const name = title.trim();
    if (name.length < 2) {
      setError('Lecture name must be at least 2 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/content/lessons', {
        method: 'POST',
        body: JSON.stringify({
          title: name,
          moduleId,
          body: name,
          videoUrl: videoUrl.trim(),
          pdfUrl,
          status: 'published',
          order,
        }),
      });
      setTitle('');
      setVideoUrl('');
      setPdfUrl('');
      onSaved();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : 'Could not add content.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add content"
      description="Add a lecture to this module. It appears as a row in the track curriculum table."
      busy={busy}
    >
      <div className="space-y-5">
        <Field label="Lecture name" htmlFor="content-title">
          <Input
            id="content-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Java"
            autoComplete="off"
          />
        </Field>
        <Field
          label="Video link"
          htmlFor="content-video"
          hint="Paste the lecture video link, e.g. a YouTube URL."
        >
          <Input
            id="content-video"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
          />
        </Field>
        <Field
          label="PDF"
          htmlFor="content-pdf"
          hint="Upload a PDF from your computer. No link is needed."
        >
          <PdfUploadEditor value={pdfUrl} onChange={setPdfUrl} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={close}>
            Cancel
          </Button>
          <Button type="button" disabled={busy} onClick={() => void save()}>
            {busy ? 'Adding…' : 'Add content'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
function ModuleContentManager({ moduleId }: { moduleId: string }) {
  const lessons = useRemote<{ items: Row[] }>(
    `/api/admin/content/lessons?moduleId=${moduleId}&limit=100`
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const items = lessons.data?.items ?? [];
  const nextOrder = items.reduce((max, item) => Math.max(max, number(item, 'order')), -1) + 1;

  async function remove(item: Row) {
    if (deleting) return;
    setDeleting(item.id);
    setError('');
    try {
      await api(`/api/admin/content/lessons/${item.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ version: item.version }),
      });
      lessons.reload();
    } catch (err) {
      setError(err instanceof ClientError ? err.message : 'Could not delete this lecture.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="rounded-lg border p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Module content</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Lectures added here appear as rows in the track curriculum table — each with its
            video link and PDF.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus />
          Add Content
        </Button>
      </div>
      {lessons.loading ? (
        <p className="text-sm text-muted-foreground">Loading content…</p>
      ) : lessons.error ? (
        <p className="text-sm text-destructive">
          {lessons.error.message}{' '}
          <button type="button" className="underline" onClick={lessons.reload}>
            Retry
          </button>
        </p>
      ) : items.length ? (
        <ul className="divide-y rounded-md border">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="w-6 shrink-0 text-xs text-muted-foreground">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{text(item, 'title')}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {text(item, 'videoUrl') ? 'Video added' : 'No video'}
                  {' · '}
                  {text(item, 'pdfUrl') ? 'PDF added' : 'No PDF'}
                  {text(item, 'status') !== 'published' ? ' · Draft' : ''}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${text(item, 'title')}`}
                disabled={deleting === item.id}
                onClick={() => void remove(item)}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No content yet. Click “Add Content” to add the first lecture.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <AddContentDialog
        moduleId={moduleId}
        order={nextOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => {
          setDialogOpen(false);
          lessons.reload();
        }}
      />
    </section>
  );
}
function ReferenceSelect({
  field,
  value,
  label,
  onChange,
  disabled,
  publishedOnly,
}: {
  field: EditorField;
  value: string;
  label: string;
  onChange: (value: string) => void;
  disabled: boolean;
  publishedOnly: boolean;
}) {
  const [query, setQuery] = useState('');
  const remote = useRemote<{ items: Row[]; total: number }>(
    disabled
      ? null
      : `/api/admin/content/${field.reference}?limit=100&q=${encodeURIComponent(query)}${publishedOnly ? '&status=published' : ''}`,
    0
  );
  const options = remote.data?.items || [];
  return (
    <div className="space-y-2">
      {!disabled && (
        <Input
          aria-label={`Search ${field.label.toLowerCase()} options`}
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <Select
        id={field.key}
        disabled={disabled}
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose {field.label.toLowerCase()}</option>
        {value && !options.some((row) => row.id === value) && (
          <option value={value}>{label || value}</option>
        )}
        {options
          .filter((row) => field.reference !== 'students' || row.isActive !== false)
          .map((row) => (
            <option key={row.id} value={row.id}>
              {text(row, 'name') || text(row, 'title')}
              {text(row, 'email') ? ` — ${text(row, 'email')}` : ''}
            </option>
          ))}
      </Select>
      {remote.error && (
        <p role="alert" className="text-sm text-destructive">
          {remote.error.message}{' '}
          <button type="button" className="underline" onClick={remote.reload}>
            Retry
          </button>
        </p>
      )}
      {remote.loading && <p className="text-xs text-muted-foreground">Loading choices…</p>}
      {!!remote.data && remote.data.total > 100 && (
        <p className="text-xs text-muted-foreground">
          Showing the first 100 matches. Refine the search to find another record.
        </p>
      )}
    </div>
  );
}
function initialValues(resource: Resource, record: Row | null): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of adminConfig[resource].fields) {
    const value =
      record?.[field.key] ??
      field.initial ??
      (field.kind === 'checkbox' ? false : field.kind === 'questions' ? [] : '');
    values[field.key] =
      field.kind === 'lines'
        ? Array.isArray(value)
          ? value.join('\n')
          : ''
        : field.kind === 'datetime' && value
          ? String(value).slice(0, 16)
          : value;
  }
  if (resource === 'certificates' && !record)
    values.issueDate = new Date().toISOString().slice(0, 10);
  return values;
}
export function AdminEditor({
  resource,
  record,
  saved,
  cancel,
  onBusyChange,
}: {
  resource: Resource;
  record: Row | null;
  saved: () => void;
  cancel: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    initialValues(resource, record)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ClientError | null>(null);
  const [revoke, setRevoke] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const fields: EditorField[] = [
    ...adminConfig[resource].fields,
    ...(resource === 'students' && !record
      ? [
          {
            key: 'password',
            label: 'Initial password',
            kind: 'password' as const,
            required: true,
            hint: 'At least 12 characters, maximum 72 UTF-8 bytes. Share it securely with the student.',
          },
        ]
      : []),
  ];
  async function save() {
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      const data: Record<string, unknown> = {};
      for (const field of fields) {
        const value = values[field.key];
        data[field.key] =
          field.kind === 'lines'
            ? String(value || '')
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : field.kind === 'number'
              ? Number(value)
              : field.kind === 'datetime'
                ? value
                  ? new Date(`${value}:00Z`).toISOString()
                  : ''
                : (value ?? '');
      }
      if (record) data.version = record.version;
      await api(`/api/admin/content/${resource}${record ? `/${record.id}` : ''}`, {
        method: record ? 'PATCH' : 'POST',
        body: JSON.stringify(data),
      });
      setRevoke(false);
      saved();
    } catch (error) {
      setError(
        error instanceof ClientError ? error : new ClientError('Unable to save this record.')
      );
      setRevoke(false);
      window.setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (resource === 'certificates' && record?.status === 'issued' && values.status === 'revoked')
      setRevoke(true);
    else void save();
  }
  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        {record && ['applications', 'submissions', 'certificates'].includes(resource) && (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
            {[
              'studentLabel',
              'studentEmail',
              'opportunityLabel',
              'projectLabel',
              'trackName',
              'certificateId',
              'notes',
            ].map((key) => text(record, key) && <p key={key}>{text(record, key)}</p>)}
            {resource === 'applications' && (
              <p className="text-muted-foreground">
                Profile-sharing consent: {record.consent === true ? 'Granted' : 'Not recorded'}
              </p>
            )}
            {text(record, 'repositoryUrl') && (
              <a
                href={text(record, 'repositoryUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block break-all font-medium underline underline-offset-4"
              >
                Open submitted project
              </a>
            )}
          </div>
        )}
        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-destructive/40 p-4 text-sm text-destructive"
          >
            <p className="font-medium">{error.message}</p>
            {Object.entries(error.fields).map(([key, messages]) => (
              <p key={key} className="mt-1">
                {fields.find((f) => f.key === key)?.label || key}: {messages.join(' ')}
              </p>
            ))}
            {error.status === 409 && (
              <p className="mt-2">
                Close this editor and reopen the record to load its latest version.
              </p>
            )}
          </div>
        )}
        <fieldset disabled={busy} className="space-y-5">
          {fields.map((field) => {
            const value = values[field.key];
            const change = (value: unknown) =>
              setValues((previous) => ({ ...previous, [field.key]: value }));
            const disabled = !!record && !!field.locked;
            const common = {
              id: field.key,
              required: field.required,
              disabled,
              'aria-invalid': !!error?.fields[field.key],
              'aria-describedby':
                [
                  field.hint && `${field.key}-hint`,
                  error?.fields[field.key] && `${field.key}-error`,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined,
            };
            if (field.kind === 'questions')
              return (
                <QuestionEditor key={field.key} value={value as Question[]} onChange={change} />
              );
            if (field.kind === 'pdf-upload')
              return (
                <Field
                  key={field.key}
                  label={field.label}
                  htmlFor={field.key}
                  hint={field.hint}
                  error={error?.fields[field.key]?.join(' ')}
                >
                  <PdfUploadEditor value={String(value || '')} onChange={change} />
                </Field>
              );
            if (field.kind === 'checkbox')
              return (
                <label key={field.key} className="flex items-center gap-3 text-sm font-medium">
                  <input
                    id={field.key}
                    type="checkbox"
                    className="size-4"
                    checked={!!value}
                    onChange={(e) => change(e.target.checked)}
                  />
                  {field.label}
                </label>
              );
            return (
              <Field
                key={field.key}
                label={field.label}
                htmlFor={field.key}
                hint={field.hint}
                error={error?.fields[field.key]?.join(' ')}
              >
                {field.kind === 'reference' ? (
                  <ReferenceSelect
                    field={field}
                    value={String(value || '')}
                    label={
                      record
                        ? text(
                            record,
                            field.key === 'userId'
                              ? 'studentLabel'
                              : field.key === 'trackId'
                                ? 'trackLabel'
                                : 'moduleLabel'
                          )
                        : ''
                    }
                    onChange={change}
                    disabled={disabled}
                    publishedOnly={resource === 'certificates' && field.key === 'trackId'}
                  />
                ) : field.kind === 'select' ? (
                  <Select
                    {...common}
                    value={String(value || '')}
                    onChange={(e) => change(e.target.value)}
                  >
                    {field.options
                      ?.filter(
                        (option) =>
                          resource !== 'certificates' ||
                          field.key !== 'status' ||
                          (record
                            ? record.status !== 'revoked' || option === 'revoked'
                            : option === 'issued')
                      )
                      .map((option) => (
                        <option key={option} value={option}>
                          {option.replaceAll('_', ' ')}
                        </option>
                      ))}
                  </Select>
                ) : field.kind === 'textarea' || field.kind === 'lines' ? (
                  <Textarea
                    {...common}
                    rows={field.key === 'body' ? 12 : 4}
                    required={
                      field.required ||
                      (resource === 'certificates' &&
                        field.key === 'revocationReason' &&
                        values.status === 'revoked')
                    }
                    value={String(value || '')}
                    onChange={(e) => change(e.target.value)}
                  />
                ) : (
                  <Input
                    {...common}
                    type={
                      field.kind === 'datetime'
                        ? 'datetime-local'
                        : ['number', 'date', 'url', 'email', 'password'].includes(field.kind || '')
                          ? field.kind
                          : 'text'
                    }
                    min={field.min}
                    max={
                      field.kind === 'date' && resource === 'certificates'
                        ? new Date().toISOString().slice(0, 10)
                        : field.max
                    }
                    step={field.kind === 'number' ? 1 : undefined}
                    minLength={field.kind === 'password' ? 12 : undefined}
                    autoComplete={field.kind === 'password' ? 'new-password' : 'off'}
                    value={String(value ?? '')}
                    onChange={(e) => change(e.target.value)}
                  />
                )}
              </Field>
            );
          })}
        </fieldset>
        {resource === 'modules' &&
          (record ? (
            <ModuleContentManager moduleId={record.id} />
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Save this module first, then add its lectures with “Add Content”.
            </p>
          ))}
        <div className="flex flex-wrap justify-end gap-2 border-t bg-background pt-5">
          <Button type="button" variant="outline" disabled={busy} onClick={cancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy
              ? 'Saving…'
              : record
                ? 'Save changes'
                : resource === 'certificates'
                  ? 'Issue certificate'
                  : 'Create record'}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={revoke}
        onOpenChange={setRevoke}
        title="Revoke this certificate?"
        description="This credential will immediately be marked revoked in the public registry. This cannot be undone."
        confirm={() => void save()}
        busy={busy}
      />
    </>
  );
}
