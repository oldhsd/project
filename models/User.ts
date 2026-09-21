import { Schema, model, models } from 'mongoose';
const UserSchema = new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true, lowercase: true }, password: { type: String, required: true },
  stream: String, year: Number, interests: { type: [String], default: [] }, bio: { type: String, default: '' }, avatar: String,
  role: { type: String, default: 'student' }, xp: { type: Number, default: 120 }, level: { type: Number, default: 1 }, badges: { type: [String], default: [] }, github: String, linkedin: String, isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default models.User || model('User', UserSchema);
