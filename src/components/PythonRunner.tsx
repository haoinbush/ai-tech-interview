'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { OutputContent } from './OutputPanel';

export function usePythonRunner() {
  type PyodideInstance = {
    runPythonAsync: (code: string) => Promise<void>;
    setStdout: (opts?: { batched?: (output: string) => void }) => void;
    setStderr: (opts?: { batched?: (output: string) => void }) => void;
  };
  const pyodideRef = useRef<PyodideInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { loadPyodide } = await import('pyodide');
        const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
        await pyodide.loadPackage(['numpy', 'pandas']);

        if (!cancelled) {
          pyodideRef.current = pyodide as PyodideInstance;
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load Pyodide');
        }
      }
    })();
    return () => {
      cancelled = true;
      pyodideRef.current = null;
    };
  }, []);

  const run = useCallback(
    async (code: string): Promise<OutputContent> => {
      if (!pyodideRef.current || !ready) {
        return { type: 'error', message: 'Python engine not ready. Please wait...' };
      }
      const trimmed = code.trim();
      if (!trimmed) {
        return { type: 'text', content: '(No code to run)' };
      }
      try {
        const pyodide = pyodideRef.current;
        const stdout: string[] = [];
        pyodide.setStdout({ batched: (s) => stdout.push(s) });
        pyodide.setStderr({ batched: (s) => stdout.push(`[stderr] ${s}`) });
        await pyodide.runPythonAsync(trimmed);
        return {
          type: 'text',
          content: stdout.length > 0 ? stdout.join('') : '(No output)',
        };
      } catch (e) {
        return {
          type: 'error',
          message: e instanceof Error ? e.message : String(e),
        };
      }
    },
    [ready]
  );

  return { run, ready, error };
}
