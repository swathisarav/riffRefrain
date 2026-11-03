import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext(null);

export const DEFAULT_WEEKLY_GOAL = 150;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
      // Remove "?code=..." left behind by an email confirmation link.
      if (window.location.search.includes('code=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  let authError = null;
  if (!isSupabaseConfigured) authError = { type: 'config_missing' };
  else if (!isLoadingAuth && !user) authError = { type: 'auth_required' };

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    queryClientInstance.clear();
  }, []);

  const weeklyGoalMinutes = user?.user_metadata?.weekly_goal_minutes ?? DEFAULT_WEEKLY_GOAL;

  const setWeeklyGoalMinutes = useCallback(async (minutes) => {
    const { data, error } = await supabase.auth.updateUser({ data: { weekly_goal_minutes: minutes } });
    if (error) throw error;
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      signOut,
      weeklyGoalMinutes,
      setWeeklyGoalMinutes,
    }),
    [user, isLoadingAuth, authError?.type, signOut, weeklyGoalMinutes, setWeeklyGoalMinutes],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
