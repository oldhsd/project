import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';
import { db, Enrollment, AssessmentAttempt, RateLimit } from '../models';
loadEnvConfig(process.cwd());
async function main() {
  await connectDB();
  for (const model of [...Object.values(db), Enrollment, AssessmentAttempt, RateLimit]) {
    // createIndexes never drops existing indexes. Duplicate records fail loudly for operator review.
    await model.createIndexes();
    console.log(`Indexes verified: ${model.modelName}`);
  }
}
main()
  .catch(() => {
    console.error(
      'Index creation failed. Resolve duplicate records or database permissions before deployment.'
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
