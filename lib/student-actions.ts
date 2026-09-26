import { z } from 'zod';
import { Types } from 'mongoose';
import { db, Enrollment, AssessmentAttempt, type DbRow } from '@/models';
import { connectDB } from '@/lib/mongodb';
import { ApiError } from '@/lib/http';
import { objectId, safeUrl } from '@/lib/content-schema';
import { getRecord, row, validId } from '@/lib/data-service';

export async function enroll(user: DbRow, input: unknown) {
  const { trackId } = z.object({ trackId: objectId }).strict().parse(input);
  await getRecord('tracks', trackId);
  try {
    const result = await Enrollment.findOneAndUpdate(
      { userId: user._id, trackId },
      { $setOnInsert: { userId: user._id, trackId, completedLessonIds: [] } },
      { new: true, upsert: true }
    ).lean<DbRow>();
    return row(result!);
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    return row((await Enrollment.findOne({ userId: user._id, trackId }).lean<DbRow>())!);
  }
}
export async function completeLesson(user: DbRow, id: string) {
  const lesson = await getRecord('lessons', id);
  const parentModule = await db.modules.findById(lesson.moduleId).lean();
  const result = await Enrollment.findOneAndUpdate(
    { userId: user._id, trackId: String(parentModule!.trackId) },
    { $addToSet: { completedLessonIds: new Types.ObjectId(id) } },
    { new: true }
  ).lean<DbRow>();
  if (!result) throw new ApiError(409, 'Enroll in this track before recording progress.');
  return row(result);
}
export async function uncompleteLesson(user: DbRow, id: string) {
  const lesson = await getRecord('lessons', id);
  const parentModule = await db.modules.findById(lesson.moduleId).lean();
  await Enrollment.findOneAndUpdate(
    { userId: user._id, trackId: String(parentModule!.trackId) },
    { $pull: { completedLessonIds: new Types.ObjectId(id) } }
  ).lean<DbRow>();
  return { ok: true };
}
export async function apply(user: DbRow, id: string, input: unknown) {
  z.object({ consent: z.literal(true) })
    .strict()
    .parse(input);
  await connectDB();
  validId(id);
  const opportunity = await db.opportunities
    .findOne({
      _id: id,
      status: 'published',
      $or: [{ deadline: null }, { deadline: { $gt: new Date() } }],
    })
    .lean();
  if (!opportunity)
    throw new ApiError(409, 'This opportunity is closed or its deadline has passed.');
  const filter = { userId: user._id, opportunityId: id };
  try {
    const result = await db.applications
      .findOneAndUpdate(
        filter,
        { $setOnInsert: { ...filter, consent: true, consentAt: new Date(), status: 'submitted' } },
        { upsert: true, new: true }
      )
      .lean<DbRow>();
    return row(result!);
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    return row((await db.applications.findOne(filter).lean<DbRow>())!);
  }
}
export async function registerEvent(user: DbRow, id: string) {
  await connectDB();
  validId(id);
  // Capacity check and allocation happen in the same atomic document update.
  const result = await db.events
    .findOneAndUpdate(
      {
        _id: id,
        status: 'published',
        startsAt: { $gt: new Date() },
        registeredUserIds: { $ne: user._id },
        $expr: { $lt: [{ $size: { $ifNull: ['$registeredUserIds', []] } }, '$spotsTotal'] },
      },
      { $addToSet: { registeredUserIds: user._id }, $inc: { __v: 1 } },
      { new: true }
    )
    .lean<DbRow>();
  if (
    !result &&
    !(await db.events.exists({ _id: id, registeredUserIds: user._id, status: 'published' }))
  )
    throw new ApiError(409, 'Registration is closed or this event is full.');
  return { registered: true };
}
export async function submitProject(user: DbRow, id: string, input: unknown) {
  const data = z
    .object({
      repositoryUrl: safeUrl.refine((v) => !!v, 'A project URL is required.'),
      notes: z.string().trim().max(5000).default(''),
    })
    .strict()
    .parse(input);
  await getRecord('projects', id);
  try {
    const result = await db.submissions
      .findOneAndUpdate(
        { userId: user._id, projectId: id, status: { $in: ['submitted', 'changes_requested'] } },
        {
          $set: { ...data, feedback: '', status: 'submitted' },
          $setOnInsert: { userId: user._id, projectId: id },
          $inc: { __v: 1 },
        },
        { upsert: true, new: true }
      )
      .lean<DbRow>();
    return row(result!);
  } catch (error) {
    if ((error as { code?: number }).code === 11000)
      throw new ApiError(409, 'This submission is under review or already accepted.');
    throw error;
  }
}
export async function submitAssessment(user: DbRow, id: string, input: unknown) {
  const data = z
    .object({
      answers: z.array(z.number().int().min(0).max(7)).min(1).max(100),
      version: z.number().int().min(0),
      requestId: z.string().uuid(),
    })
    .strict()
    .parse(input);
  await connectDB();
  validId(id);
  const existing = await AssessmentAttempt.findOne({
    userId: user._id,
    requestId: data.requestId,
  }).lean<DbRow>();
  if (existing) {
    if (String(existing.assessmentId) !== id)
      throw new ApiError(409, 'This request identifier was already used.');
    return row(existing);
  }
  const assessment = await db.assessments.findOne({ _id: id, status: 'published' }).lean<DbRow>();
  if (!assessment) throw new ApiError(404, 'Assessment not found.');
  if (Number(assessment.__v || 0) !== data.version)
    throw new ApiError(409, 'This assessment has changed. Reload it before submitting.');
  const questions = assessment.questions as { options: string[]; correctIndex: number }[];
  if (
    !questions.length ||
    data.answers.length !== questions.length ||
    data.answers.some((a, i) => a >= questions[i].options.length)
  )
    throw new ApiError(400, 'Answer every question using an available option.');
  const score = data.answers.filter((a, i) => a === questions[i].correctIndex).length;
  const percentage = Math.round((score / questions.length) * 100);
  const result = {
    userId: user._id,
    assessmentId: id,
    requestId: data.requestId,
    assessmentTitle: assessment.title,
    assessmentVersion: data.version,
    answers: data.answers,
    score,
    total: questions.length,
    percentage,
    passed: percentage >= Number(assessment.passingScore),
  };
  try {
    return row((await AssessmentAttempt.create(result)).toObject() as DbRow);
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    return row(
      (await AssessmentAttempt.findOne({
        userId: user._id,
        requestId: data.requestId,
      }).lean<DbRow>())!
    );
  }
}
