'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobPracticeSets, deleteJobPracticeSet, onJobSetsUpdated } from '@/lib/jobs/storage';

export function JobsList() {
  const [sets, setSets] = useState(() => getJobPracticeSets());

  useEffect(() => {
    return onJobSetsUpdated(() => setSets(getJobPracticeSets()));
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Remove this practice set? Questions will remain in your progress.')) {
      deleteJobPracticeSet(id);
    }
  };

  if (sets.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-dashed border-gray-600 bg-gray-800/30">
        <p className="text-gray-400">No archived job sets yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Add a job URL to fetch and save tailored questions.
        </p>
        <Link
          href="/jobs/add"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
        >
          Add your first job
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sets.map((s) => (
        <li key={s.id}>
          <Link
            href={`/jobs/${s.id}`}
            className="group block p-4 bg-gray-800 rounded-lg hover:bg-gray-750 border border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-100 truncate">
                  {s.company} – {s.role}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {s.questionIds.length} questions • {s.extractedSkills.slice(0, 4).join(', ')}
                  {s.extractedSkills.length > 4 ? '…' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, s.id)}
                className="flex-shrink-0 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from archive"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
