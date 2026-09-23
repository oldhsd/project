# Quick start

Use the installation and administrator-provisioning instructions in [README.md](README.md). They describe the current database-backed application and contain no shared demo credentials.

For an existing deployment, first read [DEPLOYMENT.md](DEPLOYMENT.md). Do not skip backup, dry-run migration and index checks.

```sh
npm ci --include=dev
# Configure .env.local from .env.example.
npm run db:indexes
# Supply temporary administrator variables before running the next command.
npm run db:bootstrap
npm run dev
```

Students use `/signup` and `/login`; administrators use the same sign-in page and then `/admin-ops`.
