# BuildNext

A database-backed student platform built on the existing Next.js App Router, React, Tailwind CSS, MongoDB/Mongoose and Auth.js codebase. This implementation consolidates the previously separate database and in-memory content stores; it does not introduce another backend service or replace the framework.

**Admin → MongoDB → published website.** There are no automatic demo accounts, seeded courses, fabricated metrics or in-memory content fallbacks. An empty database produces explicit empty states; an unavailable database produces an error, not invented content.

## Get running

Use Node.js 22 LTS (Node 24 is also supported) and a dedicated MongoDB database. Install the exact lockfile:

```sh
npm ci --include=dev
```

Copy `.env.example` to `.env.local`, configure `MONGODB_URI`, a unique random `AUTH_SECRET`, and the exact `AUTH_URL`. To generate a secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Then run:

```sh
npm run db:indexes
npm run dev
```

Open the origin configured in `AUTH_URL`. Do not switch between `localhost` and `127.0.0.1` while testing authenticated writes: origin validation intentionally distinguishes them.

### Provision the first administrator

Supply `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` temporarily through your operator environment or secret manager, then run:

```sh
npm run db:bootstrap
```

The password must contain at least 12 characters and no more than 72 UTF-8 bytes. There is no default password and no public administrator signup. Existing accounts are not modified unless the operator explicitly uses `npm run db:bootstrap -- --promote-existing`; that command promotes the specified account and replaces its password. Remove the bootstrap environment variables immediately afterwards.

Sign in at `/login`, then open `/admin-ops`. `/admin` and `/admin-ops/access` redirect to the canonical admin area. The former `/api/admin/auth` bypass endpoint is deliberately retired with HTTP 410.

## What the admin controls

| Area | Supported operations |
| --- | --- |
| Students | Create a student with an initial password; edit profile details; deactivate or reactivate access. No web-based administrator promotion. |
| Tracks | Create/edit learning paths, categories, prerequisites, difficulty, estimated hours and publication status. |
| Modules | Add modules to a real track and set their display order. |
| Lessons | Add lesson text, duration, supporting resource links and order within a real module. |
| Projects | Maintain briefs, summaries, deliverables and technologies. |
| Events | Maintain event details, UTC times and capacity; view the actual registration count. |
| Opportunities | Maintain role details, eligibility, compensation, deadlines and publication/closed status. |
| Mentors | Maintain profiles and genuine external booking links. No simulated availability or booking confirmations. |
| Assessments | Create questions, answer choices, correct answers and passing thresholds. Answer keys stay private. |
| Applications | Review real consented applications and change review status. |
| Submissions | Review student project URLs and provide status/feedback. |
| Certificates | Issue credentials to actual students for published tracks; revoke with a reason; inspect public verification. |
| Website | Edit the home-page heading, introduction and announcement. |

All collections have searchable, paginated views, validation and explicit save failures. Reference pickers support searches instead of requiring database IDs to be typed. Edit requests carry a record version; conflicting edits fail with HTTP 409 rather than overwriting a newer change.

### Publication and archiving

Create a track, its modules and their lessons, then publish the intended records. Drafts are private. A draft or archived track hides its modules and lessons even when the children are individually marked published. Records and student history are retained when content is archived; there is no destructive cascade deletion.

A saved publication is available on the next website request. Open content views refresh on focus and every 30 seconds while visible. The editing tab refreshes immediately after a successful mutation. There is no rebuild or manual frontend content change required.

Track/module/lesson parent references and certificate recipients cannot be reassigned after creation. Create a new record when its identity or parent changes. This preserves existing student relationships.

## Student workflows

Published catalog pages are public. Signing in is required to enroll, save lesson completion, submit projects, register for events, take assessments, apply for opportunities, view personal certificates or edit a profile.

- Enrollment and lesson completion are idempotent. Progress is calculated from completed lessons in the **currently published curriculum**, not a fabricated percentage or XP balance.
- Event registration checks capacity and allocates the place in one atomic MongoDB update. Repeated requests by the same student do not consume more places.
- Applications require explicit profile-sharing consent and are unique per student/opportunity. Closed or expired opportunities reject new applications.
- Project submissions store an actual URL and notes. Students can update submissions awaiting review or requiring changes, but not accepted work or work already under review.
- Assessment grading occurs on the server against a versioned answer key. Results are stored as attempts, with idempotency protection for retries. Duration is labelled as suggested; the assessment is not represented as proctored or timed.
- Credentials use randomly generated 128-bit identifiers. The public registry exposes issuance snapshots and current status, not email addresses or internal student IDs. A revoked credential cannot be reactivated. This is database-backed verification, not a claim of cryptographic signing.

