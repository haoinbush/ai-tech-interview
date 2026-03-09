import { sqlQuestions } from './sql-questions';
import { pythonQuestions } from './python-questions';
import { companyQuestions } from './company-questions';
import type { Question } from '@/types/question';

export const allQuestions: Question[] = [...sqlQuestions, ...pythonQuestions];
export const allQuestionsWithCompany: Question[] = [
  ...allQuestions,
  ...companyQuestions,
];

export { sqlQuestions, pythonQuestions, companyQuestions };

export function getQuestionById(id: string): Question | undefined {
  return allQuestionsWithCompany.find((q) => q.id === id);
}

export function getQuestionsByTopic(topic: Question['topic']): Question[] {
  return allQuestions.filter((q) => q.topic === topic);
}

export function getQuestionsByDifficulty(difficulty: Question['difficulty']): Question[] {
  return allQuestions.filter((q) => q.difficulty === difficulty);
}
