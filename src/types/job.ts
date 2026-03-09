import type { Question } from './question';

export interface JobPracticeSet {
  id: string;
  company: string;
  role: string;
  jobUrl: string;
  jobDescription: string;
  extractedSkills: string[];
  questionIds: string[];
  /** Full question data for web-fetched and LLM-generated questions (not in static bank) */
  questions?: Question[];
  createdAt: string;
}

export interface FetchedJob {
  company: string;
  role: string;
  description: string;
  url: string;
}
