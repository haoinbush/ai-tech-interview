'use client';

import { useState, useCallback } from 'react';
import { SQL_TABLES } from '@/lib/datasets';
import { WindowPane } from './WindowPane';
import type { OutputContent } from './OutputPanel';

interface DatasetPreviewProps {
  onPreview: (query: string) => Promise<OutputContent>;
  ready: boolean;
}

export function DatasetPreview({ onPreview, ready }: DatasetPreviewProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<OutputContent>(null);
  const [loadingTable, setLoadingTable] = useState<string | null>(null);

  const handlePreview = useCallback(
    async (tableName: string) => {
      if (!ready) return;
      setSelectedTable(tableName);
      setLoadingTable(tableName);
      setPreviewData(null);
      try {
        const result = await onPreview(`SELECT * FROM ${tableName} LIMIT 5`);
        setPreviewData(result);
      } finally {
        setLoadingTable(null);
      }
    },
    [onPreview, ready]
  );

  const table = selectedTable ? SQL_TABLES.find((t) => t.name === selectedTable) : null;

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Tables</h3>
      <div className="flex flex-wrap gap-2">
        {SQL_TABLES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => {
              const next = selectedTable === t.name ? null : t.name;
              setSelectedTable(next);
              setPreviewData(null);
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded border ${
              selectedTable === t.name
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {table && (
        <WindowPane title={table.name} className="min-h-[180px] max-h-[320px]">
          <div className="p-3">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="text-xs text-gray-500 flex-1 min-w-0">
                {table.columns.map((c) => (
                  <span key={c.name} className="mr-2">
                    <span className="text-gray-400">{c.name}</span>
                    <span className="text-gray-600">: {c.type}</span>
                  </span>
                ))}
              </span>
              <button
                type="button"
                onClick={() => handlePreview(table.name)}
                disabled={!ready || loadingTable !== null}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded"
              >
                {loadingTable === table.name ? 'Loading…' : 'Preview'}
              </button>
            </div>
            {selectedTable === table.name && previewData && (
              <div className="window-pane-scroll max-h-48 overflow-auto">
                {previewData.type === 'table' ? (
                  <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          {previewData.columns.map((col) => (
                            <th
                              key={col}
                              className="border border-gray-600 px-2 py-1 text-left font-medium text-gray-400"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="border border-gray-600 px-2 py-1 text-gray-500"
                              >
                                {String(cell ?? 'NULL')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : previewData.type === 'error' ? (
                  <p className="text-red-400 text-xs">{previewData.message}</p>
                ) : null}
              </div>
            )}
          </div>
        </WindowPane>
      )}
    </div>
  );
}
