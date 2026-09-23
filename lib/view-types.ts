import type { Row } from '@/lib/content-schema';
export type Collection = {
  items: Row[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};
export type AccountData = {
  profile: Row;
  enrollments: Row[];
  certificates: Row[];
  applications: Row[];
  submissions: Row[];
  registrations: Row[];
  attempts: Row[];
  counts: { enrollments: number; certificates: number; applications: number; submissions: number };
};
