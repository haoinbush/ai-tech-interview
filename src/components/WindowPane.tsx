'use client';

import { useState } from 'react';

interface WindowPaneProps {
  title: string;
  children: React.ReactNode;
  defaultMinimized?: boolean;
  className?: string;
}

export function WindowPane({
  title,
  children,
  defaultMinimized = false,
  className = '',
}: WindowPaneProps) {
  const [minimized, setMinimized] = useState(defaultMinimized);
  const [maximized, setMaximized] = useState(false);

  return (
    <div
      className={`flex flex-col border border-gray-600 rounded-lg bg-gray-900 overflow-hidden ${className} ${
        maximized ? 'fixed inset-4 z-50' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-600 flex-shrink-0">
        <span className="text-sm font-medium text-gray-200 truncate">{title}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 rounded border border-gray-600"
            title={minimized ? 'Restore' : 'Minimize'}
          >
            {minimized ? '▾' : '▴'}
          </button>
          <button
            type="button"
            onClick={() => setMaximized((m) => !m)}
            className="px-2 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-600 rounded border border-gray-600"
            title={maximized ? 'Restore' : 'Maximize'}
          >
            {maximized ? '⛶' : '□'}
          </button>
        </div>
      </div>
      {!minimized && (
        <div className="flex-1 min-h-0 window-pane-scroll min-h-[100px]">
          {children}
        </div>
      )}
    </div>
  );
}
