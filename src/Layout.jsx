import { createContext, useCallback, useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Guitar, LayoutDashboard, ListMusic, LogOut, Music, Plus, Target } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import SessionForm from '@/components/SessionForm';

const NAV = [
  { page: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'Sessions', label: 'Sessions', icon: ListMusic },
  { page: 'Riffs', label: 'Riffs', icon: Music },
  { page: 'Goals', label: 'Goals', icon: Target },
];

const LogPracticeContext = createContext(() => {});
/** Returns `open(defaults?)`, which opens the "Log practice" dialog from anywhere. */
export const useLogPractice = () => useContext(LogPracticeContext);

export default function Layout({ children, currentPageName }) {
  const { user, signOut } = useAuth();
  const [sessionDraft, setSessionDraft] = useState(null);
  const openLog = useCallback((defaults = {}) => setSessionDraft(defaults), []);
  const closeLog = useCallback(() => setSessionDraft(null), []);

  return (
    <LogPracticeContext.Provider value={openLog}>
      <div className="min-h-screen pb-20 sm:pb-0">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
            <NavLink to="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-stone-900 text-amber-400">
                <Guitar className="size-4" />
              </span>
              RiffRefrain
            </NavLink>

            <nav className="ml-4 hidden gap-1 sm:flex">
              {NAV.map(({ page, label, icon: Icon }) => (
                <NavLink
                  key={page}
                  to={`/${page}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                    currentPageName === page ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button className="btn-primary hidden sm:inline-flex" onClick={() => openLog()}>
                <Plus className="size-4" /> Log practice
              </button>
              <span className="hidden max-w-40 truncate text-sm text-stone-500 md:inline" title={user?.email}>
                {user?.email}
              </span>
              <button className="icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-stone-200 bg-white sm:hidden">
          {NAV.slice(0, 2).map((item) => (
            <MobileTab key={item.page} {...item} active={currentPageName === item.page} />
          ))}
          <button onClick={() => openLog()} className="flex flex-col items-center justify-center" aria-label="Log practice">
            <span className="-mt-6 flex size-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg ring-4 ring-white">
              <Plus className="size-6" />
            </span>
          </button>
          {NAV.slice(2).map((item) => (
            <MobileTab key={item.page} {...item} active={currentPageName === item.page} />
          ))}
        </nav>
      </div>

      {sessionDraft && <SessionForm initial={sessionDraft} onClose={closeLog} />}
    </LogPracticeContext.Provider>
  );
}

function MobileTab({ page, label, icon: Icon, active }) {
  return (
    <NavLink to={`/${page}`} className={cn('flex flex-col items-center gap-0.5 py-2 text-[11px]', active ? 'text-stone-900 font-semibold' : 'text-stone-500')}>
      <Icon className="size-5" />
      {label}
    </NavLink>
  );
}
