import { useState } from 'react';
import { Guitar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const redirectTo = window.location.origin + window.location.pathname;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        if (!data.session) setMessage('Check your inbox for a confirmation link, then come back and sign in.');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
        });
        if (error) throw error;
        setMessage('We sent you a one-time sign-in link. Open it on this device.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-50 to-rose-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-stone-900 text-amber-400">
            <Guitar className="size-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">RiffRefrain</h1>
          <p className="text-stone-500">Practice a little. Every day.</p>
        </div>

        <form onSubmit={submit} className="card p-6 space-y-4">
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1 text-sm font-medium">
              {[['signin', 'Sign in'], ['signup', 'Create account']].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn('rounded-md py-1.5', mode === m ? 'bg-white shadow-sm' : 'text-stone-500')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {mode === 'reset' && (
            <p className="text-sm text-stone-600">Enter your email and we'll send you a one-time sign-in link.</p>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          {mode !== 'reset' && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}

          {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">{message}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send link'}
          </button>

          <p className="text-center text-sm">
            {mode === 'reset' ? (
              <button type="button" className="link" onClick={() => switchMode('signin')}>Back to sign in</button>
            ) : (
              <button type="button" className="link" onClick={() => switchMode('reset')}>Forgot password? Email me a link</button>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
