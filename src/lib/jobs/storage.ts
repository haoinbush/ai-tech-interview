import type { JobPracticeSet } from '@/types/job';

const STORAGE_KEY = 'tech-interview-job-sets';

export function getJobPracticeSets(): JobPracticeSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JobPracticeSet[];
  } catch {
    return [];
  }
}

const JOB_SETS_UPDATED = 'tech-interview-job-sets-updated';

export function saveJobPracticeSet(set: JobPracticeSet): void {
  if (typeof window === 'undefined') return;
  try {
    const sets = getJobPracticeSets();
    const existing = sets.findIndex((s) => s.id === set.id);
    if (existing >= 0) {
      sets[existing] = set;
    } else {
      sets.push(set);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    window.dispatchEvent(new CustomEvent(JOB_SETS_UPDATED));
  } catch {
    // Ignore
  }
}

export function getJobPracticeSetById(id: string): JobPracticeSet | undefined {
  return getJobPracticeSets().find((s) => s.id === id);
}

export function deleteJobPracticeSet(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const sets = getJobPracticeSets().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    window.dispatchEvent(new CustomEvent(JOB_SETS_UPDATED));
  } catch {
    // Ignore
  }
}

export function onJobSetsUpdated(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(JOB_SETS_UPDATED, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(JOB_SETS_UPDATED, callback);
    window.removeEventListener('storage', callback);
  };
}
