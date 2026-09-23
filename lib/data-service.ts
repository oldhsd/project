import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db, Enrollment, AssessmentAttempt, type DbRow } from '@/models';
import { connectDB } from '@/lib/mongodb';
import { ApiError } from '@/lib/http';
import {
  objectId,
  passwordSchema,
  publicResources,
  resourceSchemas,
  type Resource,
  type Row,
} from '@/lib/content-schema';

export function row(value: DbRow | Record<string, unknown>): Row {
  const result = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  result.id = String(result._id);
  result.version = Number(result.__v || 0);
  for (const key of ['_id', '__v', 'password', 'registeredUserIds', 'updatedBy', 'issuedBy'])
    delete result[key];
  return result as Row;
}
export function validId(id: string) {
  if (!objectId.safeParse(id).success) throw new ApiError(404, 'Record not found.');
  return id;
}
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pageSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  q: z.string().trim().max(120).default(''),
  status: z.string().max(30).default(''),
  category: z.string().max(180).default(''),
  trackId: objectId.optional(),
  moduleId: objectId.optional(),
});

async function visibleFilter(resource: Resource, input: { trackId?: string; moduleId?: string }) {
  const filter: Record<string, unknown> = { status: 'published' };
  if (resource === 'modules') {
    if (!input.trackId || !(await db.tracks.exists({ _id: input.trackId, status: 'published' })))
      throw new ApiError(404, 'Track not found.');
    filter.trackId = input.trackId;
  }
  if (resource === 'lessons') {
    if (!input.moduleId) throw new ApiError(400, 'Choose a module.');
    const parent = await db.modules.findOne({ _id: input.moduleId, status: 'published' }).lean();
    if (!parent || !(await db.tracks.exists({ _id: parent.trackId, status: 'published' })))
      throw new ApiError(404, 'Module not found.');
    filter.moduleId = input.moduleId;
  }
  return filter;
}
async function decorate(resource: Resource, records: DbRow[], admin: boolean): Promise<Row[]> {
  const result = records.map(row);
  const ids = records.map((r) => r._id);
  if (resource === 'tracks' && ids.length) {
    const counts = await db.modules.aggregate<{ _id: unknown; count: number }>([
      { $match: { trackId: { $in: ids }, ...(admin ? {} : { status: 'published' }) } },
      { $group: { _id: '$trackId', count: { $sum: 1 } } },
    ]);
    for (const item of result)
      item.modulesCount = counts.find((c) => String(c._id) === item.id)?.count || 0;
  }
  if (resource === 'events' && ids.length) {
    const counts = await db.events.aggregate<{ _id: unknown; count: number }>([
      { $match: { _id: { $in: ids } } },
      { $project: { count: { $size: { $ifNull: ['$registeredUserIds', []] } } } },
    ]);
    for (const item of result)
      item.spotsFilled = counts.find((c) => String(c._id) === item.id)?.count || 0;
  }
  if (resource === 'opportunities' && ids.length) {
    const counts = await db.applications.aggregate<{ _id: unknown; count: number }>([
      { $match: { opportunityId: { $in: ids } } },
      { $group: { _id: '$opportunityId', count: { $sum: 1 } } },
    ]);
    for (const item of result)
      item.applicantsCount = counts.find((c) => String(c._id) === item.id)?.count || 0;
  }
  if (resource === 'assessments')
    for (const item of result) {
      if (Array.isArray(item.questions)) {
        item.totalQuestions = item.questions.length;
        item.questions = (item.questions as Record<string, unknown>[]).map((q) =>
          admin
            ? {
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
              }
            : { question: q.question, options: q.options }
        );
      }
    }
  if (admin || ['applications', 'submissions', 'certificates'].includes(resource)) {
    const relations: [string, Resource, string][] = [
      ['userId', 'students', 'student'],
      ['trackId', 'tracks', 'track'],
      ['moduleId', 'modules', 'module'],
      ['opportunityId', 'opportunities', 'opportunity'],
      ['projectId', 'projects', 'project'],
    ];
    for (const [key, target, label] of relations) {
      const references = [...new Set(result.map((r) => String(r[key] || '')).filter(Boolean))];
      if (!references.length) continue;
      const related = await db[target]
        .find({ _id: { $in: references } })
        .select('name title email')
        .lean();
      for (const item of result) {
        const found = related.find((r) => String(r._id) === item[key]);
        if (found) {
          item[`${label}Label`] = String(found.name || found.title || '');
          if (admin && label === 'student') item.studentEmail = String(found.email || '');
        }
      }
    }
  }
  return result;
}
export async function listRecords(
  resource: Resource,
  query: Record<string, unknown> = {},
  admin = false,
  userId?: string
) {
  await connectDB();
  const input = pageSchema.parse(query);
  let filter: Record<string, unknown> = {};
  if (admin) {
    if (resource === 'students') filter.role = 'student';
    if (input.status && resource !== 'students') filter.status = input.status;
    if (input.trackId && resource === 'modules') filter.trackId = input.trackId;
    if (input.moduleId && resource === 'lessons') filter.moduleId = input.moduleId;
  } else if (publicResources.includes(resource)) filter = await visibleFilter(resource, input);
  else if (['certificates', 'applications', 'submissions'].includes(resource) && userId)
    filter.userId = userId;
  else if (resource === 'settings') filter.key = 'site';
  else throw new ApiError(403, 'Access denied.');
  if (input.category) filter.category = input.category;
  if (input.q && admin && ['applications', 'submissions'].includes(resource)) {
    const target = resource === 'applications' ? 'opportunities' : 'projects';
    const foreignKey = resource === 'applications' ? 'opportunityId' : 'projectId';
    const regex = { $regex: escapeRegex(input.q), $options: 'i' };
    const result = await db[resource].aggregate<{ items: DbRow[]; totals: { count: number }[] }>([
      { $match: filter },
      {
        $lookup: {
          from: db.students.collection.name,
          localField: 'userId',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1, email: 1 } }],
          as: 'searchStudent',
        },
      },
      {
        $lookup: {
          from: db[target].collection.name,
          localField: foreignKey,
          foreignField: '_id',
          pipeline: [{ $project: { title: 1, company: 1 } }],
          as: 'searchContent',
        },
      },
      {
        $match: {
          $or: [
            { 'searchStudent.name': regex },
            { 'searchStudent.email': regex },
            { 'searchContent.title': regex },
            { 'searchContent.company': regex },
          ],
        },
      },
      {
        $facet: {
          items: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            { $project: { searchStudent: 0, searchContent: 0 } },
          ],
          totals: [{ $count: 'count' }],
        },
      },
    ]);
    const total = result[0]?.totals[0]?.count || 0;
    return {
      items: await decorate(resource, result[0]?.items || [], true),
      total,
      page: input.page,
      pages: Math.max(1, Math.ceil(total / input.limit)),
      limit: input.limit,
    };
  }
  if (input.q) {
    const keys =
      resource === 'settings'
        ? ['heading', 'description', 'announcement']
        : resource === 'students'
          ? ['name', 'email', 'stream']
          : resource === 'certificates'
            ? ['certificateId', 'studentName', 'trackName']
            : ['name', 'title', 'company', 'category'];
    filter.$or = keys.map((key) => ({ [key]: { $regex: escapeRegex(input.q), $options: 'i' } }));
  }
  const sort: Record<string, 1 | -1> =
    resource === 'modules' || resource === 'lessons'
      ? { order: 1 as const, _id: 1 as const }
      : resource === 'events'
        ? { startsAt: 1 as const, _id: 1 as const }
        : { createdAt: -1 as const, _id: -1 as const };
  const [records, total] = await Promise.all([
    db[resource]
      .find(filter)
      .select(resource === 'lessons' ? '-body' : '')
      .sort(sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean<DbRow[]>(),
    db[resource].countDocuments(filter),
  ]);
  return {
    items: await decorate(resource, records, admin),
    total,
    page: input.page,
    pages: Math.max(1, Math.ceil(total / input.limit)),
    limit: input.limit,
  };
}
export async function getRecord(resource: Resource, id: string, admin = false): Promise<Row> {
  await connectDB();
  validId(id);
  const filter: Record<string, unknown> = { _id: id };
  if (resource === 'students') filter.role = 'student';
  if (!admin) {
    if (!publicResources.includes(resource)) throw new ApiError(403, 'Access denied.');
    filter.status = 'published';
  }
  const record = await db[resource].findOne(filter).lean<DbRow>();
  if (!record) throw new ApiError(404, 'Record not found.');
  if (
    !admin &&
    resource === 'modules' &&
    !(await db.tracks.exists({ _id: record.trackId, status: 'published' }))
  )
    throw new ApiError(404, 'Module not found.');
  if (!admin && resource === 'lessons') {
    const parentModule = await db.modules
      .findOne({ _id: record.moduleId, status: 'published' })
      .lean();
    if (
      !parentModule ||
      !(await db.tracks.exists({ _id: parentModule.trackId, status: 'published' }))
    )
      throw new ApiError(404, 'Lesson not found.');
  }
  const item = (await decorate(resource, [record], admin))[0];
  if (resource === 'tracks') {
    const modules = await db.modules
      .find({ trackId: id, ...(admin ? {} : { status: 'published' }) })
      .sort({ order: 1, _id: 1 })
      .lean<DbRow[]>();
    const lessons = await db.lessons
      .find({
        moduleId: { $in: modules.map((m) => m._id) },
        ...(admin ? {} : { status: 'published' }),
      })
      .select('-body')
      .sort({ order: 1, _id: 1 })
      .lean<DbRow[]>();
    item.modules = modules.map((m) => ({
      ...row(m),
      lessons: lessons.filter((l) => String(l.moduleId) === String(m._id)).map(row),
    }));
  }
  return item;
}
async function validateRelations(
  resource: Resource,
  data: Record<string, unknown>,
  creating = false
) {
  const relation =
    resource === 'modules'
      ? ['trackId', 'tracks']
      : resource === 'lessons'
        ? ['moduleId', 'modules']
        : null;
  if (
    relation &&
    !(await db[relation[1] as Resource].exists({
      _id: data[relation[0]],
      ...(data.status === 'published' ? { status: { $ne: 'archived' } } : {}),
    }))
  )
    throw new ApiError(400, 'The parent record is missing or archived.');
  if (resource === 'certificates') {
    if (
      creating &&
      !(await db.students.exists({ _id: data.userId, role: 'student', isActive: true }))
    )
      throw new ApiError(400, 'Choose an active student.');
    if (creating && !(await db.tracks.exists({ _id: data.trackId, status: 'published' })))
      throw new ApiError(400, 'Choose a published track.');
    if (String(data.issueDate) > new Date().toISOString().slice(0, 10))
      throw new ApiError(400, 'A certificate cannot be issued in the future.');
    if (data.status === 'revoked' && !String(data.revocationReason || '').trim())
      throw new ApiError(400, 'Provide a reason for revocation.');
  }
}
export async function createRecord(resource: Resource, input: unknown, actor: DbRow): Promise<Row> {
  await connectDB();
  if (['applications', 'submissions'].includes(resource))
    throw new ApiError(405, 'These records are created by students.');
  const parsed =
    resource === 'students'
      ? resourceSchemas.students.extend({ password: passwordSchema }).parse(input)
      : resourceSchemas[resource].parse(input);
  const data = { ...parsed } as Record<string, unknown>;
  await validateRelations(resource, data, true);
  if (resource === 'students') {
    data.password = await bcrypt.hash(String(data.password), 12);
    data.role = 'student';
  } else data.updatedBy = actor._id;
  if (resource === 'opportunities' && !data.deadline) data.deadline = null;
  if (resource === 'certificates') {
    if (data.status !== 'issued')
      throw new ApiError(400, 'New certificates must be issued before they can be revoked.');
    const [student, track] = await Promise.all([
      db.students.findById(data.userId).lean(),
      db.tracks.findById(data.trackId).lean(),
    ]);
    Object.assign(data, {
      studentName: student!.name,
      trackName: track!.name,
      category: track!.category,
      certificateId: `BN-${randomUUID().replaceAll('-', '').toUpperCase()}`,
      issuedBy: actor._id,
    });
  }
  if (resource === 'settings') data.key = 'site';
  const record = await db[resource].create(data);
  return (await decorate(resource, [record.toObject() as DbRow], true))[0];
}
export async function updateRecord(
  resource: Resource,
  id: string,
  input: unknown,
  actor: DbRow
): Promise<Row> {
  await connectDB();
  validId(id);
  const { version, ...payload } = z
    .object({ version: z.number().int().min(0) })
    .passthrough()
    .parse(input);
  const patch = resourceSchemas[resource].partial().parse(payload) as Record<string, unknown>;
  const filter: Record<string, unknown> = {
    _id: id,
    ...(resource === 'students' ? { role: 'student' } : {}),
  };
  const existing = await db[resource].findOne(filter).lean<DbRow>();
  if (!existing) throw new ApiError(404, 'Record not found.');
  if (Number(existing.__v || 0) !== version)
    throw new ApiError(409, 'This record changed. Reload it before saving.');
  for (const key of ['trackId', 'moduleId', 'userId']) {
    if (key in patch && String(patch[key]) !== String(existing[key]))
      throw new ApiError(
        400,
        'The parent or recipient cannot be changed. Create a new record instead.'
      );
  }
  if (
    resource === 'certificates' &&
    existing.status === 'revoked' &&
    patch.status !== undefined &&
    patch.status !== 'revoked'
  )
    throw new ApiError(409, 'A revoked certificate cannot be reissued. Issue a new certificate.');
  const validationInput: Record<string, unknown> = {};
  for (const key of Object.keys(resourceSchemas[resource].shape)) {
    let value = key in patch ? patch[key] : existing[key];
    if (value instanceof Date) value = value.toISOString();
    if (['userId', 'trackId', 'moduleId'].includes(key) && value) value = String(value);
    if (resource === 'opportunities' && key === 'deadline' && !value) value = '';
    if (resource === 'assessments' && key === 'questions' && Array.isArray(value)) {
      value = value.map((q: Record<string, unknown>) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
      }));
    }
    if (value !== undefined) validationInput[key] = value;
  }
  // Revalidate the full resulting record, not just the patch.
  const validated = resourceSchemas[resource].parse(validationInput) as Record<string, unknown>;
  await validateRelations(resource, validated);
  if (resource === 'opportunities' && patch.deadline === '') patch.deadline = null;
  if (resource !== 'students') patch.updatedBy = actor._id;
  filter.$or = version === 0 ? [{ __v: 0 }, { __v: { $exists: false } }] : [{ __v: version }];
  if (resource === 'events' && patch.spotsTotal !== undefined)
    filter.$expr = { $lte: [{ $size: { $ifNull: ['$registeredUserIds', []] } }, patch.spotsTotal] };
  const updated = await db[resource]
    .findOneAndUpdate(filter, { $set: patch, $inc: { __v: 1 } }, { new: true, runValidators: true })
    .lean<DbRow>();
  if (!updated)
    throw new ApiError(
      409,
      'The record changed or capacity is below existing registrations. Reload before saving.'
    );
  return (await decorate(resource, [updated], true))[0];
}
export async function archiveRecord(resource: Resource, id: string, version: number, actor: DbRow) {
  if (['settings', 'applications', 'submissions', 'certificates'].includes(resource))
    throw new ApiError(405, 'Use the status editor for this record.');
  return updateRecord(
    resource,
    id,
    { version, ...(resource === 'students' ? { isActive: false } : { status: 'archived' }) },
    actor
  );
}
export async function verifyCertificate(code: string) {
  if (!/^BN-[A-Z0-9-]{6,80}$/.test(code.trim().toUpperCase()))
    throw new ApiError(404, 'Certificate not found.');
  await connectDB();
  const cert = await db.certificates
    .findOne({ certificateId: code.trim().toUpperCase() })
    .select('certificateId studentName trackName category grade issueDate status')
    .lean<DbRow>();
  if (!cert) throw new ApiError(404, 'Certificate not found.');
  return {
    certificateId: String(cert.certificateId),
    studentName: String(cert.studentName),
    trackName: String(cert.trackName),
    category: String(cert.category || ''),
    grade: String(cert.grade),
    issueDate: String(cert.issueDate),
    status: String(cert.status),
  };
}
export async function overview() {
  await connectDB();
  const counts: Record<string, number> = {};
  await Promise.all(
    (Object.keys(db) as Resource[])
      .filter((k) => k !== 'settings')
      .map(async (key) => {
        counts[key] = await db[key].countDocuments(key === 'students' ? { role: 'student' } : {});
      })
  );
  return counts;
}
export async function publishedLessonIds(trackId: string) {
  const modules = await db.modules.find({ trackId, status: 'published' }).select('_id').lean();
  const lessons = await db.lessons
    .find({ moduleId: { $in: modules.map((m) => m._id) }, status: 'published' })
    .select('_id')
    .lean();
  return lessons.map((l) => String(l._id));
}
export async function accountSummary(user: DbRow) {
  const id = String(user._id);
  const [enrollments, certificates, applications, submissions, registrations, attempts] =
    await Promise.all([
      Enrollment.find({ userId: id }).sort({ createdAt: -1 }).limit(100).lean<DbRow[]>(),
      listRecords('certificates', { limit: 100 }, false, id),
      listRecords('applications', { limit: 100 }, false, id),
      listRecords('submissions', { limit: 100 }, false, id),
      db.events
        .find({ registeredUserIds: user._id })
        .select('title startsAt status')
        .sort({ startsAt: -1 })
        .limit(100)
        .lean<DbRow[]>(),
      AssessmentAttempt.find({ userId: id })
        .select('-answers -requestId')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean<DbRow[]>(),
    ]);
  const courses = await Promise.all(
    enrollments.map(async (e) => {
      const track = await db.tracks.findById(e.trackId).select('name status').lean();
      const lessons =
        track?.status === 'published' ? await publishedLessonIds(String(e.trackId)) : [];
      const complete = ((e.completedLessonIds as unknown[]) || [])
        .map(String)
        .filter((id) => lessons.includes(id));
      return {
        ...row(e),
        trackName: String(track?.name || 'Unavailable track'),
        available: track?.status === 'published',
        completed: complete.length,
        totalLessons: lessons.length,
        progress: lessons.length ? Math.round((complete.length / lessons.length) * 100) : 0,
      };
    })
  );
  const [enrollmentCount, issuedCertificates, applicationCount, submissionCount] =
    await Promise.all([
      Enrollment.countDocuments({ userId: id }),
      db.certificates.countDocuments({ userId: id, status: 'issued' }),
      db.applications.countDocuments({ userId: id }),
      db.submissions.countDocuments({ userId: id }),
    ]);
  const profile = row(user);
  for (const field of ['xp', 'level', 'badges', 'avatar']) delete profile[field];
  return {
    profile,
    enrollments: courses,
    certificates: certificates.items,
    applications: applications.items,
    submissions: submissions.items,
    registrations: registrations.map(row),
    attempts: attempts.map(row),
    counts: {
      enrollments: enrollmentCount,
      certificates: issuedCertificates,
      applications: applicationCount,
      submissions: submissionCount,
    },
  };
}
