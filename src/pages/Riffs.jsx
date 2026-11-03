import { useMemo, useState } from 'react';
import { Gauge, Music, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Riffs as RiffsApi, Sessions } from '@/lib/api';
import { useLogPractice } from '@/Layout';
import RiffForm from '@/components/RiffForm';
import { ProgressBar } from '@/components/Stats';
import { EmptyState, ErrorState, PageLoader } from '@/components/States';
import { toast, toastError } from '@/components/ui/toaster';
import { RIFF_STATUSES, cn, formatMinutes, relativeDay, statusMeta } from '@/lib/utils';

export default function Riffs() {
  const riffsQ = RiffsApi.useList();
  const { data: sessions = [] } = Sessions.useList();
  const save = RiffsApi.useSave();
  const remove = RiffsApi.useRemove();
  const openLog = useLogPractice();
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const practiceByRiff = useMemo(() => {
    const m = {};
    for (const s of sessions) {
      if (!s.riff_id) continue;
      const e = (m[s.riff_id] ??= { minutes: 0, last: null });
      e.minutes += s.duration_minutes;
      if (!e.last || s.practiced_on > e.last) e.last = s.practiced_on;
    }
    return m;
  }, [sessions]);

  if (riffsQ.isLoading) return <PageLoader />;
  if (riffsQ.error) return <ErrorState error={riffsQ.error} />;

  const riffs = riffsQ.data;
  const q = search.trim().toLowerCase();
  const visible = riffs.filter(
    (r) =>
      (status === 'all' || r.status === status) &&
      (!q || r.title.toLowerCase().includes(q) || r.artist?.toLowerCase().includes(q)),
  );

  async function setRiffStatus(riff, next) {
    try {
      await save.mutateAsync({ id: riff.id, status: next });
      if (next === 'learned') toast({ title: `"${riff.title}" learned! 🤘` });
    } catch (err) {
      toastError(err);
    }
  }

  async function handleDelete(riff) {
    if (!window.confirm(`Delete "${riff.title}"? Sessions linked to it are kept.`)) return;
    try {
      await remove.mutateAsync(riff.id);
      toast({ title: 'Riff deleted' });
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riffs & songs</h1>
          <p className="text-stone-500">Track what you're learning and how fast you can play it.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}>
          <Plus className="size-4" /> Add riff
        </button>
      </div>

      {riffs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button className={cn('chip', status === 'all' && 'chip-active')} onClick={() => setStatus('all')}>
            All <span className="opacity-60">{riffs.length}</span>
          </button>
          {RIFF_STATUSES.map((s) => (
            <button key={s.value} className={cn('chip', status === s.value && 'chip-active')} onClick={() => setStatus(s.value)}>
              {s.label} <span className="opacity-60">{riffs.filter((r) => r.status === s.value).length}</span>
            </button>
          ))}
          <input className="input ml-auto w-full py-1 text-sm sm:w-56" type="search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Music}
            title={riffs.length ? 'No riffs match' : 'No riffs yet'}
            text={riffs.length ? 'Try another filter or search.' : 'Add the riffs, songs and exercises you are working on. Set a target tempo and watch your progress climb.'}
            action={!riffs.length && <button className="btn-primary" onClick={() => setEditing({})}><Plus className="size-4" /> Add your first riff</button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const st = statusMeta(r.status);
            const practice = practiceByRiff[r.id];
            return (
              <article key={r.id} className="card flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{r.title}</h3>
                    {(r.artist || r.tuning) && (
                      <p className="truncate text-sm text-stone-500">{[r.artist, r.tuning].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <select
                    className={cn('badge cursor-pointer border-0 pr-1 outline-none', st.color)}
                    value={r.status}
                    onChange={(e) => setRiffStatus(r, e.target.value)}
                    aria-label="Status"
                  >
                    {RIFF_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                {(r.current_bpm || r.target_bpm) && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1"><Gauge className="size-3.5" /> Tempo</span>
                      <span className="tabular-nums">
                        {r.current_bpm ?? '—'}{r.target_bpm ? ` / ${r.target_bpm}` : ''} bpm
                      </span>
                    </div>
                    {r.target_bpm && <ProgressBar value={r.current_bpm ?? 0} max={r.target_bpm} className="mt-1" />}
                  </div>
                )}

                {r.notes && <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-stone-600">{r.notes}</p>}

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <span className="text-xs text-stone-500">
                    {practice ? `${formatMinutes(practice.minutes)} · last ${relativeDay(practice.last).toLowerCase()}` : 'Not practiced yet'}
                  </span>
                  <div className="flex gap-1">
                    <button className="icon-btn" onClick={() => openLog({ riff_id: r.id, focus: 'songs', tempo_bpm: r.current_bpm ?? '' })} aria-label="Log practice" title="Log practice">
                      <Play className="size-4" />
                    </button>
                    <button className="icon-btn" onClick={() => setEditing(r)} aria-label="Edit" title="Edit">
                      <Pencil className="size-4" />
                    </button>
                    <button className="icon-btn hover:text-red-600" onClick={() => handleDelete(r)} aria-label="Delete" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && <RiffForm initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
