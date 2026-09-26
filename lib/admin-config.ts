import type { Resource } from '@/lib/content-schema';
export type EditorField = {
  key: string;
  label: string;
  kind?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'lines'
    | 'checkbox'
    | 'datetime'
    | 'date'
    | 'url'
    | 'email'
    | 'reference'
    | 'questions'
    | 'links'
    | 'pdf-upload'
    | 'password';
  required?: boolean;
  options?: string[];
  reference?: Resource;
  hint?: string;
  min?: number;
  max?: number;
  initial?: unknown;
  locked?: boolean;
};
type Definition = {
  label: string;
  singular: string;
  description: string;
  fields: EditorField[];
  titleKey: string;
  create?: boolean;
};
const field = (
  key: string,
  label: string,
  extra: Omit<EditorField, 'key' | 'label'> = {}
): EditorField => ({ key, label, ...extra });
const title = (key = 'title', label = 'Title') => field(key, label, { required: true });
const description = (key = 'description', label = 'Description') =>
  field(key, label, { kind: 'textarea', required: true });
const publication = field('status', 'Publication status', {
  kind: 'select',
  options: ['draft', 'published', 'archived'],
  initial: 'draft',
  hint: 'Only published content is visible on the website. Archived records are retained.',
});
const difficulty = field('difficulty', 'Difficulty', {
  kind: 'select',
  options: ['Beginner', 'Intermediate', 'Advanced'],
  initial: 'Beginner',
});
const lines = (key: string, label: string) =>
  field(key, label, { kind: 'lines', hint: 'Enter one item per line.' });
const reference = (key: string, label: string, reference: Resource) =>
  field(key, label, { kind: 'reference', reference, required: true, locked: true });
