import { MongoMemoryServer } from 'mongodb-memory-server';
import { randomBytes } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/mongodb';
import { db, Enrollment, AssessmentAttempt, RateLimit } from '../models';
const qa = path.resolve('.qa');
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as { port: number }).port;
      server.close(() => resolve(port));
    });
  });
}
async function stop(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  for (let i = 0; i < 50 && child.exitCode === null; i++) await wait(100);
  if (child.exitCode === null) child.kill('SIGKILL');
}
async function ready(url: string, child: ChildProcess) {
  for (let i = 0; i < 240; i++) {
    if (child.exitCode !== null)
      throw new Error('Application exited before readiness. Inspect .qa/server.log.');
    try {
      if ((await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch {}
    await wait(250);
  }
  throw new Error('Application readiness timed out.');
}
async function main() {
  await mkdir(qa, { recursive: true });
  await mkdir(path.join(qa, 'auth'), { recursive: true });
  await rm(path.join(qa, 'review-done'), { force: true });
  const mongo = await MongoMemoryServer.create({
    binary: { version: '7.0.24' },
    instance: { ip: '127.0.0.1' },
  });
  // Never use a deployment URI: both server and tests are bound to this disposable MongoDB process.
  const databaseName = `buildnext_test_${randomBytes(6).toString('hex')}`;
  const uri = mongo.getUri(databaseName);
  if (!uri.startsWith('mongodb://127.0.0.1:') || !databaseName.startsWith('buildnext_test_'))
    throw new Error('Unsafe test database configuration.');
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const suffix = randomBytes(4).toString('hex');
  const password = randomBytes(20).toString('hex');
  const credentials = {
    admin: `admin-${suffix}@example.invalid`,
    student: `student-${suffix}@example.invalid`,
    other: `other-${suffix}@example.invalid`,
  };
  process.env.MONGODB_URI = uri;
  Object.assign(process.env, { NODE_ENV: 'test' });
  let server: ChildProcess | undefined;
  const log = createWriteStream(path.join(qa, 'server.log'));
  try {
    await connectDB();
    for (const model of [...Object.values(db), Enrollment, AssessmentAttempt, RateLimit])
      await model.createIndexes();
    const hash = await bcrypt.hash(password, 12);
    const people = await db.students.create([
      {
        name: 'QA Administrator',
        email: credentials.admin,
        password: hash,
        role: 'admin',
        isActive: true,
      },
      {
        name: 'QA Student',
        email: credentials.student,
        password: hash,
        role: 'student',
        isActive: true,
      },
      {
        name: 'QA Other Student',
        email: credentials.other,
        password: hash,
        role: 'student',
        isActive: true,
      },
    ]);
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'production',
      AUTH_SECRET: randomBytes(48).toString('hex'),
      AUTH_URL: url,
      AUTH_TRUST_HOST: 'true',
      TRUST_PROXY: 'false',
      E2E_URL: url,
      E2E_ADMIN_EMAIL: credentials.admin,
      E2E_STUDENT_EMAIL: credentials.student,
      E2E_OTHER_EMAIL: credentials.other,
      E2E_PASSWORD: password,
      E2E_STUDENT_ID: String(people[1]._id),
      E2E_OTHER_ID: String(people[2]._id),
    };
    function launch() {
      const child = spawn(
        process.execPath,
        [
          'node_modules/next/dist/bin/next',
          'start',
          '--hostname',
          '127.0.0.1',
          '--port',
          String(port),
        ],
        { env, stdio: ['ignore', 'pipe', 'pipe'] }
      );
      child.stdout!.pipe(log, { end: false });
      child.stderr!.pipe(log, { end: false });
      return child;
    }
    server = launch();
    await ready(url, server);
    console.log(
      'Production-mode application ready against a disposable MongoDB database. No deployment database is used.'
    );
    const code = await new Promise<number>((resolve, reject) => {
      const tests = spawn(process.execPath, ['node_modules/playwright/cli.js', 'test'], {
        env,
        stdio: 'inherit',
      });
      tests.on('error', reject);
      tests.on('exit', (code) => resolve(code ?? 1));
    });
    if (code !== 0) {
      process.exitCode = code;
      return;
    }
    const before = (await (await fetch(`${url}/api/content/tracks?limit=100`)).json()) as {
      items: { id: string }[];
    };
    if (!before.items.length)
      throw new Error('Persistence test requires at least one published test track.');
    await stop(server);
    server = launch();
    await ready(url, server);
    const after = (await (await fetch(`${url}/api/content/tracks?limit=100`)).json()) as {
      items: { id: string }[];
    };
    if (JSON.stringify(before.items) !== JSON.stringify(after.items))
      throw new Error('Content changed across a process restart.');
    console.log(
      `PASS: ${before.items.length} published track records persisted across a full application process restart.`
    );
    if (process.argv.includes('--review')) {
      await writeFile(
        path.join(qa, 'preview.json'),
        JSON.stringify({ url, port, pid: server.pid, database: databaseName }, null, 2)
      );
      console.log(
        'Visual-review preview is ready. Create .qa/review-done to close the isolated preview after inspection.'
      );
      for (let i = 0; i < 3600; i++) {
        try {
          await readFile(path.join(qa, 'review-done'));
          break;
        } catch {}
        await wait(1000);
      }
    }
  } finally {
    await stop(server);
    log.end();
    await mongoose.disconnect();
    await mongo.stop();
    console.log('Disposable database and application processes stopped.');
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Test runner failed');
  process.exitCode = 1;
});
