import Link from 'next/link';
import { QuestionList } from '@/components/QuestionList';

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r border-gray-700 bg-gray-950 flex flex-col">
        <header className="p-4 border-b border-gray-700">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
            Fintech Interview
          </Link>
          <p className="text-xs text-gray-500 mt-1">Practice SQL & Python</p>
          <Link
            href="/jobs/add"
            className="mt-2 block text-sm text-blue-400 hover:text-blue-300"
          >
            + Add job for practice
          </Link>
        </header>
        <QuestionList />
      </aside>
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-100 mb-2">
          Welcome to Fintech Interview Platform
        </h1>
        <p className="text-gray-400 text-center max-w-md mb-6">
          Select a question from the sidebar to start practicing. Filter by topic (SQL, Python),
          difficulty, or fintech domain.
        </p>
        <div className="flex gap-4">
          <div className="bg-gray-800 rounded-lg p-4 w-48">
            <h3 className="font-medium text-gray-200 mb-1">SQL</h3>
            <p className="text-sm text-gray-500">Run queries against fintech datasets</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 w-48">
            <h3 className="font-medium text-gray-200 mb-1">Python</h3>
            <p className="text-sm text-gray-500">Pandas, NumPy, risk calculations</p>
          </div>
        </div>
      </main>
    </div>
  );
}
