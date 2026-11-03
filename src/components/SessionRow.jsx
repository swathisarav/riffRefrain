import { Pencil, Star, Trash2 } from 'lucide-react';
import { Sessions } from '@/lib/api';
import { toast, toastError } from '@/components/ui/toaster';
import { cn, focusMeta, formatMinutes } from '@/lib/utils';

export default function SessionRow({ session, riff, onEdit, showActions = true }) {
  const remove = Sessions.useRemove();
  const focus = focusMeta(session.focus);

  async function handleDelete() {
    if (!window.confirm('Delete this practice session?')) return;
    try {
      await remove.mutateAsync(session.id);
      toast({ title: 'Session deleted' });
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <div className="group flex items-start gap-3 py-3">
      <div className="w-14 shrink-0 text-right">
        <p className="font-semibold tabular-nums">{formatMinutes(session.duration_minutes)}</p>
        {session.tempo_bpm && <p className="text-xs text-stone-500 tabular-nums">{session.tempo_bpm} bpm</p>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('badge', focus.color)}>{focus.label}</span>
          {riff && <span className="truncate text-sm font-medium">{riff.title}</span>}
          {session.rating && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600" aria-label={`${session.rating} of 5`}>
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {session.rating}
            </span>
          )}
        </div>
        {session.notes && <p className="mt-1 whitespace-pre-line text-sm text-stone-600">{session.notes}</p>}
      </div>
      {showActions && (
        <div className="flex shrink-0 gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <button className="icon-btn" onClick={() => onEdit(session)} aria-label="Edit session">
            <Pencil className="size-4" />
          </button>
          <button className="icon-btn hover:text-red-600" onClick={handleDelete} aria-label="Delete session">
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
