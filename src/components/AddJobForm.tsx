'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveJobPracticeSet } from '@/lib/jobs/storage';
import type { JobPracticeSet } from '@/types/job';
import type { Question } from '@/types/question';

export function AddJobForm() {
  const [jobUrl, setJobUrl] = useState('');
  const [useLLM, setUseLLM] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    jobSet: JobPracticeSet;
    questions: Question[];
  } | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl: jobUrl.trim(), useLLM }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to load job');
        return;
      }

      const payload = { jobSet: data.jobSet, questions: data.questions };
      setResult(payload);
      setSaved(false);
      saveJobPracticeSet(data.jobSet);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    saveJobPracticeSet(result.jobSet);
    setSaved(true);
    setTimeout(() => router.push(`/jobs/${result.jobSet.id}`), 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job URL
        </label>
        <input
          type="url"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          placeholder="https://job-boards.greenhouse.io/stripe/jobs/7516102"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useLLM"
          checked={useLLM}
          onChange={(e) => setUseLLM(e.target.checked)}
          className="rounded border-gray-600 bg-gray-800"
        />
        <label htmlFor="useLLM" className="text-sm text-gray-400">
          Generate more questions with AI (uses API key from .env.local; only when you enable this)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded"
      >
        {loading ? 'Loading...' : 'Load Questions'}
      </button>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-gray-700 rounded-lg p-4 space-y-4 bg-gray-800/50">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold text-gray-100">
                {result.jobSet.company} - {result.jobSet.role}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Skills: {result.jobSet.extractedSkills.join(', ')}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-green-900/50 text-green-400 flex-shrink-0">
              Saved locally
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Matched questions ({result.questions.length})
            </h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {result.questions.map((q) => (
                <li key={q.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{q.topic}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{q.title}</span>
                  <span className="text-gray-600 text-xs">({q.difficulty})</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-80 text-white font-medium rounded"
            >
              {saved ? 'Opening…' : 'Start Practicing'}
            </button>
            <span className="text-sm text-gray-500">
              Already saved. Find it under Archived jobs.
            </span>
          </div>
        </div>
      )}
    </form>
  );
}
