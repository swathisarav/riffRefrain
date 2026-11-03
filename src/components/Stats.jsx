import { cn, formatDate, formatMinutes } from '@/lib/utils';

export function StatCard({ icon: Icon, label, value, sub, accent = 'text-amber-600 bg-amber-50' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span className={cn('flex size-7 items-center justify-center rounded-lg', accent)}>
          <Icon className="size-4" />
        </span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

export function ProgressBar({ value, max, className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-stone-100', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Bar chart of minutes per day. `data` = [{ date, minutes }] */
export function DailyChart({ data }) {
  const max = Math.max(30, ...data.map((d) => d.minutes));
  return (
    <div className="flex h-40 items-end gap-1 sm:gap-2">
      {data.map((d, i) => {
        const isToday = i === data.length - 1;
        return (
          <div key={d.date} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
            <div className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs text-white group-hover:block">
              {formatDate(d.date)} · {formatMinutes(d.minutes)}
            </div>
            <div
              className={cn(
                'w-full rounded-t-md transition-all',
                d.minutes ? (isToday ? 'bg-amber-500' : 'bg-amber-300 group-hover:bg-amber-400') : 'bg-stone-100',
              )}
              style={{ height: d.minutes ? `${Math.max(6, (d.minutes / max) * 100)}%` : '4px' }}
            />
            <span className={cn('text-[10px] tabular-nums', isToday ? 'font-semibold text-stone-800' : 'text-stone-400')}>
              {formatDate(d.date, { weekday: 'narrow' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
