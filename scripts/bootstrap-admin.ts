import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '../lib/mongodb';
import { emailSchema, passwordSchema } from '../lib/content-schema';
import { db } from '../models';
loadEnvConfig(process.cwd());
async function main() {
  const input = z
    .object({
      ADMIN_EMAIL: emailSchema,
      ADMIN_NAME: z.string().trim().min(2).max(180),
      ADMIN_PASSWORD: passwordSchema,
    })
    .parse(process.env);
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
    throw new Error('Configure a random AUTH_SECRET of at least 32 characters first.');
  await connectDB();
  const existing = await db.students.findOne({ email: input.ADMIN_EMAIL });
  if (existing && !process.argv.includes('--promote-existing'))
    throw new Error(
      'Account already exists. No changes made. Use --promote-existing deliberately to promote/reset that account.'
    );
  const password = await bcrypt.hash(input.ADMIN_PASSWORD, 12);
  if (existing)
    await db.students.updateOne(
      { _id: existing._id },
      {
        $set: { name: input.ADMIN_NAME, role: 'admin', isActive: true, password },
        $inc: { __v: 1 },
      }
    );
  else
    await db.students.create({
      name: input.ADMIN_NAME,
      email: input.ADMIN_EMAIL,
      password,
      role: 'admin',
      isActive: true,
    });
  console.log(
    'Administrator provisioned. Sign in using the standard sign-in page. Remove bootstrap credentials from the environment now.'
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof z.ZodError
        ? 'Invalid bootstrap environment. Supply ADMIN_EMAIL, ADMIN_NAME and a strong ADMIN_PASSWORD.'
        : error.message
    );
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
