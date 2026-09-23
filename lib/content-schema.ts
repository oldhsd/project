import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid record.');
const title = z.string().trim().min(2).max(180);
const short = z.string().trim().max(300).default('');
const description = z.string().trim().min(1).max(12000);
const lines = z.array(z.string().trim().min(1).max(500)).max(100).default([]);
const integer = z.number().int().min(0).max(100000);
const publication = z.enum(['draft', 'published', 'archived']).default('draft');
const difficulty = z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner');
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .refine((v) => new TextEncoder().encode(v).length <= 72, 'Use at most 72 UTF-8 bytes.');
export const safeUrl = z
  .union([
    z.literal(''),
    z
      .string()
      .trim()
      .url()
      .max(2048)
      .refine(
        (v) => ['https:', 'http:'].includes(new URL(v).protocol),
        'Use an HTTPS or HTTP URL.'
      ),
  ])
  .default('');
const dateTime = z.string().datetime({ offset: true });
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    'Enter a valid date.'
  );
const question = z
  .object({
    question: description,
    options: z.array(z.string().trim().min(1).max(1000)).min(2).max(8),
    correctIndex: z.number().int().min(0).max(7),
    explanation: z.string().trim().max(3000).default(''),
  })
  .strict()
  .refine((q) => q.correctIndex < q.options.length, 'Correct answer must match an option.');

export const resourceSchemas = {
  tracks: z
    .object({
      name: title,
      description,
      category: title,
      difficulty,
      estimatedHours: integer.default(0),
      prerequisites: lines,
      featured: z.boolean().default(false),
      status: publication,
    })
    .strict(),
  modules: z
    .object({
      title,
      trackId: objectId,
      description: z.string().trim().max(12000).default(''),
      order: integer.default(0),
      status: publication,
    })
    .strict(),
  lessons: z
    .object({
      title,
      moduleId: objectId,
      body: z.string().trim().min(1).max(100000),
      durationMinutes: integer.default(0),
      resourceUrl: safeUrl,
      order: integer.default(0),
      status: publication,
    })
    .strict(),
  projects: z
    .object({
      title,
      category: z.enum(['Mini Project', 'Minor Project', 'Major Project']).default('Mini Project'),
      stream: title,
      difficulty,
      duration: short,
      summary: description,
      problemStatement: description,
      deliverables: lines,
      stack: lines,
      status: publication,
    })
    .strict(),
  events: z
    .object({
      title,
      organizer: title,
      type: z.enum(['Hackathon', 'Coding Contest', 'Workshop', 'Demo Day']).default('Workshop'),
      startsAt: dateTime,
      mode: z.enum(['Online', 'Hybrid', 'In-Person']).default('Online'),
      location: short,
      spotsTotal: integer.min(1),
      description,
      perks: lines,
      status: publication,
    })
    .strict(),
  opportunities: z
    .object({
      title,
      company: title,
      type: z.enum(['Internship', 'Fellowship', 'Competition', 'Job']).default('Internship'),
      mode: z.enum(['Remote', 'Hybrid', 'On-site']).default('Remote'),
      location: short,
      stipend: short,
      description,
      responsibilities: lines,
      skills: lines,
      eligibility: short,
      deadline: z.union([dateTime, z.literal('')]).default(''),
      status: z.enum(['draft', 'published', 'closed', 'archived']).default('draft'),
      featured: z.boolean().default(false),
    })
    .strict(),
  mentors: z
    .object({
      name: title,
      role: title,
      company: short,
      domain: title,
      experience: short,
      bio: description,
      bookingUrl: safeUrl,
      status: publication,
    })
    .strict(),
  assessments: z
    .object({
      title,
      trackCategory: title,
      difficulty,
      durationMinutes: integer.min(1).max(240).default(20),
      passingScore: z.number().int().min(1).max(100).default(70),
      questions: z.array(question).min(1).max(100),
      status: publication,
    })
    .strict(),
  students: z
    .object({
      name: title,
      email: emailSchema,
      stream: short,
      year: z.number().int().min(1).max(10).default(1),
      bio: z.string().trim().max(2000).default(''),
      interests: lines,
      github: safeUrl,
      linkedin: safeUrl,
      isActive: z.boolean().default(true),
    })
    .strict(),
  certificates: z
    .object({
      userId: objectId,
      trackId: objectId,
      grade: z.enum(['Distinction', 'Merit', 'Pass']),
      issueDate: dateOnly,
      status: z.enum(['issued', 'revoked']).default('issued'),
      revocationReason: z.string().trim().max(1000).default(''),
    })
    .strict(),
  applications: z
    .object({
      status: z.enum(['submitted', 'under_review', 'shortlisted', 'selected', 'rejected']),
    })
    .strict(),
  submissions: z
    .object({
      status: z.enum(['submitted', 'under_review', 'accepted', 'changes_requested']),
      feedback: z.string().trim().max(5000).default(''),
    })
    .strict(),
  settings: z
    .object({ heading: title, description, announcement: z.string().trim().max(500).default('') })
    .strict(),
};
export type Resource = keyof typeof resourceSchemas;
export const resources = Object.keys(resourceSchemas) as Resource[];
export const publicResources: Resource[] = [
  'tracks',
  'modules',
  'lessons',
  'projects',
  'events',
  'opportunities',
  'mentors',
  'assessments',
];
export type Row = { id: string; version: number; [key: string]: unknown };
export const text = (row: Row, key: string): string =>
  typeof row[key] === 'string' ? (row[key] as string) : '';
export const number = (row: Row, key: string): number =>
  typeof row[key] === 'number' ? (row[key] as number) : 0;
export const list = (row: Row, key: string): string[] =>
  Array.isArray(row[key])
    ? (row[key] as unknown[]).filter((v): v is string => typeof v === 'string')
    : [];
export function isResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}
