import { Schema, model, models } from 'mongoose';
const ApplicationSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true }, status: { type: String, default: 'submitted' }, consent: { type: Boolean, required: true } }, { timestamps: true });
ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
export default models.Application || model('Application', ApplicationSchema);
