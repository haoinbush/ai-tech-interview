export type Topic = 'sql' | 'python';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FintechDomain = 'trading' | 'risk' | 'payments' | 'portfolio' | 'general';

export type QuestionSource = 'curated' | 'generated';

export interface Question {
  id: string;
  title: string;
  topic: Topic;
  difficulty: Difficulty;
  fintechDomain?: FintechDomain;
  description: string;
  starterCode: string;
  solution: string;
  hints?: string[];
  datasetId?: string;
  company?: string;
  role?: string;
  source?: QuestionSource;
  skills?: string[];
}
