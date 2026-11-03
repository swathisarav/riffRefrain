import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl">🎸</p>
      <h1 className="text-2xl font-semibold">That note isn't in the scale</h1>
      <p className="text-stone-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
