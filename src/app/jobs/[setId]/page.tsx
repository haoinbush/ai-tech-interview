'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { JobPracticeSetView } from '@/components/JobPracticeSetView';
import { getJobPracticeSetById } from '@/lib/jobs/storage';
import type { JobPracticeSet } from '@/types/job';

export default function JobSetPage() {
  const params = useParams();
  const setId = params.setId as string;
  const [set, setSet] = useState<JobPracticeSet | null>(null);

  useEffect(() => {
    setSet(getJobPracticeSetById(setId) ?? null);
  }, [setId]);

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return <JobPracticeSetView set={set} />;
}
