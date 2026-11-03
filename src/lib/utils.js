export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ── Dates (stored as local "YYYY-MM-DD" strings so time zones never shift a day) ──
export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayISO = () => toISODate(new Date());

export function parseISODate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Monday of the week containing `d`. */
export function startOfWeek(d = new Date()) {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
}

export function formatDate(iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return parseISODate(iso).toLocaleDateString(undefined, opts);
}

export function relativeDay(iso) {
  const diff = Math.round((parseISODate(todayISO()) - parseISODate(iso)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  return formatDate(iso);
}

export function formatMinutes(m) {
  if (!m) return '0m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

// ── Practice stats ──
/** Consecutive days with practice, ending today (or yesterday if today isn't logged yet). */
export function computeStreak(sessions) {
  const days = new Set(sessions.map((s) => s.practiced_on));
  let cursor = new Date();
  if (!days.has(toISODate(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(sessions) {
  const days = [...new Set(sessions.map((s) => s.practiced_on))].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev && toISODate(addDays(parseISODate(prev), 1)) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function minutesSince(sessions, fromDate) {
  const from = toISODate(fromDate);
  return sessions
    .filter((s) => s.practiced_on >= from)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

/** Minutes per day for the last `n` days, oldest first. */
export function dailyTotals(sessions, n = 14) {
  const totals = new Map();
  for (const s of sessions) totals.set(s.practiced_on, (totals.get(s.practiced_on) ?? 0) + s.duration_minutes);
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const iso = toISODate(addDays(today, i - (n - 1)));
    return { date: iso, minutes: totals.get(iso) ?? 0 };
  });
}

// ── Domain constants ──
export const FOCUS_AREAS = [
  { value: 'technique', label: 'Technique', color: 'bg-amber-100 text-amber-800' },
  { value: 'songs', label: 'Songs & riffs', color: 'bg-rose-100 text-rose-800' },
  { value: 'theory', label: 'Theory', color: 'bg-sky-100 text-sky-800' },
  { value: 'improvisation', label: 'Improvisation', color: 'bg-violet-100 text-violet-800' },
  { value: 'ear_training', label: 'Ear training', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'rhythm', label: 'Rhythm & timing', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-stone-200 text-stone-700' },
];

export const focusMeta = (value) => FOCUS_AREAS.find((f) => f.value === value) ?? FOCUS_AREAS.at(-1);

export const RIFF_STATUSES = [
  { value: 'want_to_learn', label: 'Want to learn', color: 'bg-stone-200 text-stone-700' },
  { value: 'learning', label: 'Learning', color: 'bg-amber-100 text-amber-800' },
  { value: 'learned', label: 'Learned', color: 'bg-emerald-100 text-emerald-800' },
];

export const statusMeta = (value) => RIFF_STATUSES.find((s) => s.value === value) ?? RIFF_STATUSES[0];

/** Converts "" to null and numeric strings to integers, for optional form fields. */
export const optionalInt = (v) => (v === '' || v == null ? null : parseInt(v, 10));
export const optionalText = (v) => (v?.trim() ? v.trim() : null);
