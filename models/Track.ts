import { Schema, model, models } from 'mongoose';

const TrackSchema = new Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: '' },
  category:      { type: String, default: 'Technology' },
  difficulty:    { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  icon:          { type: String, default: 'BookOpen' },
  estimatedHours:{ type: Number, default: 40 },
  modulesCount:  { type: Number, default: 0 },
  modules:       [{ type: Schema.Types.ObjectId, ref: 'Module' }],
  prerequisites: { type: [String], default: [] },
  featured:      { type: Boolean, default: false },
  cover:         String,
}, { timestamps: true });

export default models.Track || model('Track', TrackSchema);
