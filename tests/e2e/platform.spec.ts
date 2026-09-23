import {
  test,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import type { Row } from '../../lib/content-schema';

const base = process.env.E2E_URL!;
if (!base?.startsWith('http://127.0.0.1:') || !process.env.MONGODB_URI?.includes('buildnext_test_'))
  throw new Error('Use npm run test:e2e. Tests must never run against a deployment.');
let admin: APIRequestContext,
  student: APIRequestContext,
  other: APIRequestContext,
  anonymous: APIRequestContext;
const records: Record<string, Row> = {};
const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
const testPassword = process.env.E2E_PASSWORD!;
const visuals: { name: string; file: string; viewport: string }[] = [];

async function login(context: APIRequestContext, email: string) {
  const csrf = await (await context.get('/api/auth/csrf')).json();
  await context.post('/api/auth/callback/credentials', {
    form: {
      email,
      password: testPassword,
      csrfToken: csrf.csrfToken,
      callbackUrl: `${base}/dashboard`,
    },
    headers: { 'X-Auth-Return-Redirect': '1', Origin: base },
  });
  expect((await (await context.get('/api/auth/session')).json()).user.email).toBe(email);
}
async function create(resource: string, data: unknown) {
  const response = await admin.post(`/api/admin/content/${resource}`, { data });
  expect(response.status(), await response.text()).toBe(201);
  return (await response.json()).item as Row;
}
async function patch(resource: string, record: Row, data: unknown) {
  const response = await admin.patch(`/api/admin/content/${resource}/${record.id}`, {
    data: { ...(data as object), version: record.version },
  });
  expect(response.status(), await response.text()).toBe(200);
  return (await response.json()).item as Row;
}
async function stable(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Loading information…', { exact: true })).toHaveCount(0);
}
async function capture(page: Page, name: string, viewport = 'desktop') {
  await mkdir('.qa/screenshots', { recursive: true });
  const file = `${viewport}--${name}.png`;
  await page.screenshot({ path: `.qa/screenshots/${file}`, fullPage: true });
  visuals.push({ name, file, viewport });
}
async function openAs(page: Page, state: string) {
  const data = await admin.storageState();
  if (state === 'admin') await page.context().addCookies(data.cookies);
  else await page.context().addCookies((await student.storageState()).cookies);
}
async function uiCreate(
  page: Page,
  resource: string,
  singular: string,
  fill: (dialog: ReturnType<Page['getByRole']>) => Promise<void>
) {
  await page.goto(`/admin-ops/${resource}`);
  await stable(page);
  await page
    .getByRole('button', {
      name: resource === 'certificates' ? 'Issue certificate' : `Add ${singular}`,
      exact: true,
    })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await fill(dialog);
  await capture(page, `editor-${resource}-filled`);
  await dialog
    .getByRole('button', {
      name: resource === 'certificates' ? 'Issue certificate' : 'Create record',
      exact: true,
    })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Changes saved.' })).toBeVisible();
  const list = await (await admin.get(`/api/admin/content/${resource}?limit=100`)).json();
  return list.items[0] as Row;
}

test.describe.serial('BuildNext production foundation', () => {
  test.beforeAll(async () => {
    const options = { baseURL: base, extraHTTPHeaders: { Origin: base } };
    admin = await playwrightRequest.newContext(options);
    student = await playwrightRequest.newContext(options);
    other = await playwrightRequest.newContext(options);
    anonymous = await playwrightRequest.newContext(options);
    await login(admin, process.env.E2E_ADMIN_EMAIL!);
    await login(student, process.env.E2E_STUDENT_EMAIL!);
    await login(other, process.env.E2E_OTHER_EMAIL!);
    await admin.storageState({ path: '.qa/auth/admin.json' });
    await student.storageState({ path: '.qa/auth/student.json' });
  });
  test.afterAll(async () => {
    await writeFile('.qa/visual-index.json', JSON.stringify(visuals, null, 2));
    await Promise.all(
      [admin, student, other, anonymous].filter(Boolean).map((context) => context.dispose())
    );
  });

  test('empty public website contains no fabricated course or metric data', async ({ page }) => {
    const data = await (await anonymous.get('/api/content/tracks')).json();
    expect(data.total).toBe(0);
    await page.goto('/');
    await stable(page);
    await expect(
      page.getByRole('heading', { name: 'Learning tracks are on their way' })
    ).toBeVisible();
    await expect(
      page.getByText(/680 XP|Harsh Dixit|Globex|Try sample IDs|Demo Access/)
    ).toHaveCount(0);
    await capture(page, 'home-empty');
    for (const route of [
      'tracks',
      'projects',
      'events',
      'opportunities',
      'mentorship',
      'assessments',
    ]) {
      await page.goto(`/${route}`);
      await stable(page);
      await expect(page.getByText(/published yet/)).toBeVisible();
      await capture(page, `${route}-empty`);
    }
  });

  test('authorization, retired bypass, request origin and privacy boundaries', async () => {
    for (const resource of [
      'tracks',
      'modules',
      'lessons',
      'projects',
      'events',
      'opportunities',
      'certificates',
      'students',
      'assessments',
      'mentors',
      'settings',
      'applications',
      'submissions',
    ]) {
      expect((await anonymous.post(`/api/admin/content/${resource}`, { data: {} })).status()).toBe(
        401
      );
      expect((await student.post(`/api/admin/content/${resource}`, { data: {} })).status()).toBe(
        403
      );
    }
    for (const path of [
      '/api/admin/overview',
      '/api/content/analytics',
      '/api/content/certificates',
      '/api/content/applications',
      '/api/content/submissions',
    ])
      expect((await anonymous.get(path)).status()).toBe(401);
    expect((await anonymous.get('/api/content/students')).status()).toBe(403);
    expect(
      (await anonymous.post('/api/admin/auth', { data: { action: 'demo_login' } })).status()
    ).toBe(410);
    const forged = await playwrightRequest.newContext({
      baseURL: base,
      extraHTTPHeaders: { Cookie: 'bn_admin_token=bn_super_admin_verified_2026', Origin: base },
    });
    expect((await forged.get('/api/admin/overview')).status()).toBe(401);
    await forged.dispose();
    expect(
      (
        await admin.post('/api/admin/content/tracks', {
          headers: { Origin: 'https://attacker.invalid' },
          data: {},
        })
      ).status()
    ).toBe(403);
    expect(
      (
        await admin.post('/api/admin/content/tracks', {
          headers: { 'Content-Type': 'application/json' },
          data: '{broken',
        })
      ).status()
    ).toBe(400);
    expect(
      (
        await admin.post('/api/admin/content/tracks', { data: { description: 'x'.repeat(270000) } })
      ).status()
    ).toBe(413);
    expect(
      (
        await anonymous.post('/api/auth/signup', {
          data: {
            name: 'Attacker',
            email: 'attacker@example.invalid',
            password: testPassword,
            role: 'admin',
          },
        })
      ).status()
    ).toBe(400);
  });

  test('real admin sign-in and track creation through the interface', async ({ page }) => {
    await page.goto('/login?next=/admin-ops');
    await page.getByLabel('Email', { exact: true }).fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForURL('**/admin-ops');
    await stable(page);
    await expect(page.getByRole('heading', { name: 'Platform overview' })).toBeVisible();
    records.tracks = await uiCreate(page, 'tracks', 'track', async (dialog) => {
      await dialog.getByLabel('Track name', { exact: true }).fill('QA · Applied Engineering');
      await dialog
        .getByLabel('Description', { exact: true })
        .fill(
          'A disposable acceptance-test track for checking persistent learning content and student progress.'
        );
      await dialog.getByLabel('Category', { exact: true }).fill('Engineering');
      await dialog.getByLabel('Estimated hours', { exact: true }).fill('6');
      await dialog
        .getByLabel('Prerequisites', { exact: true })
        .fill('Basic computing\nA willingness to practice');
    });
    expect(records.tracks.status).toBe('draft');
    expect((await anonymous.get(`/api/content/tracks/${records.tracks.id}`)).status()).toBe(404);
    records.tracks = await patch('tracks', records.tracks, { status: 'published' });
    expect((await anonymous.get(`/api/content/tracks/${records.tracks.id}`)).status()).toBe(200);
  });

  test('module and lesson editors create a real published curriculum', async ({ page }) => {
    await openAs(page, 'admin');
    records.modules = await uiCreate(page, 'modules', 'module', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Foundations');
      await dialog.getByLabel('Track', { exact: true }).selectOption(records.tracks.id);
      await dialog
        .getByLabel('Description', { exact: true })
        .fill('The first module in the acceptance-test curriculum.');
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    records.lessons = await uiCreate(page, 'lessons', 'lesson', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Understand the problem');
      await dialog.getByLabel('Module', { exact: true }).selectOption(records.modules.id);
      await dialog
        .getByLabel('Lesson content', { exact: true })
        .fill(
          'Identify the goal, constraints and evidence needed to evaluate a solution.\n\nUnicode is preserved: caf\u00e9, \u4e2d\u6587, \u0394.\n<script>window.untrustedExecuted = true</script>'
        );
      await dialog.getByLabel('Duration in minutes', { exact: true }).fill('15');
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    const track = (await (await anonymous.get(`/api/content/tracks/${records.tracks.id}`)).json())
      .item;
    expect(track.modules[0].lessons[0].id).toBe(records.lessons.id);
    await page.context().clearCookies();
    await page.goto(`/lessons/${records.lessons.id}`);
    await stable(page);
    await expect(page.getByText('Identify the goal', { exact: false })).toContainText(
      'caf\u00e9, \u4e2d\u6587, \u0394'
    );
    expect(
      await page.evaluate(
        () => (window as Window & { untrustedExecuted?: boolean }).untrustedExecuted
      )
    ).toBeUndefined();
  });

  test('project, event, opportunity and mentor editors persist actual content', async ({
    page,
  }) => {
    await openAs(page, 'admin');
    records.projects = await uiCreate(page, 'projects', 'project', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Build a useful interface');
      await dialog.getByLabel('Stream', { exact: true }).fill('Engineering');
      await dialog
        .getByLabel('Summary', { exact: true })
        .fill('Apply a small set of interface principles to a practical problem.');
      await dialog
        .getByLabel('Project brief', { exact: true })
        .fill(
          'Define a user need, document your design decisions, and publish the resulting project for review.'
        );
      await dialog
        .getByLabel('Deliverables', { exact: true })
        .fill('A working interface\nA clear README');
      await dialog.getByLabel('Tools and technologies', { exact: true }).fill('HTML\nCSS');
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    records.events = await uiCreate(page, 'events', 'event', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Project review workshop');
      await dialog.getByLabel('Organizer', { exact: true }).fill('QA Team');
      await dialog.getByLabel('Start date and time (UTC)', { exact: true }).fill(future);
      await dialog.getByLabel('Capacity', { exact: true }).fill('2');
      await dialog
        .getByLabel('Description', { exact: true })
        .fill('A disposable event used to test atomic registrations and capacity management.');
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    records.opportunities = await uiCreate(page, 'opportunities', 'opportunity', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Engineering opportunity');
      await dialog.getByLabel('Company or organization', { exact: true }).fill('QA Organization');
      await dialog
        .getByLabel('Description', { exact: true })
        .fill(
          'A disposable opportunity used to verify consent, application persistence and review workflows.'
        );
      await dialog.getByLabel('Application deadline (UTC)', { exact: true }).fill(future);
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    records.mentors = await uiCreate(page, 'mentors', 'mentor', async (dialog) => {
      await dialog.getByLabel('Name', { exact: true }).fill('QA Mentor');
      await dialog.getByLabel('Role', { exact: true }).fill('Project reviewer');
      await dialog.getByLabel('Area of expertise', { exact: true }).fill('Engineering');
      await dialog
        .getByLabel('Biography', { exact: true })
        .fill(
          'This disposable mentor record verifies that the directory is administered through the database.'
        );
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    for (const resource of ['projects', 'events', 'opportunities', 'mentors'])
      expect(
        (await anonymous.get(`/api/content/${resource}/${records[resource].id}`)).status()
      ).toBe(200);
  });

  test('question editor stores answer keys without exposing them publicly', async ({ page }) => {
    await openAs(page, 'admin');
    records.assessments = await uiCreate(page, 'assessments', 'assessment', async (dialog) => {
      await dialog.getByLabel('Title', { exact: true }).fill('QA · Foundations check');
      await dialog.getByLabel('Category', { exact: true }).fill('Engineering');
      await dialog.getByRole('button', { name: 'Add question', exact: true }).click();
      await dialog
        .getByLabel('Question text', { exact: true })
        .fill('What should be clarified before designing a solution?');
      await dialog
        .getByLabel('Question 1, option 1', { exact: true })
        .fill('The problem and its constraints');
      await dialog
        .getByLabel('Question 1, option 2', { exact: true })
        .fill('Only the color palette');
      await dialog.getByLabel('Publication status', { exact: true }).selectOption('published');
    });
    const publicData = await (
      await anonymous.get(`/api/content/assessments/${records.assessments.id}`)
    ).json();
    expect(JSON.stringify(publicData)).not.toContain('correctIndex');
    expect(JSON.stringify(publicData)).not.toContain('explanation');
    expect((records.assessments.questions as { correctIndex: number }[])[0].correctIndex).toBe(0);
  });

  test('student, website settings and certificate creation use real references', async ({
    page,
  }) => {
    await openAs(page, 'admin');
    records.students = await uiCreate(page, 'students', 'student', async (dialog) => {
      await dialog.getByLabel('Full name', { exact: true }).fill('QA Created Student');
      await dialog
        .getByLabel('Email', { exact: true })
        .fill(`created-${randomUUID()}@example.invalid`);
      await dialog.getByLabel('Initial password', { exact: true }).fill(testPassword);
    });
    expect(records.students.role).toBe('student');
    expect(records.students.password).toBeUndefined();
    records.settings = await uiCreate(page, 'settings', 'website settings', async (dialog) => {
      await dialog.getByLabel('Home page heading', { exact: true }).fill('QA · Learn by building');
      await dialog
        .getByLabel('Home page introduction', { exact: true })
        .fill('This text was published through the admin panel, without editing frontend code.');
      await dialog
        .getByLabel('Announcement', { exact: true })
        .fill(
          'Isolated acceptance-test environment. All records shown here are temporary test fixtures.'
        );
    });
    records.certificates = await uiCreate(page, 'certificates', 'certificate', async (dialog) => {
      await dialog.getByLabel('Student', { exact: true }).selectOption(process.env.E2E_STUDENT_ID!);
      await dialog.getByLabel('Published track', { exact: true }).selectOption(records.tracks.id);
    });
    expect(String(records.certificates.certificateId)).toMatch(/^BN-[A-F0-9]{32}$/);
    const verify = await (
      await anonymous.get(`/api/content/certificates?id=${records.certificates.certificateId}`)
    ).json();
    expect(verify.certificate.studentName).toBe('QA Student');
    expect(verify.certificate.status).toBe('issued');
    for (const key of [
      'email',
      'studentEmail',
      'userId',
      'trackId',
      'issuedBy',
      'updatedBy',
      'revocationReason',
    ])
      expect(verify.certificate[key]).toBeUndefined();
    await page.context().clearCookies();
    await page.goto('/');
    await stable(page);
    await expect(page.getByRole('heading', { name: 'QA · Learn by building' })).toBeVisible();
  });

  test('enrollment is idempotent and completion survives reload', async ({ page }) => {
    await openAs(page, 'student');
    await page.goto(`/tracks/${records.tracks.id}`);
    await stable(page);
    await page.getByRole('button', { name: 'Enroll in track', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Enrolled in this track' })).toBeDisabled();
    const requests = await Promise.all(
      Array.from({ length: 6 }, () =>
        student.post('/api/enrollments', { data: { trackId: records.tracks.id } })
      )
    );
    requests.forEach((response) => expect(response.status()).toBe(200));
    expect(
      (await student.post('/api/enrollments', { data: { trackId: 'a'.repeat(24) } })).status()
    ).toBe(404);
    await page.goto(`/lessons/${records.lessons.id}`);
    await stable(page);
    await page.getByRole('button', { name: 'Mark lesson complete' }).click();
    await expect(page.getByRole('button', { name: 'Lesson completed' })).toBeDisabled();
    await page.reload();
    await stable(page);
    await expect(page.getByRole('button', { name: 'Lesson completed' })).toBeDisabled();
    const me = await (await student.get('/api/me')).json();
    expect(me.enrollments).toHaveLength(1);
    expect(me.enrollments[0].progress).toBe(100);
  });

  test('applications require consent, cannot impersonate students and are idempotent', async ({
    page,
  }) => {
    expect(
      (
        await student.post(`/api/opportunities/${records.opportunities.id}/apply`, {
          data: { consent: false },
        })
      ).status()
    ).toBe(400);
    expect(
      (
        await student.post(`/api/opportunities/${records.opportunities.id}/apply`, {
          data: { consent: true, userId: process.env.E2E_OTHER_ID },
        })
      ).status()
    ).toBe(400);
    await openAs(page, 'student');
    await page.goto(`/opportunities/${records.opportunities.id}`);
    await stable(page);
    const button = page.getByRole('button', { name: 'Submit application', exact: true });
    await expect(button).toBeDisabled();
    await page.getByRole('checkbox').check();
    await button.click();
    await expect(page.getByText('Application saved ·', { exact: false })).toBeVisible();
    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        student.post(`/api/opportunities/${records.opportunities.id}/apply`, {
          data: { consent: true },
        })
      )
    );
    responses.forEach((response) => expect(response.status()).toBe(200));
    const applications = await (await student.get('/api/content/applications')).json();
    expect(applications.total).toBe(1);
    records.applications = applications.items[0];
    expect((await (await other.get('/api/content/applications')).json()).total).toBe(0);
    expect(
      (await (await anonymous.get(`/api/content/opportunities/${records.opportunities.id}`)).json())
        .item.applicantsCount
    ).toBe(1);
    expect(
      (
        await student.patch(`/api/admin/content/applications/${records.applications.id}`, {
          data: { version: records.applications.version, status: 'selected' },
        })
      ).status()
    ).toBe(403);
    records.applications = await patch('applications', records.applications, {
      status: 'shortlisted',
    });
    expect((await (await student.get('/api/content/applications')).json()).items[0].status).toBe(
      'shortlisted'
    );
  });

  test('registrations enforce capacity atomically and repeat registrations do not consume places', async () => {
    const first = await Promise.all(
      Array.from({ length: 8 }, () =>
        student.post(`/api/events/${records.events.id}/register`, { data: {} })
      )
    );
    first.forEach((response) => expect(response.status()).toBe(200));
    const third = await playwrightRequest.newContext({
      baseURL: base,
      extraHTTPHeaders: { Origin: base },
    });
    await login(third, String(records.students.email));
    const contenders = await Promise.all([
      other.post(`/api/events/${records.events.id}/register`, { data: {} }),
      third.post(`/api/events/${records.events.id}/register`, { data: {} }),
    ]);
    expect(contenders.map((r) => r.status()).sort()).toEqual([200, 409]);
    await third.dispose();
    const event = (await (await anonymous.get(`/api/content/events/${records.events.id}`)).json())
      .item;
    expect(event.spotsFilled).toBe(2);
    expect(event.registeredUserIds).toBeUndefined();
    records.events = (
      await (await admin.get(`/api/admin/content/events/${records.events.id}`)).json()
    ).item;
    expect(
      (
        await admin.patch(`/api/admin/content/events/${records.events.id}`, {
          data: { version: records.events.version, spotsTotal: 1 },
        })
      ).status()
    ).toBe(409);
  });

  test('project submissions and assessment grades are saved, not simulated', async ({ page }) => {
    await openAs(page, 'student');
    await page.goto(`/projects/${records.projects.id}`);
    await stable(page);
    await page
      .getByLabel('Repository or project URL', { exact: true })
      .fill('https://example.org/acceptance-project');
    await page
      .getByLabel('Notes for the reviewer', { exact: true })
      .fill('Test-only submission to verify the review workflow.');
    await page.getByRole('button', { name: 'Submit project', exact: true }).click();
    await expect(
      page.getByText('Your project submission has been saved for review.')
    ).toBeVisible();
    records.submissions = (await (await student.get('/api/content/submissions')).json()).items[0];
    records.submissions = await patch('submissions', records.submissions, {
      status: 'changes_requested',
      feedback: 'Please add clear setup instructions.',
    });
    await page.reload();
    await stable(page);
    await expect(page.getByText('Feedback: Please add clear setup instructions.')).toBeVisible();
    expect(
      (
        await student.post(`/api/projects/${records.projects.id}/submit`, {
          data: { repositoryUrl: 'javascript:alert(1)' },
        })
      ).status()
    ).toBe(400);
    await page.goto(`/assessments/${records.assessments.id}`);
    await stable(page);
    await page.getByRole('radio', { name: 'The problem and its constraints', exact: true }).check();
    await page.getByRole('button', { name: 'Submit answers', exact: true }).click();
    await expect(page.getByRole('heading', { name: '100%' })).toBeVisible();
    const requestId = randomUUID();
    const payload = { answers: [1], version: records.assessments.version, requestId };
    const first = await student.post(`/api/assessments/${records.assessments.id}/submit`, {
      data: payload,
    });
    const second = await student.post(`/api/assessments/${records.assessments.id}/submit`, {
      data: payload,
    });
    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    expect((await first.json()).item.percentage).toBe(0);
    expect((await second.json()).item.id).toBe((await first.json()).item.id);
    expect((await (await student.get('/api/me')).json()).attempts).toHaveLength(2);
  });

  test('optimistic locking, archived parents, immutable references and closed deadlines', async () => {
    const old = records.tracks;
    records.tracks = await patch('tracks', old, {
      description: 'Updated from the database, without a rebuild.',
    });
    expect(
      (
        await admin.patch(`/api/admin/content/tracks/${old.id}`, {
          data: { version: old.version, name: 'Stale edit' },
        })
      ).status()
    ).toBe(409);
    records.tracks = await patch('tracks', records.tracks, { status: 'archived' });
    expect((await anonymous.get(`/api/content/lessons/${records.lessons.id}`)).status()).toBe(404);
    expect(
      (await anonymous.get(`/api/content/modules?trackId=${records.tracks.id}`)).status()
    ).toBe(404);
    records.tracks = await patch('tracks', records.tracks, { status: 'published' });
    expect(
      (
        await admin.patch(`/api/admin/content/modules/${records.modules.id}`, {
          data: { version: records.modules.version, trackId: 'a'.repeat(24) },
        })
      ).status()
    ).toBe(400);
    records.opportunities = await patch('opportunities', records.opportunities, {
      deadline: '2020-01-01T00:00:00Z',
    });
    expect(
      (
        await other.post(`/api/opportunities/${records.opportunities.id}/apply`, {
          data: { consent: true },
        })
      ).status()
    ).toBe(409);
    records.opportunities = await patch('opportunities', records.opportunities, {
      deadline: `${future}:00.000Z`,
    });
  });

  test('certificate revocation is public and irreversible without exposing private details', async ({
    page,
  }) => {
    await openAs(page, 'admin');
    await page.goto('/admin-ops/certificates');
    await stable(page);
    await page
      .getByRole('button', { name: `Edit ${records.certificates.certificateId}`, exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Credential status', { exact: true }).selectOption('revoked');
    await dialog
      .getByLabel('Revocation reason', { exact: true })
      .fill('Disposable test record revoked during acceptance testing.');
    await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
    const confirmation = page.getByRole('alertdialog');
    await expect(confirmation).toBeVisible();
    await capture(page, 'certificate-revoke-confirmation');
    await confirmation.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    records.certificates = (
      await (await admin.get(`/api/admin/content/certificates/${records.certificates.id}`)).json()
    ).item;
    const verified = await (
      await anonymous.get(`/api/content/certificates?id=${records.certificates.certificateId}`)
    ).json();
    expect(verified.certificate.status).toBe('revoked');
    expect(verified.certificate.revocationReason).toBeUndefined();
    expect(
      (
        await admin.patch(`/api/admin/content/certificates/${records.certificates.id}`, {
          data: { version: records.certificates.version, status: 'issued' },
        })
      ).status()
    ).toBe(409);
    records.activeCertificate = await create('certificates', {
      userId: process.env.E2E_STUDENT_ID,
      trackId: records.tracks.id,
      grade: 'Pass',
      issueDate: new Date().toISOString().slice(0, 10),
    });
  });

  test('profile edits persist and deactivation invalidates an existing authenticated session', async ({
    page,
  }) => {
    await openAs(page, 'student');
    await page.goto('/profile');
    await stable(page);
    await page
      .getByLabel('About you', { exact: true })
      .fill('Learning through practical engineering projects.');
    await page.getByRole('button', { name: 'Save profile', exact: true }).click();
    await expect(page.getByText('Your profile has been saved.')).toBeVisible();
    await page.reload();
    await stable(page);
    await expect(page.getByLabel('About you', { exact: true })).toHaveValue(
      'Learning through practical engineering projects.'
    );
    let person = (
      await (await admin.get(`/api/admin/content/students/${process.env.E2E_OTHER_ID}`)).json()
    ).item;
    person = await patch('students', person, { isActive: false });
    expect((await other.get('/api/me')).status()).toBe(401);
    expect(
      (await other.post('/api/enrollments', { data: { trackId: records.tracks.id } })).status()
    ).toBe(401);
    await patch('students', person, { isActive: true });
    expect((await other.get('/api/me')).status()).toBe(200);
  });

  test('all final routes pass browser, responsive and accessibility checks and produce visual evidence', async ({
    browser,
  }) => {
    test.setTimeout(240000);
    const publicRoutes: [string, string][] = [
      ['home', '/'],
      ['login', '/login'],
      ['signup', '/signup'],
      ['tracks', '/tracks'],
      ['track-detail', `/tracks/${records.tracks.id}`],
      ['lesson', `/lessons/${records.lessons.id}`],
      ['projects', '/projects'],
      ['project-detail', `/projects/${records.projects.id}`],
      ['events', '/events'],
      ['event-detail', `/events/${records.events.id}`],
      ['opportunities', '/opportunities'],
      ['opportunity-detail', `/opportunities/${records.opportunities.id}`],
      ['mentorship', '/mentorship'],
      ['mentor-detail', `/mentorship/${records.mentors.id}`],
      ['assessments', '/assessments'],
      ['assessment-detail', `/assessments/${records.assessments.id}`],
      ['verify', '/verify'],
      ['certificate-active', `/verify/${records.activeCertificate.certificateId}`],
      ['certificate-revoked', `/verify/${records.certificates.certificateId}`],
      ['certificate-missing', '/verify/BN-NOTFOUND123456'],
    ];
    const personalRoutes: [string, string][] = [
      ['dashboard', '/dashboard'],
      ['profile', '/profile'],
      ['my-certificates', '/certificates'],
    ];
    const adminRoutes: [string, string][] = [
      ['admin-overview', '/admin-ops'],
      ...[
        'students',
        'tracks',
        'modules',
        'lessons',
        'projects',
        'events',
        'opportunities',
        'assessments',
        'mentors',
        'applications',
        'submissions',
        'certificates',
        'settings',
      ].map((resource) => [`admin-${resource}`, `/admin-ops/${resource}`] as [string, string]),
    ];
    const errors: string[] = [];
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 1000 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      for (const group of [
        { routes: publicRoutes, state: undefined },
        { routes: personalRoutes, state: '.qa/auth/student.json' },
        { routes: adminRoutes, state: '.qa/auth/admin.json' },
      ]) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          storageState: group.state,
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        for (const [name, route] of group.routes) {
          await page.goto(route);
          await stable(page);
          await expect(page.locator('h1')).toHaveCount(1);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth + 1
            ),
            `${name} overflows at ${viewport.name}`
          ).toBe(true);
          const accessibility = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          expect(
            accessibility.violations.filter(
              (v) => v.impact === 'serious' || v.impact === 'critical'
            ),
            `${name} accessibility at ${viewport.name}`
          ).toEqual([]);
          await capture(page, name, viewport.name);
        }
        if (viewport.name === 'mobile') {
          await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
          await expect(page.getByRole('dialog')).toBeVisible();
          await capture(
            page,
            `navigation-${group.state?.includes('admin') ? 'admin' : group.state ? 'student' : 'public'}`,
            'mobile'
          );
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).not.toBeVisible();
        }
        await context.close();
      }
    }
    const dark = await browser.newContext({
      storageState: '.qa/auth/admin.json',
      viewport: { width: 1440, height: 1000 },
    });
    const page = await dark.newPage();
    await page.goto('/admin-ops');
    await stable(page);
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await capture(page, 'admin-overview-dark');
    const a11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      a11y.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    ).toEqual([]);
    await dark.close();
    expect(errors).toEqual([]);
  });
  test('all admin editors fit desktop/mobile, retain accessible fields and restore keyboard focus', async ({
    browser,
  }) => {
    test.setTimeout(120000);
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 1000 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({
        storageState: '.qa/auth/admin.json',
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      for (const resource of [
        'students',
        'tracks',
        'modules',
        'lessons',
        'projects',
        'events',
        'opportunities',
        'assessments',
        'mentors',
        'applications',
        'submissions',
        'certificates',
        'settings',
      ]) {
        await page.goto(`/admin-ops/${resource}`);
        await stable(page);
        const trigger = page.getByRole('button', { name: /^Edit / }).first();
        await trigger.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.evaluate((element) => {
          element.scrollTop = 0;
        });
        const bounds = await dialog.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x, `${resource} left edge`).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width, `${resource} right edge`).toBeLessThanOrEqual(
          viewport.width + 1
        );
        const accessibility = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          accessibility.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
          `${resource} editor accessibility`
        ).toEqual([]);
        await capture(page, `editor-${resource}-top`, viewport.name);
        if (await dialog.evaluate((element) => element.scrollHeight > element.clientHeight + 20)) {
          await dialog.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
          });
          await capture(page, `editor-${resource}-bottom`, viewport.name);
        }
        const fieldsBounds = await dialog.locator('form > fieldset').boundingBox();
        const saveBounds = await dialog
          .getByRole('button', { name: 'Save changes', exact: true })
          .boundingBox();
        expect(fieldsBounds).not.toBeNull();
        expect(saveBounds).not.toBeNull();
        expect(
          saveBounds!.y,
          `${resource} save action must not cover form fields`
        ).toBeGreaterThanOrEqual(fieldsBounds!.y + fieldsBounds!.height);
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();
      }
      await context.close();
    }
  });

  test('admin review search resolves real student and content names', async () => {
    for (const url of [
      '/api/admin/content/applications?q=QA%20Student',
      '/api/admin/content/applications?q=Engineering%20opportunity',
      '/api/admin/content/submissions?q=useful%20interface',
      '/api/admin/content/settings?q=Learn%20by%20building',
    ]) {
      const response = await admin.get(url);
      expect(response.status()).toBe(200);
      expect((await response.json()).total).toBe(1);
    }
  });
});
