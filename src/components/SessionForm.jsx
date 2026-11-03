import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import Modal, { Field } from '@/components/ui/Modal';
import { toast, toastError } from '@/components/ui/toaster';
import { Riffs, Sessions } from '@/lib/api';
import { FOCUS_AREAS, cn, optionalInt, optionalText, todayISO } from '@/lib/utils';

const QUICK_DURATIONS = [10, 15, 20, 30, 45, 60];

/**
 * Create or edit a practice session.
 * `initial` may be an existing session (has id) or partial defaults (e.g. { riff_id }).
 */
export default function SessionForm({ initial = {}, onClose }) {
  const { data: riffs = [] } = Riffs.useList();
  const saveSession = Sessions.useSave();
  const saveRiff = Riffs.useSave();

  const [form, setForm] = useState({
    practiced_on: initial.practiced_on ?? todayISO(),
    duration_minutes: initial.duration_minutes ?? 30,
    focus: initial.focus ?? (initial.riff_id ? 'songs' : 'technique'),
    riff_id: initial.riff_id ?? '',
    tempo_bpm: initial.tempo_bpm ?? '',
    rating: initial.rating ?? null,
    notes: initial.notes ?? '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  async function submit(e) {
    e.preventDefault();
    const payload = {
      id: initial.id,
      practiced_on: form.practiced_on,
      duration_minutes: parseInt(form.duration_minutes, 10),
      focus: form.focus,
      riff_id: form.riff_id || null,
      tempo_bpm: optionalInt(form.tempo_bpm),
      rating: form.rating,
      notes: optionalText(form.notes),
    };
    try {
      await saveSession.mutateAsync(payload);

      // Personal best: bump the riff's current tempo if this session beat it.
      const riff = riffs.find((r) => r.id === payload.riff_id);
      if (riff && payload.tempo_bpm && payload.tempo_bpm > (riff.current_bpm ?? 0)) {
        await saveRiff.mutateAsync({ id: riff.id, current_bpm: payload.tempo_bpm });
        toast({ title: `New tempo best on "${riff.title}"`, description: `${payload.tempo_bpm} BPM 🎉` });
      } else {
        toast({ title: initial.id ? 'Session updated' : 'Practice logged', description: `${payload.duration_minutes} minutes. Nice work!` });
      }
      onClose();
    } catch (err) {
      toastError(err, 'Could not save session');
    }
  }

  const activeRiffs = riffs.filter((r) => r.status !== 'learned' || r.id === form.riff_id);

  return (
    <Modal title={initial.id ? 'Edit session' : 'Log practice'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className="input" required max={todayISO()} value={form.practiced_on} onChange={set('practiced_on')} />
          </Field>
          <Field label="Minutes">
            <input type="number" className="input" required min={1} max={1440} value={form.duration_minutes} onChange={set('duration_minutes')} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set('duration_minutes')(m)}
              className={cn('chip', Number(form.duration_minutes) === m && 'chip-active')}
            >
              {m}m
            </button>
          ))}
        </div>

        <Field label="Focus" group>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => set('focus')(f.value)}
                className={cn('chip', form.focus === f.value && 'chip-active')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field label="Riff / song (optional)">
            <select className="input" value={form.riff_id} onChange={set('riff_id')}>
              <option value="">None</option>
              {activeRiffs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}{r.artist ? ` — ${r.artist}` : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tempo (BPM)">
            <input type="number" className="input" min={1} max={400} placeholder="—" value={form.tempo_bpm} onChange={set('tempo_bpm')} />
          </Field>
        </div>

        <Field label="How did it go?" group>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => set('rating')(form.rating === n ? null : n)}
                className="p-1"
              >
                <Star className={cn('size-6', form.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-stone-300')} />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notes">
          <textarea className="input min-h-20" placeholder="What clicked? What to work on next time?" value={form.notes} onChange={set('notes')} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saveSession.isPending}>
            {saveSession.isPending && <Loader2 className="size-4 animate-spin" />}
            {initial.id ? 'Save changes' : 'Log it'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
