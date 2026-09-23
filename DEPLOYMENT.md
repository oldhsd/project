# BuildNext deployment and cutover

This repository supplies the application, database schema, administrator bootstrap, migration checks, tests and a Render configuration. It does not contain a production database, deployed credentials or provisioned administrator. No live data is seeded by startup.

## Before deploying

1. Take and verify a backup of the existing MongoDB database. Use a staging copy for migration review.
2. Supply a dedicated MongoDB URI with authentication and TLS appropriate to the hosting environment. Restrict database access and use a least-privilege application account with the permissions needed to create the documented indexes.
3. Set a unique `AUTH_SECRET`, the exact HTTPS `AUTH_URL`, and the intended trusted-proxy settings. Do not use bootstrap credentials as permanent server environment variables.
4. Keep the production instance private or in maintenance mode during migration and initial administrator provisioning. The previous public admin bypass must not remain available on another running instance.

## Migration

Install the lockfile with development tools included:

```sh
npm ci --include=dev
npm run db:migrate
```

The default migration is **dry-run**. It reports missing legacy defaults and duplicate application groups. It never deletes records, invents courses or publishes legacy content automatically. Review unrecognised/legacy field values before using the editors. Existing embedded module arrays and abandoned in-memory records are not magically transformed into full lesson content.

After backup and review:

```sh
npm run db:migrate -- --apply
npm run db:indexes
```

User email addresses are normalised only after a collision check. Accounts missing the legacy `isActive` field get the active default; their role is not changed. Content missing a publication status gets `draft`. Records missing an optimistic-lock version get version zero. Existing publication statuses are preserved.

Duplicate enrollments, applications or submissions must be reviewed before unique indexes can be created. Index creation fails explicitly; it does not silently discard student records. Run migrations once as an operator, not concurrently in every application process.

## Administrator provisioning

Temporarily supply `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, run `npm run db:bootstrap`, and remove those variables. Existing accounts require the deliberate `--promote-existing` flag. Sign in through `/login` and open `/admin-ops`.

There is no default administrator, demo mode, public admin registration or master key. Do not publish credentials in tickets, screenshots or build logs.

## Build and start

```sh
npm run typecheck
npm run lint
npm run test:unit
npm run build
npm run db:indexes
npm run start
```

The build does not require database connectivity. Runtime `/api/health` connects to MongoDB and pings it, returning HTTP 503 when unavailable. Do not treat a successful process launch or a static home-page response as database readiness.

`render.yaml` uses Node 22, the exact lockfile, an explicit index check at startup and `/api/health`. Set `AUTH_URL` and `MONGODB_URI` in the hosting dashboard. Select the hosting capacity and availability plan appropriate for the actual service; the supplied basic plan is not an uptime commitment.

Behind another reverse proxy, forward the real scheme/host correctly and constrain allowed hostnames. Configure HTTPS, request limits, database network restrictions, monitoring and backups at the platform level. The application does not modify your DNS, database service or hosting account.

## Acceptance before opening access

Run `npm run test:e2e` locally or in CI, then verify the staging environment with an administrator and a real student account. Publish a track with a module and lesson, confirm public visibility, save student progress, test an application/submission and issue/revoke a credential. Confirm that anonymous and student requests cannot reach admin APIs.

Review empty, error and mobile states, and verify that all visible content is approved actual content. Test database unavailability separately in staging: the system must show an error, not default to fake success or sample records.

## Rollback and incident handling

Application rollback does not undo database writes. Retain the pre-cutover backup and a tested restore procedure. Do not roll back to the old exposed admin bypass. Stop unsafe traffic before restoring data, and coordinate restoration of records and indexes.

For an authentication incident, disable affected accounts and rotate `AUTH_SECRET` to invalidate existing sessions globally. Keep database and deployment secrets outside the repository. Authentication is the existing credentials-based integration; no email delivery, identity verification, payments or other external integrations are silently provisioned by this change.
