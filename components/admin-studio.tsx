'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Plus, RefreshCw, Pencil, Archive, ArrowUpRight } from 'lucide-react';
import { adminConfig } from '@/lib/admin-config';
import { type Resource, type Row, text } from '@/lib/content-schema';
import { api, announceContentChange, useRemote } from '@/lib/client';
import { dateLabel } from '@/lib/utils';
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
  Select,
} from '@/components/ui/primitives';
import { ConfirmDialog, Dialog } from '@/components/ui/dialog';
import { AdminEditor } from '@/components/admin-editor';
export type Collection = {
  items: Row[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};
export function AdminOverview() {
  const remote = useRemote<{ counts: Record<Resource, number> }>('/api/admin/overview');
  return (
    <>
      <PageHeading
        title="Platform overview"
        eyebrow="Administration"
        description="Manage the learning platform from one place. Counts below reflect stored records, including drafts and archives."
      >
        <Button asChild>
          <Link href="/admin-ops/tracks">
            <Plus />
            Manage tracks
          </Link>
        </Button>
      </PageHeading>
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : !remote.data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(['students', 'tracks', 'opportunities', 'certificates'] as Resource[]).map((key) => (
              <Card key={key} className="p-5">
                <p className="text-sm text-muted-foreground">{adminConfig[key].label}</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {remote.data!.counts[key]}
                </p>
                <Link
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                  href={`/admin-ops/${key}`}
                >
                  Manage {key}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Card>
            ))}
          </div>
          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">Content and records</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Changes are saved to MongoDB. Published content appears on the website without a code
              deployment.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(adminConfig) as Resource[]).map((key) => (
                <Link
                  key={key}
                  href={`/admin-ops/${key}`}
                  className="rounded-lg border bg-card p-5 hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{adminConfig[key].label}</h3>
                    {key !== 'settings' && <Badge>{remote.data!.counts[key]}</Badge>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {adminConfig[key].description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
export function AdminStudio({ resource }: { resource: Resource }) {
  const definition = adminConfig[resource];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const remote = useRemote<Collection>(
    `/api/admin/content/${resource}?page=${page}&q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`
  );
  const [editor, setEditor] = useState<{ record: Row | null } | null>(null);
  const [archive, setArchive] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  const editorTrigger = useRef<HTMLElement | null>(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const statusField = definition.fields.find((f) => f.key === 'status');
  async function edit(id: string) {
    editorTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActionError('');
    setBusy(true);
    try {
      const result = await api<{ item: Row }>(`/api/admin/content/${resource}/${id}`);
      setEditor({ record: result.item });
    } catch (error) {
      setActionError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function saved() {
    setEditor(null);
    setMessage('Changes saved. Published content is now available on the website.');
    remote.reload();
    announceContentChange();
  }
  async function doArchive() {
    if (!archive) return;
    setBusy(true);
    setActionError('');
    try {
      await api(`/api/admin/content/${resource}/${archive.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ version: archive.version }),
      });
      setArchive(null);
      setMessage(
        resource === 'students'
          ? 'Student account deactivated.'
          : 'Content archived. Its records and history have been retained.'
      );
      remote.reload();
      announceContentChange();
    } catch (error) {
      setArchive(null);
      setActionError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function recordStatus(record: Row) {
    return (
      <Badge>
        {resource === 'students'
          ? record.isActive
            ? 'Active'
            : 'Inactive'
          : text(record, 'status').replaceAll('_', ' ') || 'Saved'}
      </Badge>
    );
  }
  function recordDetails(record: Row) {
    return (
      <>
        <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">
          {[
            text(record, 'email'),
            text(record, 'studentLabel'),
            text(record, 'company'),
            text(record, 'trackLabel'),
            text(record, 'moduleLabel'),
            text(record, 'category'),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {resource === 'events' && (
          <p className="mt-1 text-xs text-muted-foreground">
            {String(record.spotsFilled)} / {String(record.spotsTotal)} registered
          </p>
        )}
        {resource === 'certificates' && (
          <Link
            className="mt-2 inline-block text-xs underline underline-offset-4"
            href={`/verify/${text(record, 'certificateId')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View verification
          </Link>
        )}
      </>
    );
  }
  function recordActions(record: Row, mobile = false) {
    return (
      <div className={`flex flex-wrap gap-2 ${mobile ? '' : 'justify-end'}`}>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void edit(record.id)}
          aria-label={`Edit ${text(record, definition.titleKey) || definition.singular}`}
        >
          <Pencil />
          Edit
        </Button>
        {!['settings', 'certificates', 'applications', 'submissions'].includes(resource) &&
          (resource === 'students' ? Boolean(record.isActive) : record.status !== 'archived') && (
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setArchive(record)}
              aria-label={`${resource === 'students' ? 'Deactivate' : 'Archive'} ${text(record, definition.titleKey)}`}
            >
              <Archive />
              <span className={mobile ? '' : 'sr-only'}>
                {resource === 'students' ? 'Deactivate' : 'Archive'}
              </span>
            </Button>
          )}
      </div>
    );
  }
  const canCreate =
    definition.create !== false && (resource !== 'settings' || remote.data?.total === 0);
  return (
    <>
      <PageHeading
        title={definition.label}
        eyebrow="Administration"
        description={definition.description}
      >
        <Button variant="outline" onClick={remote.reload} disabled={busy}>
          <RefreshCw />
          Refresh
        </Button>
        {canCreate && (
          <Button
            onClick={() => {
              setActionError('');
              editorTrigger.current = document.activeElement as HTMLElement;
              setEditor({ record: null });
            }}
          >
            <Plus />
            {resource === 'certificates' ? 'Issue certificate' : `Add ${definition.singular}`}
          </Button>
        )}
      </PageHeading>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="record-search" className="sr-only">
            Search {definition.label.toLowerCase()}
          </label>
          <Input
            id="record-search"
            type="search"
            placeholder={`Search ${definition.label.toLowerCase()}…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {statusField && (
          <div className="sm:w-48">
            <label htmlFor="status-filter" className="sr-only">
              Filter status
            </label>
            <Select
              id="status-filter"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {statusField.options?.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {message && (
        <p role="status" className="mb-4 rounded-md border bg-muted/40 p-3 text-sm">
          {message}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive"
        >
          {actionError}
        </p>
      )}
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : remote.loading || !remote.data ? (
        <LoadingState />
      ) : remote.data.items.length === 0 ? (
        <EmptyState
          title={
            query || status ? 'No matching records' : `No ${definition.label.toLowerCase()} yet`
          }
          description={
            query || status
              ? 'Try a different search or status filter.'
              : definition.create === false
                ? 'Student activity will appear here when it is submitted.'
                : 'Create your first record to start managing this section.'
          }
        >
          {canCreate && (
            <Button
              variant="outline"
              onClick={() => {
                editorTrigger.current = document.activeElement as HTMLElement;
                setEditor({ record: null });
              }}
            >
              Add {definition.singular}
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {remote.data.items.map((record) => (
              <Card key={record.id} className="min-w-0 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="min-w-0 text-base font-semibold">
                    {text(record, definition.titleKey) || 'Record'}
                  </h2>
                  {recordStatus(record)}
                </div>
                {recordDetails(record)}
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {dateLabel(record.updatedAt)}
                </p>
                <div className="mt-4 border-t pt-4">{recordActions(record, true)}</div>
              </Card>
            ))}
          </div>
          <Card className="hidden min-w-0 max-w-full overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="table min-w-[620px]">
                <caption className="sr-only">{definition.label} management</caption>
                <thead>
                  <tr>
                    <th scope="col">{resource === 'students' ? 'Student' : 'Record'}</th>
                    <th scope="col">Status</th>
                    <th scope="col">Updated</th>
                    <th scope="col" className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {remote.data.items.map((record) => (
                    <tr key={record.id}>
                      <td className="max-w-lg">
                        <p className="font-medium">
                          {text(record, definition.titleKey) || 'Record'}
                        </p>
                        {recordDetails(record)}
                      </td>
                      <td>{recordStatus(record)}</td>
                      <td className="whitespace-nowrap text-xs text-muted-foreground">
                        {dateLabel(record.updatedAt)}
                      </td>
                      <td>{recordActions(record)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      {remote.data && (
        <Pagination
          page={page}
          pages={remote.data.pages}
          total={remote.data.total}
          change={setPage}
        />
      )}
      <Dialog
        open={!!editor}
        busy={editorBusy}
        returnFocusRef={editorTrigger}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
        title={`${editor?.record ? 'Edit' : 'Add'} ${definition.singular}`}
        description={definition.description}
        wide
      >
        {editor && (
          <AdminEditor
            key={editor.record?.id || 'new'}
            resource={resource}
            onBusyChange={setEditorBusy}
            record={editor.record}
            saved={saved}
            cancel={() => setEditor(null)}
          />
        )}
      </Dialog>
      <ConfirmDialog
        open={!!archive}
        onOpenChange={(open) => !open && setArchive(null)}
        title={resource === 'students' ? 'Deactivate this student?' : 'Archive this content?'}
        description={
          resource === 'students'
            ? 'The student will immediately lose authenticated access. Their records will be retained, and you can reactivate the account later.'
            : 'This removes the content from the public website. Related learning and student records are retained.'
        }
        confirm={() => void doArchive()}
        busy={busy}
      />
    </>
  );
}
