'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import initSqlJs, { type Database } from 'sql.js';
import type { OutputContent } from './OutputPanel';

const SCHEMAS = ['/schema.sql', '/schema-stripe.sql'];

async function loadAllSchemas(): Promise<string> {
  const parts: string[] = [];
  for (const url of SCHEMAS) {
    try {
      const res = await fetch(url);
      if (res.ok) parts.push(await res.text());
    } catch {
      // Skip failed schema
    }
  }
  return parts.join('\n');
}

export function useSqlRunner() {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });
        const db = new SQL.Database();
        const schema = await loadAllSchemas();
        db.run(schema);
        if (!cancelled) {
          dbRef.current = db;
          setReady(true);
        } else {
          db.close();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load SQL.js');
        }
      }
    })();
    return () => {
      cancelled = true;
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, []);

  const run = useCallback(
    async (query: string): Promise<OutputContent> => {
      if (!dbRef.current || !ready) {
        return { type: 'error', message: 'SQL engine not ready. Please wait...' };
      }
      const trimmed = query.trim();
      if (!trimmed) {
        return { type: 'text', content: '(No query to run)' };
      }
      try {
        const results = dbRef.current.exec(trimmed);
        if (results.length > 0 && results[0].columns && results[0].values) {
          const { columns, values } = results[0];
          return {
            type: 'table',
            columns,
            rows: values,
          };
        }
        return {
          type: 'text',
          content: 'Query executed successfully.',
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
