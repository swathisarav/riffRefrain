import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal, { Field } from '@/components/ui/Modal';
import { toast, toastError } from '@/components/ui/toaster';
import { Riffs } from '@/lib/api';
import { RIFF_STATUSES, cn, optionalInt, optionalText } from '@/lib/utils';

export default function RiffForm({ initial = {}, onClose }) {
  const save = Riffs.useSave();
  const [form, setForm] = useState({
    title: initial.title ?? '',
    artist: initial.artist ?? '',
    status: initial.status ?? 'learning',
    tuning: initial.tuning ?? '',
    current_bpm: initial.current_bpm ?? '',
    target_bpm: initial.target_bpm ?? '',
    notes: initial.notes ?? '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  async function submit(e) {
    e.preventDefault();
    try {
      await save.mutateAsync({
        id: initial.id,
        title: form.title.trim(),
        artist: optionalText(form.artist),
        status: form.status,
        tuning: optionalText(form.tuning),
        current_bpm: optionalInt(form.current_bpm),
        target_bpm: optionalInt(form.target_bpm),
        notes: optionalText(form.notes),
      });
      toast({ title: initial.id ? 'Riff updated' : 'Riff added' });
      onClose();
    } catch (err) {
      toastError(err, 'Could not save riff');
    }
  }

  return (
    <Modal title={initial.id ? 'Edit riff' : 'Add a riff or song'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <input className="input" required maxLength={200} placeholder="e.g. Intro riff, Spanish Romance, Blues in A" value={form.title} onChange={set('title')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Artist / source">
            <input className="input" value={form.artist} onChange={set('artist')} />
          </Field>
          <Field label="Tuning">
            <input className="input" placeholder="Standard" value={form.tuning} onChange={set('tuning')} />
          </Field>
        </div>
        <Field label="Status" group>
          <div className="flex flex-wrap gap-2">
            {RIFF_STATUSES.map((s) => (
              <button key={s.value} type="button" onClick={() => set('status')(s.value)} className={cn('chip', form.status === s.value && 'chip-active')}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Current BPM" hint="Updates automatically when you log a faster session.">
            <input type="number" className="input" min={1} max={400} value={form.current_bpm} onChange={set('current_bpm')} />
          </Field>
          <Field label="Target BPM">
            <input type="number" className="input" min={1} max={400} value={form.target_bpm} onChange={set('target_bpm')} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="input min-h-20" placeholder="Tab link, fingering tips, tricky bars…" value={form.notes} onChange={set('notes')} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            {initial.id ? 'Save changes' : 'Add riff'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
