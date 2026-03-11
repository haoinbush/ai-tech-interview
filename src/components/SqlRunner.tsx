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
  const sqlModuleRef = useRef<Awaited<ReturnType<typeof initSqlJs>> | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initDb = useCallback(async () => {
    setReady(false);
    setError(null);
    try {
      if (!sqlModuleRef.current) {
        sqlModuleRef.current = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });
      }
      const SQL = sqlModuleRef.current;
      if (!SQL) {
        throw new Error('Failed to initialize SQL.js');
      }
      const db = new SQL.Database();
      const schema = await loadAllSchemas();
      db.run(schema);
      if (dbRef.current) {
        dbRef.current.close();
      }
      dbRef.current = db;
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load SQL.js');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initDb();
      if (cancelled && dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    })();
    return () => {
      cancelled = true;
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, [initDb]);

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

  const reset = useCallback(async () => {
    await initDb();
  }, [initDb]);

  return { run, ready, error, reset };
}
