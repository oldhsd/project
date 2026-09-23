import { Schema, model, models } from 'mongoose';

const OpportunitySchema = new Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  type:        { type: String, enum: ['Internship', 'Competition', 'Fellowship', 'Job'], default: 'Internship' },
  location:    { type: String, default: 'Remote' },
  mode:        { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
  stipend:     { type: String, default: '' },
  description: { type: String, required: true },
  skills:      { type: [String], default: [] },
  eligibility: { type: String, default: '' },
  deadline:    { type: Date, default: null },
  status:      { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
  applications:{ type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
}, { timestamps: true });

export default models.Opportunity || model('Opportunity', OpportunitySchema);
