import Link from 'next/link';
import { JobsList } from '@/components/JobsList';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-700 bg-gray-950 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
            Fintech Interview
          </Link>
          <Link
            href="/jobs/add"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            + Add job
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Archived Job Sets
        </h1>
        <p className="text-gray-400 mb-6">
          Saved question sets from jobs you&apos;ve added. Reuse them anytime.
        </p>
        <JobsList />
      </main>
    </div>
  );
}
