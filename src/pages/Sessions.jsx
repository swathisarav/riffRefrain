import { useMemo, useState } from 'react';
import { ListMusic, Plus } from 'lucide-react';
import { Riffs, Sessions as SessionsApi } from '@/lib/api';
import { useLogPractice } from '@/Layout';
import SessionRow from '@/components/SessionRow';
import { EmptyState, ErrorState, PageLoader } from '@/components/States';
import { FOCUS_AREAS, cn, formatDate, formatMinutes } from '@/lib/utils';

const PAGE_SIZE = 30; // days per page

export default function Sessions() {
  const sessionsQ = SessionsApi.useList();
  const { data: riffs = [] } = Riffs.useList();
  const openLog = useLogPractice();
  const [focus, setFocus] = useState('all');
  const [riffId, setRiffId] = useState('all');
  const [visibleDays, setVisibleDays] = useState(PAGE_SIZE);

  const sessions = sessionsQ.data ?? [];
  const filtered = sessions.filter(
    (s) => (focus === 'all' || s.focus === focus) && (riffId === 'all' || s.riff_id === riffId),
  );

  const byDay = useMemo(() => {
    const groups = new Map();
    for (const s of filtered) {
      if (!groups.has(s.practiced_on)) groups.set(s.practiced_on, []);
      groups.get(s.practiced_on).push(s);
    }
    return [...groups.entries()];
  }, [filtered]);

  if (sessionsQ.isLoading) return <PageLoader />;
  if (sessionsQ.error) return <ErrorState error={sessionsQ.error} />;

  const riffById = Object.fromEntries(riffs.map((r) => [r.id, r]));
  const totalMinutes = filtered.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Practice log</h1>
          <p className="text-stone-500">
            {filtered.length} session{filtered.length === 1 ? '' : 's'} · {formatMinutes(totalMinutes)}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openLog()}>
          <Plus className="size-4" /> Log practice
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button className={cn('chip', focus === 'all' && 'chip-active')} onClick={() => setFocus('all')}>All</button>
          {FOCUS_AREAS.map((f) => (
            <button key={f.value} className={cn('chip', focus === f.value && 'chip-active')} onClick={() => setFocus(f.value)}>
              {f.label}
            </button>
          ))}
          {riffs.length > 0 && (
            <select className="input ml-auto w-auto py-1 text-sm" value={riffId} onChange={(e) => setRiffId(e.target.value)} aria-label="Filter by riff">
              <option value="all">All riffs</option>
              {riffs.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          )}
        </div>
      )}

      {byDay.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ListMusic}
            title={sessions.length ? 'No sessions match these filters' : 'Your practice log is empty'}
            text={sessions.length ? 'Try a different focus area or riff.' : 'Every session you log shows up here, grouped by day.'}
            action={!sessions.length && <button className="btn-primary" onClick={() => openLog()}><Plus className="size-4" /> Log practice</button>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {byDay.slice(0, visibleDays).map(([day, items]) => (
            <section key={day} className="card px-5 py-2">
              <div className="flex items-baseline justify-between border-b border-stone-100 py-2">
                <h2 className="font-semibold">{formatDate(day, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                <span className="text-sm text-stone-500 tabular-nums">{formatMinutes(items.reduce((s, x) => s + x.duration_minutes, 0))}</span>
              </div>
              <div className="divide-y divide-stone-100">
                {items.map((s) => <SessionRow key={s.id} session={s} riff={riffById[s.riff_id]} onEdit={openLog} />)}
              </div>
            </section>
          ))}
          {byDay.length > visibleDays && (
            <div className="text-center">
              <button className="btn-ghost" onClick={() => setVisibleDays((n) => n + PAGE_SIZE)}>Show older sessions</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
