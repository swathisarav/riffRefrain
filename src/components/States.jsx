import { AlertTriangle } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex justify-center py-24">
      <div className="size-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-800" />
    </div>
  );
}

export function ErrorState({ error }) {
  const missingTable = /relation .* does not exist|Could not find the table/i.test(error?.message ?? '');
  return (
    <div className="card mx-auto max-w-lg p-6 text-center">
      <AlertTriangle className="mx-auto mb-2 size-8 text-red-500" />
      <h2 className="font-semibold">Couldn't load your data</h2>
      <p className="mt-1 text-sm text-stone-500">{error?.message}</p>
      {missingTable && (
        <p className="mt-3 text-sm text-stone-600">
          It looks like the database tables haven't been created. Run <code className="code">supabase/schema.sql</code> in
          the Supabase SQL Editor.
        </p>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Icon className="size-6" />
      </span>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
