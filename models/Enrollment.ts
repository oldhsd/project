import { Schema, model, models } from 'mongoose';
const EnrollmentSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User' }, trackId: { type: String, required: true }, progress: { type: Number, default: 0 }, status: { type: String, default: 'active' }, completedModules: [Schema.Types.ObjectId] }, { timestamps: true });
EnrollmentSchema.index({ userId: 1, trackId: 1 }, { unique: true });
export default models.Enrollment || model('Enrollment', EnrollmentSchema);
