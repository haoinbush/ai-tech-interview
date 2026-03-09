'use client';

export type OutputContent =
  | { type: 'table'; columns: string[]; rows: (string | number | null)[][] }
  | { type: 'text'; content: string }
  | { type: 'error'; message: string }
  | null;

interface OutputPanelProps {
  output: OutputContent;
  isLoading?: boolean;
}

export function OutputPanel({ output, isLoading }: OutputPanelProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-950 border-t border-gray-700">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="animate-pulse">Running...</span>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="p-4 bg-gray-950 border-t border-gray-700 text-gray-500 text-sm">
        Run your code to see output.
      </div>
    );
  }

  if (output.type === 'error') {
    return (
      <div className="p-4 bg-gray-950 border-t border-gray-700">
        <pre className="text-red-400 text-sm font-mono whitespace-pre-wrap break-words">
          {output.message}
        </pre>
      </div>
    );
  }

  if (output.type === 'table') {
    return (
      <div className="p-4 bg-gray-950 border-t border-gray-700 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {output.columns.map((col) => (
                <th
                  key={col}
                  className="border border-gray-600 px-3 py-2 text-left font-medium text-gray-300"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {output.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="border border-gray-600 px-3 py-2 text-gray-400"
                  >
                    {cell ?? 'NULL'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-950 border-t border-gray-700">
      <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-words">
        {output.content}
      </pre>
    </div>
  );
}
