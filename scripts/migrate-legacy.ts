import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';
import { db } from '../models';
loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
async function main() {
  await connectDB();
  const database = mongoose.connection.db!;
  let changes = 0;
  const users = await database
    .collection('users')
    .find({}, { projection: { email: 1, isActive: 1, __v: 1 } })
    .toArray();
  const normalized = new Set<string>();
  for (const user of users) {
    const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
    if (!email || normalized.has(email))
      throw new Error(
        'Email collision or invalid email found. Resolve it manually before migration. No content migration was started.'
      );
    normalized.add(email);
  }
  console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${users.length} existing users inspected.`);
  for (const user of users) {
    const patch: Record<string, unknown> = {};
    const email = String(user.email).trim().toLowerCase();
    if (email !== user.email) patch.email = email;
    if (user.isActive === undefined) patch.isActive = true;
    if (user.__v === undefined) patch.__v = 0;
    if (Object.keys(patch).length) {
      changes++;
      if (apply) await database.collection('users').updateOne({ _id: user._id }, { $set: patch });
    }
  }
  for (const key of [
    'tracks',
    'modules',
    'lessons',
    'projects',
    'events',
    'opportunities',
    'mentors',
    'assessments',
  ] as const) {
    const collection = database.collection(db[key].collection.name);
    const docs = await collection
      .find(
        { $or: [{ status: { $exists: false } }, { __v: { $exists: false } }] },
        { projection: { status: 1, __v: 1 } }
      )
      .toArray();
    console.log(
      `${key}: ${docs.length} legacy records require defaults. Missing publication status becomes draft, never automatically published.`
    );
    for (const doc of docs) {
      const patch: Record<string, unknown> = {};
      if (doc.status === undefined) patch.status = 'draft';
      if (doc.__v === undefined) patch.__v = 0;
      changes++;
      if (apply) await collection.updateOne({ _id: doc._id }, { $set: patch });
    }
  }
  // Legacy application duplicates must be reviewed, not silently deleted.
  const duplicates = await database
    .collection('applications')
    .aggregate([
      {
        $group: { _id: { userId: '$userId', opportunityId: '$opportunityId' }, count: { $sum: 1 } },
      },
      { $match: { count: { $gt: 1 } } },
      { $count: 'groups' },
    ])
    .toArray();
  if (duplicates.length) {
    console.error(
      `Manual review required: ${duplicates[0].groups} duplicate application groups. Unique-index deployment will fail until resolved.`
    );
    process.exitCode = 1;
  }
  console.log(
    `${changes} records ${apply ? 'updated' : 'would be updated'}. No records deleted. Review legacy field compatibility before publishing content.`
  );
  console.log(
    'In-memory content from the previous implementation cannot be recovered from MongoDB; import only verified source material through the admin UI.'
  );
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
