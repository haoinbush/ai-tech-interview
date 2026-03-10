'use client';

import { useState, useCallback } from 'react';
import { OutputPanel, type OutputContent } from './OutputPanel';
import { outputsMatch } from '@/lib/outputCompare';

interface OutputComparisonProps {
  userOutput: OutputContent;
  solution: string;
  runSolution: (code: string) => Promise<OutputContent>;
  isRunning?: boolean;
}

export function OutputComparison({
  userOutput,
  solution,
  runSolution,
  isRunning = false,
}: OutputComparisonProps) {
  const [expectedOutput, setExpectedOutput] = useState<OutputContent>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const handleCheckAnswer = useCallback(async () => {
    setIsChecking(true);
    setExpectedOutput(null);
    try {
      const result = await runSolution(solution);
      setExpectedOutput(result);
      setShowComparison(true);
    } finally {
      setIsChecking(false);
    }
  }, [runSolution, solution]);

  const isCorrect =
    showComparison &&
    expectedOutput &&
    userOutput &&
    userOutput.type !== 'error' &&
    outputsMatch(userOutput, expectedOutput);

  return (
    <div className="border-t border-gray-700">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">Output</span>
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={!userOutput || userOutput.type === 'error' || isRunning || isChecking}
          className="px-3 py-1.5 text-sm font-medium rounded bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white"
        >
          {isChecking ? 'Checking...' : 'Compare with answer'}
        </button>
      </div>

      {showComparison && expectedOutput && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-950 border-b border-gray-700">
          {isCorrect ? (
            <span className="text-green-400 font-medium">✓ Correct — your output matches the expected answer</span>
          ) : (
            <span className="text-red-400 font-medium">✗ Incorrect — your output does not match the expected answer</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[120px]">
        <div className="border-r border-gray-700">
          <div className="px-4 py-2 bg-gray-900/50 text-xs font-medium text-gray-400 border-b border-gray-700">
            Your output
          </div>
          <OutputPanel output={userOutput} isLoading={isRunning} />
        </div>
        <div>
          <div className="px-4 py-2 bg-gray-900/50 text-xs font-medium text-gray-400 border-b border-gray-700">
            Expected output
          </div>
          {showComparison ? (
            <OutputPanel output={expectedOutput} isLoading={isChecking} />
          ) : (
            <div className="p-4 bg-gray-950 text-gray-500 text-sm">
              Click &quot;Compare with answer&quot; to see the expected output.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
