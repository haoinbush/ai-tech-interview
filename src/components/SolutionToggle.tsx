'use client';

import { useState } from 'react';

interface SolutionToggleProps {
  solution: string;
  language: 'sql' | 'python';
}

export function SolutionToggle({ solution, language }: SolutionToggleProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="border-t border-gray-700">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-300 hover:bg-gray-800 flex items-center justify-between"
      >
        <span>{show ? 'Hide' : 'Show'} reference solution</span>
        <span className="text-gray-500">{show ? '▲' : '▼'}</span>
      </button>
      {show && (
        <div className="p-4 bg-gray-950 border-t border-gray-700">
          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
            {solution}
          </pre>
        </div>
      )}
    </div>
  );
}
