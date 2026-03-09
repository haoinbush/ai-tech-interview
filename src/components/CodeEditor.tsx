'use client';

import { Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[350px] bg-gray-900 text-gray-500 border border-gray-700 rounded">
      Loading editor…
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'sql' | 'python';
  height?: number | string;
}

function TextareaFallback({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-[350px] bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-y focus:outline-none focus:ring-1 focus:ring-blue-500 border-0"
      spellCheck={false}
      placeholder="Write your code here…"
    />
  );
}

class EditorErrorBoundary extends Component<
  { children: ReactNode; value: string; onChange: (v: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-gray-700 rounded overflow-hidden">
          <TextareaFallback value={this.props.value} onChange={this.props.onChange} />
        </div>
      );
    }
    return this.props.children;
  }
}

export function CodeEditor({ value, onChange, language, height = 350 }: CodeEditorProps) {
  const editorHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <EditorErrorBoundary value={value} onChange={onChange}>
      <div className="border border-gray-700 rounded overflow-hidden">
        <MonacoEditor
          height={editorHeight}
          language={language}
          value={value}
          onChange={(v) => onChange(v ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12 },
            automaticLayout: true,
          }}
        />
      </div>
    </EditorErrorBoundary>
  );
}
