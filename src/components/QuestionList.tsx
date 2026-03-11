'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { allQuestionsWithCompany } from '@/lib/questions';
import { getCompletedQuestionIds, onProgressUpdated } from '@/lib/storage';
import { getJobPracticeSets, onJobSetsUpdated } from '@/lib/jobs/storage';
import type { Question, Topic, Difficulty, FintechDomain } from '@/types/question';

const TOPICS: { value: Topic; label: string }[] = [
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DOMAINS: { value: FintechDomain; label: string }[] = [
  { value: 'trading', label: 'Trading' },
  { value: 'risk', label: 'Risk' },
  { value: 'payments', label: 'Payments' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'general', label: 'General' },
];

function difficultyColor(d: Difficulty) {
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

type QuestionListItem = Question & { href: string; dedupeKey: string };

function normalizeText(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function dedupeKeyFor(q: Question): string {
  return [q.topic, normalizeText(q.title), normalizeText(q.company)].join('|');
}

export function QuestionList() {
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<FintechDomain | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [accomplishedFilter, setAccomplishedFilter] = useState<'all' | 'done' | 'not-done'>('all');
  const [titleSearch, setTitleSearch] = useState('');

  const [completedIds, setCompletedIds] = useState(() => getCompletedQuestionIds());
  const [jobSetsVersion, setJobSetsVersion] = useState(0);

  useEffect(() => {
    return onProgressUpdated(() => setCompletedIds(getCompletedQuestionIds()));
  }, []);

  useEffect(() => {
    return onJobSetsUpdated(() => setJobSetsVersion((v) => v + 1));
  }, []);

  const allQuestionItems = useMemo(() => {
    const baseItems: QuestionListItem[] = allQuestionsWithCompany.map((q) => ({
      ...q,
      href: `/practice/${q.id}`,
      dedupeKey: dedupeKeyFor(q),
    }));

    const jobSets = getJobPracticeSets();
    const jobItems: QuestionListItem[] = jobSets.flatMap((set) =>
      (set.questions ?? []).map((q) => {
        const enriched: Question = {
          ...q,
          company: q.company ?? set.company,
          role: q.role ?? set.role,
        };
        return {
          ...enriched,
          href: `/jobs/${set.id}/practice/${q.id}`,
          dedupeKey: dedupeKeyFor(enriched),
        };
      })
    );

    const deduped = new Map<string, QuestionListItem>();
    for (const item of [...baseItems, ...jobItems]) {
      if (!deduped.has(item.dedupeKey)) {
        deduped.set(item.dedupeKey, item);
      }
    }

    return Array.from(deduped.values());
  }, [jobSetsVersion]);

  const companies = useMemo(
    () =>
      Array.from(
        new Set(
          allQuestionItems
            .map((q) => q.company)
            .filter((c): c is string => !!c)
            .sort()
        )
      ),
    [allQuestionItems]
  );

  const filteredQuestions = useMemo(() => {
    const search = titleSearch.trim().toLowerCase();
    return allQuestionItems.filter((q) => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      if (domainFilter !== 'all' && q.fintechDomain !== domainFilter) return false;
      if (companyFilter !== 'all' && (q.company ?? '') !== companyFilter) return false;
      if (accomplishedFilter === 'done' && !completedIds.has(q.id)) return false;
      if (accomplishedFilter === 'not-done' && completedIds.has(q.id)) return false;
      if (search && !q.title.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [
    topicFilter,
    difficultyFilter,
    domainFilter,
    companyFilter,
    accomplishedFilter,
    titleSearch,
    completedIds,
    allQuestionItems,
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Questions</h2>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Search by title</label>
            <input
              type="text"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="Filter by title..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Topic</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as Topic | 'all')}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100"
            >
              <option value="all">All</option>
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Difficulty</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100"
            >
              <option value="all">All</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Domain</label>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value as FintechDomain | 'all')}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100"
            >
              <option value="all">All</option>
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100"
            >
              <option value="all">All</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Accomplished</label>
            <select
              value={accomplishedFilter}
              onChange={(e) =>
                setAccomplishedFilter(e.target.value as 'all' | 'done' | 'not-done')
              }
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100"
            >
              <option value="all">All</option>
              <option value="done">Done</option>
              <option value="not-done">Not done</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredQuestions.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No questions match your filters.</p>
        ) : (
          <ul className="space-y-1">
            {filteredQuestions.map((q) => (
              <li key={`${q.id}-${q.href}`}>
                <Link
                  href={q.href}
                  className="block px-3 py-2 rounded hover:bg-gray-800 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        completedIds.has(q.id) ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                      title={completedIds.has(q.id) ? 'Completed' : 'Not completed'}
                    />
                    <span className="flex-1 truncate">{q.title}</span>
                    <span className={`text-xs flex-shrink-0 ${difficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {q.topic}
                    {q.company && ` • ${q.company}`}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
