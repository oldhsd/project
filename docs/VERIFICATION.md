# BuildNext verification record

## Environment and scope

Checks were executed through Devbox Hermes in an isolated checkout of `oldhsd/project`, based on `83c01417b90a80f3d209b9b759d7b665f9cac311`. The implementation retains the existing Next.js/React/MongoDB application. No production database, hosting configuration, account or deployment was modified.

Local execution used Node 24.14.0, npm 11.6.2, Next.js 15.5.26, Playwright Chromium and a real temporary MongoDB 7.0.24 process. The configured CI and deployment runtime is Node 22. Test accounts and records are generated only in the isolated `buildnext_test_*` database; normal startup seeds nothing.

## Executed automated checks

| Check | Observed local result |
| --- | --- |
| Clean dependency install | `npm ci --include=dev --no-fund` passed after regenerating the lockfile from an empty dependency directory. |
| Type checking | `npm run typecheck` passed. |
| Lint | `npm run lint` passed. |
| Unit tests | 15 passed, including streamed body limits, validation, authorization inputs, URL/date checks and UTF-8 source integrity. |
| Production build | `npm run build` passed without database access during the build. |
| Browser acceptance | 17 serial tests passed against the production server and isolated MongoDB. |
| Dependency audit | `npm audit --omit=dev --audit-level=high` reported zero vulnerabilities. |
| Application restart | The published track records remained identical after stopping and restarting the Next.js application against the same MongoDB process. |

The final local browser run also verifies that every admin editor's save button is below its form fields, not positioned over them.

### Browser coverage

The acceptance suite exercises real administrator sign-in and UI creation of tracks, modules, lessons, projects, events, opportunities, mentors, assessments, students, website settings and certificates. It checks draft visibility, parent publication rules, Unicode preservation, escaped lesson text, private answer keys, consent, actual student actions and actual review results.

The suite verifies anonymous/student/admin boundaries across every resource, rejection of the retired demo cookie and bypass endpoint, same-origin enforcement, malformed and oversized bodies, role/identity injection, optimistic-lock conflicts, immutable relationships, capacity-safe concurrent registration, idempotent enrollment/applications/assessment submission, deadline checks, credential revocation and immediate enforcement of account deactivation.

The route sweep covers 37 route/state entries at 1440 x 1000 and 390 x 844, plus navigation overlays and a dark-theme overview. It checks page errors, document overflow and serious/critical axe violations for WCAG 2 A/AA and WCAG 2.1 AA tags. A further sweep opens all 13 admin editors at both widths, checks dialog bounds and accessibility, captures top/bottom form content and verifies Escape closes the editor and returns keyboard focus to the initiating Edit button.

These are Chromium viewport checks, not a claim of cross-browser certification, real-device testing, complete WCAG conformance or a comprehensive penetration test.

## Manual visual review

Status: final screenshot review is in progress. This section will be updated before the pull request is marked ready for review.

Issues already found and corrected during verification:

- Mobile admin tables exceeded the document width. Mobile records now use cards with visible actions; desktop tables remain contained.
- Asynchronous editor loading disabled the initiating button before the dialog could remember it. The initiating control is captured explicitly and focus restoration is regression-tested for all editors.
- A fixed save bar could obscure the final field in long forms. Actions now sit after the form fields in normal document flow, with an overlap regression assertion.
- A Windows text-encoding conversion affected some source strings. The files were repaired, subsequent edits use explicit UTF-8 and a unit test now guards against corruption.

## Evidence and limitations

The test harness writes `.qa/screenshots`, `.qa/visual-index.json`, `playwright-report` and `test-results`. These generated artifacts and authenticated browser state are deliberately excluded from Git. CI uploads browser evidence with short retention. Screenshots contain clearly labelled temporary acceptance-test fixtures, never imported customer records or purported real course data.

The restart check concerns the application process, not a MongoDB process restart or a backup/restore exercise. Hosting, TLS, production secrets, backup recovery, migration review and initial administrator provisioning remain explicit operator steps described in `DEPLOYMENT.md`.
