import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function dateLabel(value: unknown, time = false) {
  if (typeof value !== 'string' || !value || Number.isNaN(Date.parse(value)))
    return 'Not specified';
  return (
    new Intl.DateTimeFormat(
      'en-GB',
      time
        ? { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }
        : { dateStyle: 'medium', timeZone: 'UTC' }
    ).format(new Date(value)) + (time ? ' UTC' : '')
  );
}
