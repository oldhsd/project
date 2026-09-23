'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { useRemote } from '@/lib/client';
import { type Row, text } from '@/lib/content-schema';
import type { Collection } from '@/lib/view-types';
import { dateLabel } from '@/lib/utils';
import { PublicHeader } from '@/components/shell';
import { Button } from '@/components/ui/button';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeading,
  Pagination,
} from '@/components/ui/primitives';
export function MyCertificates() {
  const [page, setPage] = useState(1);
  const remote = useRemote<Collection>(`/api/content/certificates?page=${page}`);
  return (
    <>
      <PageHeading
        title="My certificates"
        description="Credentials issued to your account, including their current registry status."
      />
      {remote.error ? (
        <ErrorState message={remote.error.message} retry={remote.reload} />
      ) : !remote.data ? (
        <LoadingState />
      ) : remote.data.items.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {remote.data.items.map((certificate) => (
            <Card className="p-6" key={certificate.id}>
              <Badge>{text(certificate, 'status')}</Badge>
              <h2 className="mt-4 text-lg font-semibold">{text(certificate, 'trackName')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {text(certificate, 'grade')} · Issued {dateLabel(certificate.issueDate)}
              </p>
              <p className="mt-4 break-all font-mono text-xs text-muted-foreground">
                {text(certificate, 'certificateId')}
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href={`/verify/${text(certificate, 'certificateId')}`}>
                  View registry record
                  <ArrowUpRight />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No certificates issued yet"
          description="Certificates will appear here after they have been issued to your account by the BuildNext team."
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
function CertificateResult({ code }: { code: string }) {
  const remote = useRemote<{ certificate: Row }>(
    `/api/content/certificates?id=${encodeURIComponent(code)}`
  );
  if (remote.error?.status === 404)
    return (
      <EmptyState
        title="Certificate not found"
        description="Check the complete credential ID and try again. No matching record was found in the registry."
      />
    );
  if (remote.error) return <ErrorState message={remote.error.message} retry={remote.reload} />;
  if (!remote.data) return <LoadingState />;
  const cert = remote.data.certificate;
  const revoked = cert.status === 'revoked';
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <h2 className="text-lg font-semibold">
          {revoked ? 'Certificate revoked' : 'Certificate issued'}
        </h2>
        <Badge className={revoked ? 'border-destructive/40 text-destructive' : ''}>
          {revoked ? 'Not valid' : 'Active record'}
        </Badge>
      </div>
      <p className="mt-5 break-all font-mono text-xs text-muted-foreground">
        {text(cert, 'certificateId')}
      </p>
      {revoked && (
        <p role="status" className="mt-4 text-sm font-medium text-destructive">
          This credential has been revoked by BuildNext and is no longer valid.
        </p>
      )}
      <dl className="mt-7 grid gap-6 sm:grid-cols-2">
        {[
          ['Recipient', text(cert, 'studentName')],
          ['Learning track', text(cert, 'trackName')],
          ['Grade', text(cert, 'grade')],
          ['Issue date', dateLabel(cert.issueDate)],
          ['Category', text(cert, 'category')],
          ['Issuer', 'BuildNext'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 border-t pt-5 text-xs leading-6 text-muted-foreground">
        This page reports the credential’s current status in the BuildNext database. A revoked
        record does not constitute a valid credential.
      </p>
    </Card>
  );
}
export function CertificatePortal({ code }: { code?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(code || '');
  return (
    <>
      <PublicHeader />
      <main id="main-content" className="mx-auto min-h-[75vh] max-w-2xl px-4 py-12 sm:px-6">
        <PageHeading
          title="Certificate registry"
          eyebrow="BuildNext verification"
          description="Enter the credential ID printed on a BuildNext certificate to check its details and status."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/verify/${encodeURIComponent(query.trim().toUpperCase())}`);
          }}
          className="mb-8 space-y-3"
        >
          <Field label="Certificate ID" htmlFor="certificate-id">
            <Input
              id="certificate-id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              maxLength={90}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Button type="submit">Verify certificate</Button>
        </form>
        {code && <CertificateResult key={code} code={code} />}
      </main>
    </>
  );
}