## Security boundaries

Every protected page and API operation rechecks the account's active state and role in MongoDB. A stale JWT or the former demo cookie never grants administrator rights. Private records are scoped to the signed-in user; administrator collections use separate authenticated endpoints.

Mutation endpoints enforce same-origin requests, bounded JSON bodies, strict Zod schemas, normalized email addresses, validated references and HTTP/HTTPS-only links. Password hashes and event attendee IDs are not part of public responses. Login/signup and student writes have database-backed rate limits. Queries escape user search terms rather than accepting database operators.

`AUTH_URL` must match the real HTTPS origin in production. Only enable `AUTH_TRUST_HOST` behind a trusted host/proxy configuration. Only enable `TRUST_PROXY` when the edge overwrites `X-Forwarded-For`; otherwise the application uses a conservative shared signup quota rather than trusting attacker-supplied addresses.

The application sends anti-framing, content-type, referrer and permissions headers, plus a baseline CSP. This CSP deliberately does not claim nonce-based script enforcement. HSTS is enabled when the configured origin is HTTPS. Use the hosting platform's TLS, access logging, request-size limits and secret storage. Rotate `AUTH_SECRET` to invalidate all existing sessions during an authentication incident.

## Data model and API

Canonical models live in `models/index.ts`; validated content schemas live in `lib/content-schema.ts`; persistence and publication logic live in `lib/data-service.ts`. UI-facing configuration is kept separately in `lib/admin-config.ts`.

Main API surfaces:

```text
GET                 /api/content/{resource}
GET                 /api/content/{resource}/{id}
GET, POST           /api/admin/content/{resource}
GET, PATCH, DELETE  /api/admin/content/{resource}/{id}
GET                 /api/admin/overview
GET, PATCH          /api/me
POST                /api/enrollments
POST                /api/lessons/{id}/complete
POST                /api/projects/{id}/submit
POST                /api/events/{id}/register
POST                /api/opportunities/{id}/apply
POST                /api/assessments/{id}/submit
GET                 /api/content/certificates?id={credentialId}
GET                 /api/health
```

Collection responses contain `items`, `total`, `page`, `pages`, and `limit`. Pagination is bounded to 100 records per request. Public content uses `status=published` enforced by the server, not a client filter. `DELETE` on an archivable admin resource archives/deactivates it and requires `{ "version": <current version> }`. Review and certificate resources use explicit status updates instead.

Existing `/api/tracks`, `/api/opportunities`, and compatible `/api/content/*` write paths delegate to the same service and authorization checks. There is no alternate unprotected write path.

## Checks

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

`test:e2e` starts a **real temporary MongoDB process** and the production Next.js server, provisions generated test-only accounts, exercises the interfaces and APIs, restarts the application to check persistence, and then deletes the temporary database. It never uses the deployment URI. Temporary acceptance fixtures are restricted to the test harness; normal application startup seeds nothing.

Playwright captures desktop/mobile screenshots for the public, student and admin route inventory, checks page errors, horizontal overflow and serious/critical accessibility violations, and writes an HTML report. `.qa/`, `test-results/` and `playwright-report/` are excluded from Git. Screenshots are test evidence, not real customer data. Manual visual review findings are recorded separately in `docs/VERIFICATION.md`.

## Upgrading an existing installation

Read [DEPLOYMENT.md](DEPLOYMENT.md) before switching a live instance. Back up the existing database, run the migration dry run, review legacy fields and duplicates, apply deliberately, create indexes, and bootstrap a trusted administrator. Missing publication statuses become **draft**, never automatically public.

The old in-memory store was not persistent. Content that only existed in that process cannot be reconstructed from MongoDB. Import verified source material through the admin controls instead of generating replacement content.

Next.js is pinned to the supported 15.x maintenance line to avoid a framework rebuild. The existing Auth.js credentials integration is retained and pinned. A targeted PostCSS override removes vulnerable nested versions while keeping the supported Next.js major. Keep the lockfile under review and run the audit in CI when dependencies change.
