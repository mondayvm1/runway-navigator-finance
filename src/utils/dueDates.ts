// Due dates are stored as free text on an account. Over time that has been an ISO
// date ("2026-11-23"), a US date ("11/23/2026") or just a day of the month ("23").
// Bills repeat monthly, so what matters is the day of the month: these helpers turn
// any of those into the next time the bill comes due, in the viewer's local time.

export type DueUrgency = 'overdue' | 'today' | 'soon' | 'upcoming' | 'later';

export interface DueInfo {
  date: Date;        // the occurrence being shown
  daysUntil: number; // negative = that many days ago
  urgency: DueUrgency;
  label: string;     // "Nov 23"
  detail: string;    // "in 10 days", "today", "was due 2 days ago"
}

// A bill stays on its old date for this many days after it was due, so a missed
// payment is still visible instead of silently rolling to next month.
export const GRACE_DAYS = 5;
export const SOON_DAYS = 3;
export const UPCOMING_DAYS = 10;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const dayInMonth = (year: number, month: number, day: number) => {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last));
};

/** Day of the month (1-31) from whatever was stored, or null if it cannot be read. */
export const parseDueDay = (raw?: string | null): number | null => {
  if (raw === undefined || raw === null) return null;
  const text = String(raw).trim();
  if (!text) return null;

  let day: number | null = null;
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const us = text.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-]\d{2,4})?$/);
  const bare = text.match(/^(\d{1,2})(?:st|nd|rd|th)?$/i);

  if (iso) day = Number(iso[3]);
  else if (us) day = Number(us[2]);
  else if (bare) day = Number(bare[1]);
  else {
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) day = parsed.getDate();
  }

  return day !== null && day >= 1 && day <= 31 ? day : null;
};

/** The occurrence of a monthly bill that matters right now. */
export const getDueInfo = (raw?: string | null, now: Date = new Date()): DueInfo | null => {
  const day = parseDueDay(raw);
  if (day === null) return null;

  const today = startOfDay(now);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = (d: Date) => Math.round((d.getTime() - today.getTime()) / msPerDay);

  let date = dayInMonth(today.getFullYear(), today.getMonth(), day);
  let daysUntil = diff(date);
  if (daysUntil < -GRACE_DAYS) {
    date = dayInMonth(today.getFullYear(), today.getMonth() + 1, day);
    daysUntil = diff(date);
  }

  const urgency: DueUrgency =
    daysUntil < 0 ? 'overdue'
    : daysUntil === 0 ? 'today'
    : daysUntil <= SOON_DAYS ? 'soon'
    : daysUntil <= UPCOMING_DAYS ? 'upcoming'
    : 'later';

  const detail =
    daysUntil < 0 ? `was due ${-daysUntil} day${daysUntil === -1 ? '' : 's'} ago`
    : daysUntil === 0 ? 'today'
    : daysUntil === 1 ? 'tomorrow'
    : `in ${daysUntil} days`;

  return {
    date,
    daysUntil,
    urgency,
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    detail,
  };
};

/** Value for an <input type="date"> showing the current occurrence. */
export const toDateInputValue = (raw?: string | null, now: Date = new Date()): string => {
  const info = getDueInfo(raw, now);
  if (!info) return '';
  const d = info.date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
