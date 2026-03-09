'use client';

import Link from 'next/link';
import { getQuestionById } from '@/lib/questions';
import { getCompletedQuestionIds } from '@/lib/storage';
import type { JobPracticeSet } from '@/types/job';
import type { Question } from '@/types/question';

function getQuestionFromSet(set: JobPracticeSet, id: string): Question | undefined {
  const fromSet = set.questions?.find((q) => q.id === id);
  if (fromSet) return fromSet;
  return getQuestionById(id) ?? undefined;
}

interface JobPracticeSetViewProps {
  set: JobPracticeSet;
}

function difficultyColor(d: string) {
  switch (d) {
    case 'easy':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'hard':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function JobPracticeSetView({ set }: JobPracticeSetViewProps) {
  const completedIds = getCompletedQuestionIds();

  const questions = set.questionIds
    .map((id) => getQuestionFromSet(set, id))
    .filter((q): q is Question => q !== undefined);

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="border-b border-gray-700 bg-gray-950 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
            Fintech Interview
          </Link>
          <Link href="/jobs" className="text-sm text-gray-400 hover:text-gray-200">
            My jobs
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            {set.company} - {set.role}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Skills: {set.extractedSkills.join(', ')}
          </p>
        </div>

        <ul className="space-y-2">
          {questions.length === 0 ? (
            <li className="text-gray-500">No questions in this set.</li>
          ) : (
            questions.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/jobs/${set.id}/practice/${q.id}`}
                  className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      completedIds.has(q.id) ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                  <span className="flex-1 text-gray-100">{q.title}</span>
                  <span className="text-xs text-gray-500">{q.topic}</span>
                  <span className={`text-xs ${difficultyColor(q.difficulty)}`}>
                    {q.difficulty}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