export const adminConfig: Record<Resource, Definition> = {
  tracks: {
    label: 'Tracks',
    singular: 'track',
    titleKey: 'name',
    description: 'Create learning pathways, then add their modules and lessons.',
    fields: [
      title('name', 'Track name'),
      description(),
      title('category', 'Category'),
      difficulty,
      field('estimatedHours', 'Estimated hours', { kind: 'number', min: 0, initial: 0 }),
      lines('prerequisites', 'Prerequisites'),
      field('featured', 'Featured track', { kind: 'checkbox' }),
      publication,
    ],
  },
  modules: {
    label: 'Modules',
    singular: 'module',
    titleKey: 'title',
    description: 'Group lessons inside a track. Lower order values appear first.',
    fields: [
      title(),
      reference('trackId', 'Track', 'tracks'),
      field('description', 'Description', { kind: 'textarea' }),
      field('order', 'Display order', { kind: 'number', min: 0, initial: 0 }),
      publication,
    ],
  },
  lessons: {
    label: 'Lessons',
    singular: 'lesson',
    titleKey: 'title',
    description: 'Publish learning material inside a module. Draft parents hide their lessons.',
    fields: [
      title(),
      reference('moduleId', 'Module', 'modules'),
      description('body', 'Lesson content'),
      field('durationMinutes', 'Duration in minutes', { kind: 'number', min: 0, initial: 0 }),
      field('videoUrl', 'Video link', {
        kind: 'url',
        hint: 'Paste the video URL for this lesson, e.g. a YouTube link.',
      }),
      field('pdfUrl', 'PDF', {
        kind: 'pdf-upload',
        hint: 'Upload a PDF from your computer. No link is needed.',
      }),
      field('order', 'Display order', { kind: 'number', min: 0, initial: 0 }),
      publication,
    ],
  },
  projects: {
    label: 'Projects',
    singular: 'project',
    titleKey: 'title',
    description: 'Maintain project briefs and deliverables. Student work appears in Submissions.',
    fields: [
      title(),
      field('category', 'Project level', {
        kind: 'select',
        options: ['Mini Project', 'Minor Project', 'Major Project'],
        initial: 'Mini Project',
      }),
      title('stream', 'Stream'),
      difficulty,
      field('duration', 'Expected duration'),
      description('summary', 'Summary'),
      description('problemStatement', 'Project brief'),
      lines('deliverables', 'Deliverables'),
      lines('stack', 'Tools and technologies'),
      publication,
    ],
  },
  events: {
    label: 'Events',
    singular: 'event',
    titleKey: 'title',
    description: 'Publish events and manage capacity. Registrations are stored per student.',
    fields: [
      title(),
      title('organizer', 'Organizer'),
      field('type', 'Event type', {
        kind: 'select',
        options: ['Hackathon', 'Coding Contest', 'Workshop', 'Demo Day'],
        initial: 'Workshop',
      }),
      field('startsAt', 'Start date and time (UTC)', {
        kind: 'datetime',
        required: true,
        hint: 'All event times are entered and displayed in UTC.',
      }),
      field('mode', 'Format', {
        kind: 'select',
        options: ['Online', 'Hybrid', 'In-Person'],
        initial: 'Online',
      }),
      field('location', 'Location or joining instructions'),
      field('spotsTotal', 'Capacity', { kind: 'number', min: 1, required: true }),
      description(),
      lines('perks', 'Additional information'),
      publication,
    ],
  },
  opportunities: {
    label: 'Opportunities',
    singular: 'opportunity',
    titleKey: 'title',
    description: 'Publish genuine roles and opportunities. Review applications in one place.',
    fields: [
      title(),
      title('company', 'Company or organization'),
      field('type', 'Opportunity type', {
        kind: 'select',
        options: ['Internship', 'Fellowship', 'Competition', 'Job'],
        initial: 'Internship',
      }),
      field('mode', 'Work mode', {
        kind: 'select',
        options: ['Remote', 'Hybrid', 'On-site'],
        initial: 'Remote',
      }),
      field('location', 'Location'),
      field('stipend', 'Compensation (as offered)'),
      description(),
      lines('responsibilities', 'Responsibilities'),
      lines('skills', 'Skills'),
      field('eligibility', 'Eligibility'),
      field('deadline', 'Application deadline (UTC)', {
        kind: 'datetime',
        hint: 'Leave blank when there is no fixed deadline.',
      }),
      field('featured', 'Featured opportunity', { kind: 'checkbox' }),
      { ...publication, options: ['draft', 'published', 'closed', 'archived'] },
    ],
  },
  mentors: {
    label: 'Mentors',
    singular: 'mentor',
    titleKey: 'name',
    description: 'Maintain the mentor directory and genuine booking links.',
    fields: [
      title('name', 'Name'),
      title('role', 'Role'),
      field('company', 'Organization'),
      title('domain', 'Area of expertise'),
      field('experience', 'Experience'),
      description('bio', 'Biography'),
      field('bookingUrl', 'Booking URL', {
        kind: 'url',
        hint: 'Only provide a working booking page. An empty value displays no booking action.',
      }),
      publication,
    ],
  },
  assessments: {
    label: 'Assessments',
    singular: 'assessment',
    titleKey: 'title',
    description: 'Create questions and answer keys. Scoring happens on the server.',
    fields: [
      title(),
      title('trackCategory', 'Category'),
      difficulty,
      field('durationMinutes', 'Suggested duration in minutes', {
        kind: 'number',
        min: 1,
        max: 240,
        initial: 20,
      }),
      field('passingScore', 'Pass mark (%)', { kind: 'number', min: 1, max: 100, initial: 70 }),
      field('questions', 'Questions', { kind: 'questions', required: true }),
      publication,
    ],
  },
  students: {
    label: 'Students',
    singular: 'student',
    titleKey: 'name',
    description: 'Manage student profiles and access. Administrator roles cannot be changed here.',
    fields: [
      title('name', 'Full name'),
      field('email', 'Email', { kind: 'email', required: true }),
      field('stream', 'Stream'),
      field('year', 'Study year', { kind: 'number', min: 1, max: 10, initial: 1 }),
      field('bio', 'Biography', { kind: 'textarea' }),
      lines('interests', 'Interests'),
      field('github', 'GitHub URL', { kind: 'url' }),
      field('linkedin', 'LinkedIn URL', { kind: 'url' }),
      field('isActive', 'Account active', { kind: 'checkbox', initial: true }),
    ],
  },
  certificates: {
    label: 'Certificates',
    singular: 'certificate',
    titleKey: 'certificateId',
    description:
      'Issue credentials to real students, or revoke them with a reason. Verification never exposes email addresses.',
    fields: [
      reference('userId', 'Student', 'students'),
      reference('trackId', 'Published track', 'tracks'),
      field('grade', 'Grade', {
        kind: 'select',
        options: ['Pass', 'Merit', 'Distinction'],
        initial: 'Pass',
      }),
      field('issueDate', 'Issue date', { kind: 'date', required: true }),
      field('status', 'Credential status', {
        kind: 'select',
        options: ['issued', 'revoked'],
        initial: 'issued',
        hint: 'Revocation is permanent. Issue a new credential to correct a revoked one.',
      }),
      field('revocationReason', 'Revocation reason', { kind: 'textarea' }),
    ],
  },
  applications: {
    label: 'Applications',
    singular: 'application',
    titleKey: 'opportunityLabel',
    create: false,
    description:
      'Review consented student applications. Records are created when a student applies.',
    fields: [
      field('status', 'Application status', {
        kind: 'select',
        options: ['submitted', 'under_review', 'shortlisted', 'selected', 'rejected'],
      }),
    ],
  },
  submissions: {
    label: 'Submissions',
    singular: 'submission',
    titleKey: 'projectLabel',
    create: false,
    description: 'Review submitted project URLs and return actionable feedback.',
    fields: [
      field('status', 'Review status', {
        kind: 'select',
        options: ['submitted', 'under_review', 'accepted', 'changes_requested'],
      }),
      field('feedback', 'Feedback to student', { kind: 'textarea' }),
    ],
  },
  settings: {
    label: 'Website',
    singular: 'website settings',
    titleKey: 'heading',
    description: 'Manage the home page heading, introduction and announcement.',
    fields: [
      title('heading', 'Home page heading'),
      description('description', 'Home page introduction'),
      field('announcement', 'Announcement', {
        kind: 'textarea',
        hint: 'Leave blank to hide the announcement.',
      }),
    ],
  },
};
export const adminSections: { label: string; resources: Resource[] }[] = [
  { label: 'People', resources: ['students'] },
  { label: 'Learning', resources: ['tracks', 'modules', 'lessons', 'projects', 'assessments'] },
  { label: 'Community', resources: ['events', 'opportunities', 'mentors'] },
  { label: 'Records', resources: ['applications', 'submissions', 'certificates'] },
  { label: 'Platform', resources: ['settings'] },
];
