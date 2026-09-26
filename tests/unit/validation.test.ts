import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emailSchema,
  objectId,
  passwordSchema,
  publicResources,
  resourceSchemas,
  safeUrl,
} from '../../lib/content-schema';
import { ApiError, bodyJson, sameOrigin } from '../../lib/http';

test('emails are trimmed and normalized before lookup', () =>
  assert.equal(emailSchema.parse('  Person@Example.COM '), 'person@example.com'));
test('passwords enforce minimum length and bcrypt byte ceiling', () => {
  assert.equal(passwordSchema.safeParse('tiny').success, false);
  assert.equal(passwordSchema.safeParse('x'.repeat(72)).success, true);
  assert.equal(passwordSchema.safeParse('é'.repeat(37)).success, false);
});
test('student input cannot assign a role or password hash', () => {
  assert.equal(
    resourceSchemas.students.safeParse({ name: 'Student', email: 's@example.com', role: 'admin' })
      .success,
    false
  );
});
test('unsafe URL schemes are rejected', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,test',
    'file:///etc/passwd',
    'ftp://example.com',
  ])
    assert.equal(safeUrl.safeParse(value).success, false);
  assert.equal(safeUrl.safeParse('https://example.org/a').success, true);
});
test('uploaded file URLs are accepted and never throw a raw TypeError', () => {
  // Regression: /api/files/<id> must pass so the Add Content dialog can save
  // an uploaded PDF, and invalid input must stay a ZodError (400), not a 503.
  const uploaded = safeUrl.safeParse('/api/files/68d5f2a1b3c4d5e6f708192a');
  assert.equal(uploaded.success, true);
  for (const value of ['not-a-url', '/api/files/../../etc/passwd', '/other/path']) {
    const parsed = safeUrl.safeParse(value);
    assert.equal(parsed.success, false);
  }
  assert.equal(safeUrl.safeParse('').success, true);
});
test('identifiers reject object and operator injection', () => {
  for (const value of ['', { $ne: null }, 'not-an-id', 'a'.repeat(25)])
    assert.equal(objectId.safeParse(value).success, false);
});
test('new content defaults to draft and rejects unknown keys', () => {
  const input = { name: 'Track', description: 'Description', category: 'Engineering' };
  assert.equal(resourceSchemas.tracks.parse(input).status, 'draft');
  assert.equal(
    resourceSchemas.tracks.safeParse({ ...input, updatedBy: 'attacker' }).success,
    false
  );
});
test('assessment answer keys must reference an actual option', () => {
  const input = {
    title: 'Assessment',
    trackCategory: 'Category',
    questions: [{ question: 'Question?', options: ['A', 'B'], correctIndex: 2 }],
  };
  assert.equal(resourceSchemas.assessments.safeParse(input).success, false);
  input.questions[0].correctIndex = 1;
  assert.equal(resourceSchemas.assessments.safeParse(input).success, true);
});
test('empty assessments cannot be published', () =>
  assert.equal(
    resourceSchemas.assessments.safeParse({
      title: 'Assessment',
      trackCategory: 'Category',
      questions: [],
      status: 'published',
    }).success,
    false
  ));
test('event capacity must be a positive integer and dates must have time zones', () => {
  const input = {
    title: 'Event',
    organizer: 'Organizer',
    description: 'Description',
    startsAt: '2030-01-01T12:00:00Z',
    spotsTotal: 1,
  };
  assert.equal(resourceSchemas.events.safeParse(input).success, true);
  assert.equal(resourceSchemas.events.safeParse({ ...input, spotsTotal: 0 }).success, false);
  assert.equal(resourceSchemas.events.safeParse({ ...input, spotsTotal: 1.5 }).success, false);
  assert.equal(
    resourceSchemas.events.safeParse({ ...input, startsAt: '2030-01-01T12:00' }).success,
    false
  );
});
test('calendar dates cannot silently roll into another month', () =>
  assert.equal(
    resourceSchemas.certificates.safeParse({
      userId: 'a'.repeat(24),
      trackId: 'b'.repeat(24),
      grade: 'Pass',
      issueDate: '2026-02-31',
    }).success,
    false
  ));
test('private resources are never included in public publication collections', () => {
  for (const resource of ['students', 'applications', 'submissions', 'certificates'] as const)
    assert.equal(publicResources.includes(resource), false);
});
test('mutations reject missing or cross-site origins', () => {
  const old = process.env.AUTH_URL;
  process.env.AUTH_URL = 'https://buildnext.example';
  try {
    assert.throws(
      () => sameOrigin(new Request('https://buildnext.example/api/test')),
      (error: unknown) => error instanceof ApiError && error.status === 403
    );
    assert.throws(
      () =>
        sameOrigin(
          new Request('https://buildnext.example/api/test', {
            headers: { Origin: 'https://attacker.example' },
          })
        ),
      ApiError
    );
    sameOrigin(
      new Request('https://buildnext.example/api/test', {
        headers: { Origin: 'https://buildnext.example' },
      })
    );
  } finally {
    if (old === undefined) delete process.env.AUTH_URL;
    else process.env.AUTH_URL = old;
  }
});
test('JSON parser rejects invalid syntax and unsupported media types', async () => {
  await assert.rejects(
    bodyJson(
      new Request('https://example.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{',
      })
    ),
    (error: unknown) => error instanceof ApiError && error.status === 400
  );
  await assert.rejects(
    bodyJson(new Request('https://example.org', { method: 'POST', body: '{}' })),
    (error: unknown) => error instanceof ApiError && error.status === 415
  );
});
test('JSON body limit is enforced on streamed bytes', async () => {
  await assert.rejects(
    bodyJson(
      new Request('https://example.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'x'.repeat(256 * 1024) }),
      })
    ),
    (error: unknown) => error instanceof ApiError && error.status === 413
  );
});
