import { Schema, model, models } from 'mongoose';
const TrackSchema = new Schema({ name: String, description: String, category: String, difficulty: String, icon: String, modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }], estimatedHours: Number, cover: String }, { timestamps: true });
export default models.Track || model('Track', TrackSchema);
