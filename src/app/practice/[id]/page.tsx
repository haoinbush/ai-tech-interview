import { notFound } from 'next/navigation';
import { getQuestionById, allQuestionsWithCompany } from '@/lib/questions';
import { PracticeView } from '@/components/PracticeView';

export function generateStaticParams() {
  return allQuestionsWithCompany.map((q) => ({ id: q.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PracticePage({ params }: Props) {
  const { id } = await params;
  const question = getQuestionById(id);
  if (!question) notFound();
  return <PracticeView question={question} />;
}
