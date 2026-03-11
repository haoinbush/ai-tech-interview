'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CodeEditor } from './CodeEditor';
import { QuestionList } from './QuestionList';
import { type OutputContent } from './OutputPanel';
import { OutputComparison } from './OutputComparison';
import { DatasetPreview } from './DatasetPreview';
import { SolutionToggle } from './SolutionToggle';
import { WindowPane } from './WindowPane';
import { useSqlRunner } from './SqlRunner';
import { usePythonRunner } from './PythonRunner';
import { markQuestionAttempted, getSavedCode, saveCode, clearSavedCode } from '@/lib/storage';
import type { Question } from '@/types/question';

const AUTO_SAVE_DEBOUNCE_MS = 1500;

interface PracticeViewProps {
  question: Question;
  backHref?: string;
}

export function PracticeView({ question, backHref = '/' }: PracticeViewProps) {
  const [code, setCode] = useState(() => getSavedCode(question.id) ?? question.starterCode);
  const [output, setOutput] = useState<OutputContent>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [expectedOutput, setExpectedOutput] = useState<OutputContent>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const saved = getSavedCode(question.id);
    setCode(saved ?? question.starterCode);
    setOutput(null);
    setExpectedOutput(null);
    setShowComparison(false);
  }, [question.id, question.starterCode]);

  // Auto-save code when it changes (debounced)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (code === question.starterCode) return;
    saveTimeoutRef.current = setTimeout(() => {
      saveCode(question.id, code);
      setSavedAt(new Date());
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [code, question.id, question.starterCode]);

  const sqlRunner = useSqlRunner();
  const pythonRunner = usePythonRunner(); // Lazy-loaded when component mounts (only on practice page)
  const resetSqlDb = sqlRunner.reset;

  useEffect(() => {
    if (question.topic === 'sql') {
      void resetSqlDb();
    }
  }, [question.id, question.topic, resetSqlDb]);

  const runner = question.topic === 'sql' ? sqlRunner : pythonRunner;
  const { run, ready, error } = runner;

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await run(code);
      setOutput(result);
      if (result && result.type !== 'error') {
        markQuestionAttempted(question.id, true);
      }
    } finally {
      setIsRunning(false);
    }
  }, [run, code, question.id]);

  const handleReset = useCallback(() => {
    setCode(question.starterCode);
    setOutput(null);
    setExpectedOutput(null);
    setShowComparison(false);
    clearSavedCode(question.id);
    setSavedAt(null);
  }, [question.starterCode]);

  const handleCheckAnswer = useCallback(async () => {
    setIsChecking(true);
    setExpectedOutput(null);
    try {
      const result = await run(question.solution);
      setExpectedOutput(result);
      setShowComparison(true);
    } finally {
      setIsChecking(false);
    }
  }, [run, question.solution]);

  const handleSave = useCallback(() => {
    saveCode(question.id, code);
    setSavedAt(new Date());
  }, [question.id, code]);

  const engineReady = question.topic === 'sql' ? sqlRunner.ready : pythonRunner.ready;
  const engineError = question.topic === 'sql' ? sqlRunner.error : pythonRunner.error;

  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r border-gray-700 bg-gray-950 flex flex-col overflow-hidden">
        <header className="p-4 border-b border-gray-700 flex-shrink-0">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300">
            Fintech Interview
          </Link>
          <p className="text-xs text-gray-500 mt-1">Practice SQL & Python</p>
          <p className="text-xs text-green-400 font-medium mt-1" title="Save & Compare features">
            ✓ v2 — Save & Compare with answer
            {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA && (
              <span className="text-gray-500 ml-1">({String(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA).slice(0, 7)})</span>
            )}
          </p>
        </header>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Link
            href={backHref}
            className="block px-4 py-2 border-b border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          >
            ← Back
          </Link>
          <QuestionList />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-gray-900 p-4 gap-3 overflow-y-auto">
        <WindowPane title="Problem & Tables" className="flex-1 min-h-[200px]">
          <div className="p-4">
            <h1 className="text-xl font-semibold text-gray-100">{question.title}</h1>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                {question.topic}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                {question.difficulty}
              </span>
              {question.fintechDomain && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                  {question.fintechDomain}
                </span>
              )}
            </div>
            <p className="mt-3 text-gray-400 text-sm whitespace-pre-wrap">{question.description}</p>
            {question.topic === 'sql' && (
              <DatasetPreview key={question.id} onPreview={sqlRunner.run} ready={sqlRunner.ready} />
            )}
            {question.hints && question.hints.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                  ► Hints
                </summary>
                <ul className="mt-1 list-disc list-inside text-sm text-gray-500">
                  {question.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </WindowPane>

        <WindowPane title="Code" className="flex-1 min-h-[280px]">
          <div className="p-4 flex flex-col">
            <div className="flex gap-2 mb-2 flex-wrap items-center">
              <button
                onClick={handleRun}
                disabled={!engineReady || isRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded"
              >
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
              >
                Save
              </button>
              <button
                onClick={handleCheckAnswer}
                disabled={!engineReady || !output || output.type === 'error' || isRunning || isChecking}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded"
              >
                {isChecking ? 'Checking...' : 'Compare with answer'}
              </button>
              {savedAt && (
                <span className="text-xs text-green-400">
                  Saved {savedAt.toLocaleTimeString()}
                </span>
              )}
              {!engineReady && !engineError && (
                <span className="px-4 py-2 text-sm text-amber-500/90 self-center animate-pulse">
                  Loading {question.topic === 'sql' ? 'SQL' : 'Python'} engine…
                </span>
              )}
              {engineError && (
                <span className="px-4 py-2 text-sm text-red-400 self-center max-w-md" title={engineError}>
                  Engine failed to load. Check your connection and refresh.
                </span>
              )}
            </div>
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={question.topic}
                height={350}
              />
            </div>
          </div>
        </WindowPane>

        <WindowPane title="Output" className="min-h-[120px] max-h-[360px]">
          <OutputComparison
            userOutput={output}
            expectedOutput={expectedOutput}
            showComparison={showComparison}
            isChecking={isChecking}
            onCheckAnswer={handleCheckAnswer}
            isRunning={isRunning}
          />
        </WindowPane>

        <SolutionToggle solution={question.solution} language={question.topic} />
      </main>
    </div>
  );
}
