/** Shown when the app was built without Supabase credentials. */
export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-lg p-6 space-y-3">
        <h1 className="text-xl font-semibold">RiffRefrain needs a database</h1>
        <p className="text-stone-600">
          Supabase isn't configured yet. Set <code className="code">VITE_SUPABASE_URL</code> and{' '}
          <code className="code">VITE_SUPABASE_ANON_KEY</code>:
        </p>
        <ul className="list-disc pl-5 text-stone-600 space-y-1">
          <li>
            <strong>Locally:</strong> copy <code className="code">.env.example</code> to{' '}
            <code className="code">.env.local</code>, fill it in and restart <code className="code">npm run dev</code>.
          </li>
          <li>
            <strong>On GitHub Pages:</strong> add both as repository secrets (Settings → Secrets and variables → Actions)
            and re-run the deploy workflow.
          </li>
        </ul>
        <p className="text-sm text-stone-500">See README.md for the full setup steps.</p>
      </div>
    </div>
  );
}
