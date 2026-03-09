'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getJobPracticeSetById } from '@/lib/jobs/storage';
import { getQuestionById } from '@/lib/questions';
import { PracticeView } from '@/components/PracticeView';
import type { Question } from '@/types/question';

export default function JobPracticePage() {
  const params = useParams();
  const setId = params.setId as string;
  const questionId = params.questionId as string;
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const set = getJobPracticeSetById(setId);
    if (!set) {
      setQuestion(undefined as unknown as Question);
      return;
    }
    const fromSet = set.questions?.find((q) => q.id === questionId);
    const fromBank = getQuestionById(questionId);
    setQuestion(fromSet ?? fromBank ?? null);
  }, [setId, questionId]);

  if (question === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Job set not found.</p>
      </div>
    );
  }

  if (question === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Question not found.</p>
      </div>
    );
  }

  return <PracticeView question={question} backHref={`/jobs/${setId}`} />;
}
