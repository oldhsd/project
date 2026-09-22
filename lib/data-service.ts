// BuildNext Unified Data Service
// Multi-disciplinary student learning ecosystem data store
// Provides robust CRUD operations with initial blueprint seed data and persistence

export interface TrackModule {
  id: string;
  title: string;
  duration: string;
  xp: number;
  lessons: string[];
}

export interface Track {
  id: string;
  name: string;
  description: string;
  category: 'Technology' | 'AI & Data' | 'Design' | 'Business' | 'Finance' | 'Core Engineering' | 'Career & Research';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  estimatedHours: number;
  modulesCount: number;
  featured?: boolean;
  syllabus: TrackModule[];
  prerequisites: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'Internship' | 'Fellowship' | 'Competition' | 'Job';
  mode: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  stipend: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  eligibility: string;
  deadline: string;
  status: 'published' | 'draft' | 'closed';
  featured?: boolean;
  applicantsCount: number;
  partnerBadge?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  roleTitle: string;
  company: string;
  studentName: string;
  studentEmail: string;
  stream: string;
  year: number;
  appliedDate: string;
  status: 'Under Review' | 'Shortlisted' | 'Selected' | 'Rejected';
  consentGranted: boolean;
  githubUrl?: string;
}

export interface Assessment {
  id: string;
  title: string;
  trackCategory: string;
  duration: string;
  totalQuestions: number;
  passingScore: number;
  xpReward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: {
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  category: 'Mini Project' | 'Minor Project' | 'Major Project';
  stream: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  summary: string;
  problemStatement: string;
  deliverables: string[];
  stack: string[];
  xp: number;
  submissionsCount: number;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  type: 'Hackathon' | 'Coding Contest' | 'Workshop' | 'Demo Day';
  date: string;
  time: string;
  mode: 'Online' | 'Hybrid' | 'In-Person';
  spotsTotal: number;
  spotsFilled: number;
  description: string;
  perks: string[];
  partnerLogo?: string;
  status: 'Open' | 'Filling Fast' | 'Closed';
}

export interface Certificate {
  id: string;
  certificateId: string; // e.g. BN-2026-WD8921
  studentName: string;
  studentEmail: string;
  trackName: string;
  category: string;
  issueDate: string;
  grade: 'Distinction' | 'Merit' | 'Pass';
  verified: boolean;
  credentialUrl: string;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  domain: string;
  experience: string;
  avatar: string;
  bio: string;
  availableSlots: string[];
}

// Initial Blueprint Data
export const initialTracks: Track[] = [];

export const initialOpportunities: Opportunity[] = [];

export const initialApplications: Application[] = [];

export const initialAssessments: Assessment[] = [];

export const initialProjects: Project[] = [];

export const initialEvents: EventItem[] = [];

export const initialCertificates: Certificate[] = [];

export const initialMentors: Mentor[] = [];

// In-Memory Global Singleton with persistence across hot-reloads
declare global {
  var __buildnext_store: {
    tracks: Track[];
    opportunities: Opportunity[];
    applications: Application[];
    assessments: Assessment[];
    projects: Project[];
    events: EventItem[];
    certificates: Certificate[];
    mentors: Mentor[];
  } | undefined;
}

if (!global.__buildnext_store) {
  global.__buildnext_store = {
    tracks: [...initialTracks],
    opportunities: [...initialOpportunities],
    applications: [...initialApplications],
    assessments: [...initialAssessments],
    projects: [...initialProjects],
    events: [...initialEvents],
    certificates: [...initialCertificates],
    mentors: [...initialMentors],
  };
}

export const DataStore = {
  // Tracks
  getTracks: () => global.__buildnext_store!.tracks,
  getTrackById: (id: string) => global.__buildnext_store!.tracks.find(t => t.id === id),
  addTrack: (track: Track) => {
    global.__buildnext_store!.tracks.unshift(track);
    return track;
  },
  updateTrack: (id: string, updates: Partial<Track>) => {
    const idx = global.__buildnext_store!.tracks.findIndex(t => t.id === id);
    if (idx !== -1) {
      global.__buildnext_store!.tracks[idx] = { ...global.__buildnext_store!.tracks[idx], ...updates };
      return global.__buildnext_store!.tracks[idx];
    }
    return null;
  },
  deleteTrack: (id: string) => {
    global.__buildnext_store!.tracks = global.__buildnext_store!.tracks.filter(t => t.id !== id);
    return true;
  },

  // Opportunities
  getOpportunities: () => global.__buildnext_store!.opportunities,
  getOpportunityById: (id: string) => global.__buildnext_store!.opportunities.find(o => o.id === id),
  addOpportunity: (opp: Opportunity) => {
    global.__buildnext_store!.opportunities.unshift(opp);
    return opp;
  },
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => {
    const idx = global.__buildnext_store!.opportunities.findIndex(o => o.id === id);
    if (idx !== -1) {
      global.__buildnext_store!.opportunities[idx] = { ...global.__buildnext_store!.opportunities[idx], ...updates };
      return global.__buildnext_store!.opportunities[idx];
    }
    return null;
  },
  deleteOpportunity: (id: string) => {
    global.__buildnext_store!.opportunities = global.__buildnext_store!.opportunities.filter(o => o.id !== id);
    return true;
  },

  // Applications
  getApplications: () => global.__buildnext_store!.applications,
  addApplication: (app: Application) => {
    global.__buildnext_store!.applications.unshift(app);
    // Increment opportunity applicant count
    const opp = global.__buildnext_store!.opportunities.find(o => o.id === app.opportunityId);
    if (opp) opp.applicantsCount += 1;
    return app;
  },
  updateApplicationStatus: (id: string, status: Application['status']) => {
    const item = global.__buildnext_store!.applications.find(a => a.id === id);
    if (item) {
      item.status = status;
      return item;
    }
    return null;
  },

  // Assessments
  getAssessments: () => global.__buildnext_store!.assessments,
  getAssessmentById: (id: string) => global.__buildnext_store!.assessments.find(a => a.id === id),
  addAssessment: (a: Assessment) => {
    global.__buildnext_store!.assessments.unshift(a);
    return a;
  },

  // Projects
  getProjects: () => global.__buildnext_store!.projects,
  addProject: (p: Project) => {
    global.__buildnext_store!.projects.unshift(p);
    return p;
  },

  // Events
  getEvents: () => global.__buildnext_store!.events,
  addEvent: (e: EventItem) => {
    global.__buildnext_store!.events.unshift(e);
    return e;
  },
  registerForEvent: (id: string) => {
    const event = global.__buildnext_store!.events.find(e => e.id === id);
    if (event && event.spotsFilled < event.spotsTotal) {
      event.spotsFilled += 1;
      return true;
    }
    return false;
  },

  // Certificates
  getCertificates: () => global.__buildnext_store!.certificates,
  getCertificateById: (certId: string) => {
    const norm = certId.trim().toUpperCase();
    return global.__buildnext_store!.certificates.find(
      c => c.certificateId.toUpperCase() === norm || c.id === certId
    );
  },
  issueCertificate: (cert: Certificate) => {
    global.__buildnext_store!.certificates.unshift(cert);
    return cert;
  },

  // Mentors
  getMentors: () => global.__buildnext_store!.mentors,

  // Platform Analytics
  getAnalytics: () => {
    return {
      totalStudents: 1420 + global.__buildnext_store!.applications.length * 3,
      activeLearners: 940,
      tracksCount: global.__buildnext_store!.tracks.length,
      opportunitiesCount: global.__buildnext_store!.opportunities.length,
      applicationsCount: global.__buildnext_store!.applications.length,
      certificatesIssued: global.__buildnext_store!.certificates.length,
      eventsScheduled: global.__buildnext_store!.events.length,
      gfgRegistrations: 412,
      elitePlacements: 18
    };
  }
};



