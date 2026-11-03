import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, Flame, Music, Plus, Trophy } from 'lucide-react';
import { Goals, Riffs, Sessions } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useLogPractice } from '@/Layout';
import { DailyChart, ProgressBar, StatCard } from '@/components/Stats';
import SessionRow from '@/components/SessionRow';
import { PageLoader, ErrorState, EmptyState } from '@/components/States';
import {
  computeStreak, dailyTotals, formatMinutes, longestStreak, minutesSince, relativeDay, startOfWeek, todayISO,
} from '@/lib/utils';

export default function Dashboard() {
  const sessionsQ = Sessions.useList();
  const { data: riffs = [] } = Riffs.useList();
  const { data: goals = [] } = Goals.useList();
  const { weeklyGoalMinutes } = useAuth();
  const openLog = useLogPractice();

  const sessions = sessionsQ.data ?? [];
  const stats = useMemo(() => {
    const streak = computeStreak(sessions);
    return {
      streak,
      best: longestStreak(sessions),
      week: minutesSince(sessions, startOfWeek()),
      total: sessions.reduce((s, x) => s + x.duration_minutes, 0),
      daily: dailyTotals(sessions, 14),
      practicedToday: sessions.some((s) => s.practiced_on === todayISO()),
    };
  }, [sessions]);

  if (sessionsQ.isLoading) return <PageLoader />;
  if (sessionsQ.error) return <ErrorState error={sessionsQ.error} />;

  const riffById = Object.fromEntries(riffs.map((r) => [r.id, r]));
  const learning = riffs.filter((r) => r.status === 'learning').slice(0, 4);
  const openGoals = goals.filter((g) => !g.done).slice(0, 3);
  const recent = sessions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting()}</h1>
          <p className="text-stone-500">
            {stats.practicedToday
              ? "You've practiced today. Keep the streak alive tomorrow."
              : stats.streak > 0
                ? `Practice today to make it ${stats.streak + 1} days in a row.`
                : 'A few minutes today is all it takes to start a streak.'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => openLog()}>
          <Plus className="size-4" /> Log practice
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} sub={`Best: ${stats.best}`} accent="text-orange-600 bg-orange-50" />
        <StatCard icon={CalendarCheck} label="This week" value={formatMinutes(stats.week)} sub={`Goal: ${formatMinutes(weeklyGoalMinutes)}`} />
        <StatCard icon={Clock} label="All time" value={formatMinutes(stats.total)} sub={`${sessions.length} sessions`} accent="text-sky-600 bg-sky-50" />
        <StatCard icon={Trophy} label="Riffs learned" value={riffs.filter((r) => r.status === 'learned').length} sub={`${riffs.filter((r) => r.status === 'learning').length} in progress`} accent="text-emerald-600 bg-emerald-50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-semibold">Weekly goal</h2>
            <span className="text-sm text-stone-500 tabular-nums">
              {formatMinutes(stats.week)} / {formatMinutes(weeklyGoalMinutes)}
            </span>
          </div>
          <ProgressBar value={stats.week} max={weeklyGoalMinutes} className="mb-6" />
          <h2 className="mb-3 font-semibold">Last 14 days</h2>
          <DailyChart data={stats.daily} />
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Currently learning</h2>
            <Link to="/Riffs" className="link text-sm">All riffs</Link>
          </div>
          {learning.length === 0 ? (
            <p className="text-sm text-stone-500">
              Nothing in progress. <Link to="/Riffs" className="link">Add a riff</Link> to track your tempo.
            </p>
          ) : (
            <ul className="space-y-4">
              {learning.map((r) => (
                <li key={r.id}>
                  <div className="flex items-center justify-between gap-2">
                    <button className="truncate text-left text-sm font-medium hover:underline" onClick={() => openLog({ riff_id: r.id })} title="Log practice on this riff">
                      {r.title}
                    </button>
                    {r.target_bpm && (
                      <span className="shrink-0 text-xs text-stone-500 tabular-nums">
                        {r.current_bpm ?? 0}/{r.target_bpm} bpm
                      </span>
                    )}
                  </div>
                  {r.target_bpm && <ProgressBar value={r.current_bpm ?? 0} max={r.target_bpm} className="mt-1.5" />}
                </li>
              ))}
            </ul>
          )}

          {openGoals.length > 0 && (
            <>
              <div className="mb-2 mt-6 flex items-center justify-between">
                <h2 className="font-semibold">Goals</h2>
                <Link to="/Goals" className="link text-sm">All goals</Link>
              </div>
              <ul className="space-y-1.5 text-sm">
                {openGoals.map((g) => (
                  <li key={g.id} className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{g.title}</span>
                    {g.due_date && <span className="shrink-0 text-xs text-stone-500">{relativeDay(g.due_date)}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-semibold">Recent sessions</h2>
          {sessions.length > 0 && <Link to="/Sessions" className="link text-sm">View all</Link>}
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={Music} title="No sessions yet" text="Log your first practice session to start tracking your progress." />
        ) : (
          <div className="divide-y divide-stone-100">
            {recent.map((s) => (
              <div key={s.id}>
                <p className="pt-3 text-xs font-medium uppercase tracking-wide text-stone-400">{relativeDay(s.practiced_on)}</p>
                <SessionRow session={s} riff={riffById[s.riff_id]} onEdit={openLog} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 🎸';
  if (h < 18) return 'Good afternoon 🎸';
  return 'Good evening 🎸';
}
