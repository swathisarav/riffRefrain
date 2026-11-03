import { useEffect, useState } from 'react';
import { CalendarCheck, Loader2, Plus, Target, Trash2 } from 'lucide-react';
import { Goals as GoalsApi, Sessions } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ProgressBar } from '@/components/Stats';
import { EmptyState, ErrorState, PageLoader } from '@/components/States';
import { toast, toastError } from '@/components/ui/toaster';
import { cn, formatMinutes, minutesSince, relativeDay, startOfWeek, todayISO } from '@/lib/utils';

const WEEKLY_PRESETS = [60, 90, 150, 210, 300, 420];

export default function Goals() {
  const goalsQ = GoalsApi.useList();
  const { data: sessions = [] } = Sessions.useList();
  const save = GoalsApi.useSave();
  const remove = GoalsApi.useRemove();
  const { weeklyGoalMinutes, setWeeklyGoalMinutes } = useAuth();

  const [weekly, setWeekly] = useState(weeklyGoalMinutes);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  useEffect(() => setWeekly(weeklyGoalMinutes), [weeklyGoalMinutes]);

  if (goalsQ.isLoading) return <PageLoader />;
  if (goalsQ.error) return <ErrorState error={goalsQ.error} />;

  const goals = goalsQ.data;
  const open = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);
  const thisWeek = minutesSince(sessions, startOfWeek());

  async function saveWeekly(minutes) {
    setSavingWeekly(true);
    try {
      await setWeeklyGoalMinutes(minutes);
      toast({ title: 'Weekly goal updated', description: `${formatMinutes(minutes)} per week (~${Math.round(minutes / 7)}m a day)` });
    } catch (err) {
      toastError(err);
    } finally {
      setSavingWeekly(false);
    }
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await save.mutateAsync({ title: title.trim(), due_date: due || null });
      setTitle('');
      setDue('');
    } catch (err) {
      toastError(err, 'Could not add goal');
    }
  }

  async function toggle(goal) {
    try {
      await save.mutateAsync({ id: goal.id, done: !goal.done });
      if (!goal.done) toast({ title: 'Goal complete! 🎉', description: goal.title });
    } catch (err) {
      toastError(err);
    }
  }

  async function del(goal) {
    try {
      await remove.mutateAsync(goal.id);
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-stone-500">Set a weekly practice target and milestones to aim for.</p>
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck className="size-5 text-amber-600" />
          <h2 className="font-semibold">Weekly practice target</h2>
        </div>
        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm text-stone-500 tabular-nums">
            <span>This week: {formatMinutes(thisWeek)}</span>
            <span>{Math.min(100, Math.round((thisWeek / weeklyGoalMinutes) * 100))}%</span>
          </div>
          <ProgressBar value={thisWeek} max={weeklyGoalMinutes} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {WEEKLY_PRESETS.map((m) => (
            <button key={m} className={cn('chip', weekly === m && 'chip-active')} onClick={() => { setWeekly(m); saveWeekly(m); }} disabled={savingWeekly}>
              {formatMinutes(m)}
            </button>
          ))}
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); saveWeekly(Number(weekly)); }}
          >
            <input type="number" min={10} max={5000} className="input w-24 py-1 text-sm" value={weekly} onChange={(e) => setWeekly(e.target.value)} aria-label="Custom minutes per week" />
            <span className="text-sm text-stone-500">min/week</span>
            <button type="submit" className="btn-ghost py-1 text-sm" disabled={savingWeekly || Number(weekly) === weeklyGoalMinutes}>
              {savingWeekly ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
            </button>
          </form>
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="size-5 text-amber-600" />
          <h2 className="font-semibold">Milestones</h2>
        </div>

        <form onSubmit={addGoal} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input className="input flex-1" placeholder="e.g. Play the solo at full speed, learn all major scale modes" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} />
          <input type="date" className="input sm:w-44" min={todayISO()} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date (optional)" />
          <button type="submit" className="btn-primary" disabled={!title.trim() || save.isPending}>
            <Plus className="size-4" /> Add
          </button>
        </form>

        {goals.length === 0 ? (
          <EmptyState icon={Target} title="No milestones yet" text="Give yourself something concrete to work toward." />
        ) : (
          <>
            <ul className="divide-y divide-stone-100">
              {open.map((g) => <GoalItem key={g.id} goal={g} onToggle={toggle} onDelete={del} />)}
            </ul>
            {done.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-stone-500">Completed ({done.length})</summary>
                <ul className="mt-2 divide-y divide-stone-100">
                  {done.map((g) => <GoalItem key={g.id} goal={g} onToggle={toggle} onDelete={del} />)}
                </ul>
              </details>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function GoalItem({ goal, onToggle, onDelete }) {
  const overdue = !goal.done && goal.due_date && goal.due_date < todayISO();
  return (
    <li className="group flex items-center gap-3 py-2.5">
      <input type="checkbox" className="size-5 accent-amber-500" checked={goal.done} onChange={() => onToggle(goal)} aria-label={`Mark "${goal.title}" ${goal.done ? 'not done' : 'done'}`} />
      <span className={cn('flex-1', goal.done && 'text-stone-400 line-through')}>{goal.title}</span>
      {goal.due_date && (
        <span className={cn('text-xs', overdue ? 'font-medium text-red-600' : 'text-stone-500')}>
          {overdue ? 'Overdue · ' : ''}{relativeDay(goal.due_date)}
        </span>
      )}
      <button className="icon-btn hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onDelete(goal)} aria-label="Delete goal">
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
