const STORAGE_KEY = 'tech-interview-progress';

export interface ProgressEntry {
  questionId: string;
  completed: boolean;
  lastAttemptAt: string; // ISO date string
}

export interface ProgressData {
  entries: ProgressEntry[];
}

export function getProgress(): ProgressData {
  if (typeof window === 'undefined') {
    return { entries: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [] };
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { entries: [] };
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

const PROGRESS_UPDATED_EVENT = 'tech-interview-progress-updated';

export function markQuestionAttempted(questionId: string, completed: boolean): void {
  const data = getProgress();
  const existing = data.entries.findIndex((e) => e.questionId === questionId);
  const entry: ProgressEntry = {
    questionId,
    completed,
    lastAttemptAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    data.entries[existing] = entry;
  } else {
    data.entries.push(entry);
  }
  saveProgress(data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
  }
}

export function onProgressUpdated(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(PROGRESS_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PROGRESS_UPDATED_EVENT, callback);
}

export function isQuestionCompleted(questionId: string): boolean {
  const data = getProgress();
  const entry = data.entries.find((e) => e.questionId === questionId);
  return entry?.completed ?? false;
}

export function getCompletedQuestionIds(): Set<string> {
  const data = getProgress();
  return new Set(data.entries.filter((e) => e.completed).map((e) => e.questionId));
}
