import { Schema, model, models, type Model, type SchemaDefinition, type Types } from 'mongoose';
import type { Resource } from '@/lib/content-schema';

export type DbRow = {
  _id: Types.ObjectId;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
};
const str = { type: String, trim: true, default: '' };
const required = { type: String, trim: true, required: true };
const ref = (name: string) => ({
  type: Schema.Types.ObjectId,
  ref: name,
  required: true,
  index: true,
});
const status = {
  type: String,
  enum: ['draft', 'published', 'archived'],
  default: 'draft',
  index: true,
};
const strings = { type: [String], default: [] };
function define(
  name: string,
  fields: SchemaDefinition,
  indexes: [Record<string, 1 | -1>, Record<string, unknown>][] = []
) {
  const schema = new Schema<DbRow>(fields, {
    timestamps: true,
    strict: 'throw',
    optimisticConcurrency: true,
  });
  for (const [keys, options] of indexes) schema.index(keys, options);
  return (models[name] as Model<DbRow> | undefined) || model<DbRow>(name, schema);
}
const content = { status, updatedBy: { type: Schema.Types.ObjectId, ref: 'User' } };
export const db: Record<Resource, Model<DbRow>> = {
  students: define(
    'User',
    {
      name: required,
      email: { ...required, lowercase: true, unique: true },
      password: { type: String, required: true, select: false },
      stream: str,
      year: { type: Number, default: 1 },
      interests: strings,
      bio: str,
      avatar: str,
      role: { type: String, enum: ['student', 'admin'], default: 'student' },
      github: str,
      linkedin: str,
      isActive: { type: Boolean, default: true },
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      badges: strings,
    },
    [[{ role: 1, createdAt: -1 }, {}]]
  ),
  tracks: define(
    'Track',
    {
      ...content,
      name: required,
      description: required,
      category: required,
      difficulty: str,
      estimatedHours: { type: Number, default: 0 },
      prerequisites: strings,
      featured: { type: Boolean, default: false },
    },
    [[{ status: 1, featured: -1, createdAt: -1 }, {}]]
  ),
  modules: define(
    'Module',
    {
      ...content,
      title: required,
      trackId: ref('Track'),
      description: str,
      order: { type: Number, default: 0 },
    },
    [[{ trackId: 1, status: 1, order: 1 }, {}]]
  ),
  lessons: define(
    'Lesson',
    {
      ...content,
      title: required,
      moduleId: ref('Module'),
      body: required,
      durationMinutes: { type: Number, default: 0 },
      resourceUrl: str,
      order: { type: Number, default: 0 },
    },
    [[{ moduleId: 1, status: 1, order: 1 }, {}]]
  ),
  projects: define('Project', {
    ...content,
    title: required,
    category: str,
    stream: str,
    difficulty: str,
    duration: str,
    summary: required,
    problemStatement: required,
    deliverables: strings,
    stack: strings,
  }),
  events: define(
    'Event',
    {
      ...content,
      title: required,
      organizer: required,
      type: str,
      startsAt: { type: Date, required: true },
      mode: str,
      location: str,
      spotsTotal: { type: Number, required: true, min: 1 },
      description: required,
      perks: strings,
      registeredUserIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [], select: false },
    },
    [[{ status: 1, startsAt: 1 }, {}]]
  ),
  opportunities: define('Opportunity', {
    ...content,
    title: required,
    company: required,
    type: str,
    mode: str,
    location: str,
    stipend: str,
    description: required,
    responsibilities: strings,
    skills: strings,
    eligibility: str,
    deadline: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft',
      index: true,
    },
  }),
  mentors: define('Mentor', {
    ...content,
    name: required,
    role: required,
    company: str,
    domain: str,
    experience: str,
    bio: required,
    bookingUrl: str,
  }),
  assessments: define('Assessment', {
    ...content,
    title: required,
    trackCategory: required,
    difficulty: str,
    durationMinutes: Number,
    passingScore: Number,
    questions: {
      type: [{ question: required, options: [String], correctIndex: Number, explanation: str }],
      default: [],
    },
  }),
  certificates: define(
    'Certificate',
    {
      userId: ref('User'),
      trackId: ref('Track'),
      certificateId: { ...required, unique: true },
      studentName: required,
      trackName: required,
      category: str,
      grade: required,
      issueDate: required,
      status: { type: String, enum: ['issued', 'revoked'], default: 'issued' },
      revocationReason: str,
      issuedBy: ref('User'),
      updatedBy: ref('User'),
    },
    [[{ userId: 1, createdAt: -1 }, {}]]
  ),
  applications: define(
    'Application',
    {
      userId: ref('User'),
      opportunityId: ref('Opportunity'),
      status: {
        type: String,
        enum: ['submitted', 'under_review', 'shortlisted', 'selected', 'rejected'],
        default: 'submitted',
      },
      consent: { type: Boolean, required: true },
      consentAt: { type: Date, required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    [[{ userId: 1, opportunityId: 1 }, { unique: true }]]
  ),
  submissions: define(
    'ProjectSubmission',
    {
      userId: ref('User'),
      projectId: ref('Project'),
      repositoryUrl: required,
      notes: str,
      status: {
        type: String,
        enum: ['submitted', 'under_review', 'accepted', 'changes_requested'],
        default: 'submitted',
      },
      feedback: str,
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    [[{ userId: 1, projectId: 1 }, { unique: true }]]
  ),
  settings: define('SiteSettings', {
    key: { type: String, default: 'site', unique: true, immutable: true },
    heading: required,
    description: required,
    announcement: str,
    updatedBy: ref('User'),
  }),
};
export const Enrollment = define(
  'Enrollment',
  {
    userId: ref('User'),
    trackId: { type: String, required: true, index: true },
    completedLessonIds: { type: [Schema.Types.ObjectId], default: [] },
    status: { type: String, default: 'active' },
    progress: { type: Number, default: 0 },
    completedModules: { type: [Schema.Types.ObjectId], default: [] },
  },
  [[{ userId: 1, trackId: 1 }, { unique: true }]]
);
export const AssessmentAttempt = define(
  'AssessmentAttempt',
  {
    userId: ref('User'),
    assessmentId: ref('Assessment'),
    requestId: required,
    assessmentTitle: required,
    assessmentVersion: Number,
    answers: [Number],
    score: Number,
    total: Number,
    percentage: Number,
    passed: Boolean,
  },
  [[{ userId: 1, requestId: 1 }, { unique: true }]]
);
const limitSchema = new Schema({ _id: String, count: Number, expiresAt: Date });
limitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RateLimit = models.RateLimit || model('RateLimit', limitSchema);
