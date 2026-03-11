import { NextRequest, NextResponse } from 'next/server';
import { fetchJob, isStripeUrl } from '@/lib/jobs/fetcher';
import { extractSkills } from '@/lib/jobs/skill-extractor';
import { matchQuestionsToJob } from '@/lib/jobs/question-matcher';
import { fetchQuestionsFromWeb } from '@/lib/jobs/fetch-questions-from-web';
import type { JobPracticeSet } from '@/types/job';
import type { Question } from '@/types/question';

function mergeQuestions(
  webQuestions: Question[],
  curatedQuestions: Question[]
): Question[] {
  const curatedByTitle = new Map<string, Question>();
  for (const q of curatedQuestions) {
    curatedByTitle.set(q.title.toLowerCase().trim(), q);
  }
  const result: Question[] = [];
  const addedIds = new Set<string>();

  for (const q of webQuestions) {
    const key = q.title.toLowerCase().trim();
    const curated = curatedByTitle.get(key);
    const toAdd = curated ?? q;
    if (!addedIds.has(toAdd.id)) {
      addedIds.add(toAdd.id);
      result.push(toAdd);
    }
  }
  for (const q of curatedQuestions) {
    if (!addedIds.has(q.id)) {
      addedIds.add(q.id);
      result.push(q);
    }
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobUrl, useLLM } = body as { jobUrl?: string; useLLM?: boolean };

    if (!jobUrl || typeof jobUrl !== 'string') {
      return NextResponse.json(
        { error: 'jobUrl is required' },
        { status: 400 }
      );
    }

    const job = await fetchJob(jobUrl);
    if (!job) {
      const isStripeShortId =
        /^https?:\/\/(?:www\.)?stripe\.com\/jobs\/\d+\/?$/i.test(jobUrl.trim());
      const isSupported =
        /greenhouse\.io|stripe\.com\/jobs/i.test(jobUrl);
      const hint = isSupported
        ? isStripeShortId
          ? 'That Stripe URL is not a full listing page. Use a full Stripe listing URL like https://stripe.com/jobs/listing/<team-or-location>/<job-id>.'
          : isStripeUrl(jobUrl)
            ? 'Could not extract this Stripe page. Open the job posting page first, then copy its full URL from the browser address bar.'
            : 'The page may be temporarily unavailable.'
        : 'Try a direct public job posting URL with the full description (not a short redirect or blocked page).';
      return NextResponse.json(
        { error: `Could not fetch job description. ${hint}` },
        { status: 400 }
      );
    }

    const extracted = extractSkills(job.description);

    let webQuestions: Question[] = [];
    try {
      webQuestions = await fetchQuestionsFromWeb(job.company, job.role);
    } catch {
      // Continue without web questions
    }

    const curatedQuestions = matchQuestionsToJob(
      extracted,
      job.company,
      job.role
    );

    const matchedQuestions = mergeQuestions(webQuestions, curatedQuestions);

    let generatedQuestions: Question[] = [];
    if (useLLM) {
      try {
        const { generateQuestions } = await import('@/lib/jobs/llm-generator');
        generatedQuestions = await generateQuestions(
          job.description,
          job.company,
          job.role,
          extracted.skills
        );
      } catch {
        // LLM generation failed - continue without
      }
    }

    const allQuestionIds = [
      ...matchedQuestions.map((q) => q.id),
      ...generatedQuestions.map((q) => q.id),
    ];

    const dynamicQuestions = [
      ...matchedQuestions.filter((q) => q.id.startsWith('web-')),
      ...generatedQuestions,
    ];

    const jobSet: JobPracticeSet = {
      id: `job-${Date.now()}`,
      company: job.company,
      role: job.role,
      jobUrl: job.url,
      jobDescription: job.description,
      extractedSkills: extracted.skills,
      questionIds: allQuestionIds,
      questions: dynamicQuestions.length > 0 ? dynamicQuestions : undefined,
      createdAt: new Date().toISOString(),
    };

    const questions = [
      ...matchedQuestions,
      ...generatedQuestions,
    ].filter((q) => q !== undefined);

    return NextResponse.json({
      jobSet,
      questions,
    });
  } catch (e) {
    console.error('Jobs API error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
