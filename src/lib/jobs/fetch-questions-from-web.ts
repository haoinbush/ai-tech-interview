import type { Question } from '@/types/question';

/**
 * Question sources by platform:
 * - DataLemur: Company SQL interview questions (blog)
 * - StrataScratch: Data analyst/SQL/Python interview questions (blog)
 * - Interview Query: Company interview guides (blog)
 * - Exercism: SQLite + Python exercises (public API)
 * - Mode Analytics: SQL tutorial (mode.com/sql-tutorial)
 * - Project Euler: Math/programming (projecteuler.net API)
 * - LeetCode: Algorithms (third-party API; company tags premium)
 * - Kaggle: SQL/Python exercises (auth/captcha)
 * - HackerRank, CodeSignal: Require enterprise API keys
 */
const COMPANY_SOURCES: Record<string, string[]> = {
  stripe: [
    'https://datalemur.com/blog/stripe-sql-interview-questions',
    'https://www.interviewquery.com/interview-guides/stripe-data-scientist',
    'https://www.stratascratch.com/blog/python-data-science-interview-questions',
  ],
  paypal: [
    'https://datalemur.com/blog/paypal-sql-interview-questions',
  ],
  visa: ['https://datalemur.com/blog/visa-sql-interview-questions'],
  meta: [
    'https://datalemur.com/blog/facebook-sql-interview-questions',
    'https://www.interviewquery.com/interview-guides/meta-data-scientist',
  ],
  google: [
    'https://datalemur.com/blog/google-sql-interview-questions',
    'https://www.interviewquery.com/interview-guides/google-data-scientist',
  ],
  amazon: [
    'https://datalemur.com/blog/amazon-sql-interview-questions',
    'https://www.interviewquery.com/interview-guides/amazon-data-scientist',
  ],
  microsoft: ['https://datalemur.com/blog/microsoft-sql-interview-questions'],
  apple: ['https://datalemur.com/blog/apple-sql-interview-questions'],
};

const GENERAL_SOURCES = [
  'https://www.stratascratch.com/blog/data-analyst-interview-questions-and-answers',
];

function normalizeCompany(company: string): string {
  return company.toLowerCase().replace(/\s+/g, '');
}

export async function fetchQuestionsFromWeb(
  company: string,
  role: string
): Promise<Question[]> {
  const key = normalizeCompany(company);
  const urls = [
    ...(COMPANY_SOURCES[key] ?? COMPANY_SOURCES.stripe),
    ...GENERAL_SOURCES,
  ];

  const allQuestions: Question[] = [];
  const seenTitles = new Set<string>();

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TechInterviewBot/1.0)',
        },
      });
      if (!res.ok) continue;

      const html = await res.text();
      const questions = parseHtmlForQuestions(html, company, role, url);

      for (const q of questions) {
        const titleKey = q.title.toLowerCase().trim();
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          allQuestions.push(q);
        }
      }
    } catch {
      // Skip failed fetches
    }
  }

  const exercismQuestions = await fetchExercismQuestions(company, role);
  for (const q of exercismQuestions) {
    const titleKey = q.title.toLowerCase().trim();
    if (!seenTitles.has(titleKey)) {
      seenTitles.add(titleKey);
      allQuestions.push(q);
    }
  }

  return allQuestions;
}

async function fetchExercismQuestions(
  company: string,
  role: string
): Promise<Question[]> {
  const questions: Question[] = [];
  try {
    const [sqlRes, pyRes] = await Promise.all([
      fetch('https://exercism.org/api/v2/tracks/sqlite/exercises'),
      fetch('https://exercism.org/api/v2/tracks/python/exercises'),
    ]);

    const addFromApi = async (res: Response, topic: 'sql' | 'python') => {
      if (!res.ok) return;
      const data = await res.json();
      const exercises = data.exercises ?? [];
      for (let i = 0; i < Math.min(exercises.length, 10); i++) {
        const ex = exercises[i];
        const id = `web-exercism-${topic}-${ex.slug}-${Date.now()}`;
        questions.push({
          id,
          title: ex.title,
          topic,
          difficulty: (ex.difficulty ?? 'medium') as 'easy' | 'medium' | 'hard',
          description: `${ex.blurb ?? ''}\n\n(Source: Exercism - ${ex.slug})`,
          starterCode: topic === 'sql' ? `-- ${ex.title}\n` : `# ${ex.title}\n`,
          solution: `See exercism.org/tracks/${topic}/exercises/${ex.slug}`,
          company,
          role,
          source: 'curated',
          skills: [topic],
          datasetId: 'fintech',
        });
      }
    };

    await addFromApi(sqlRes, 'sql');
    await addFromApi(pyRes, 'python');
  } catch {
    // Skip
  }
  return questions;
}

function parseHtmlForQuestions(
  html: string,
  company: string,
  role: string,
  sourceUrl: string
): Question[] {
  if (sourceUrl.includes('datalemur.com')) {
    return parseDataLemurBlog(html, company, role, sourceUrl);
  }
  if (sourceUrl.includes('stratascratch.com')) {
    return parseStrataScratchBlog(html, company, role, sourceUrl);
  }
  if (sourceUrl.includes('interviewquery.com')) {
    return parseInterviewQueryGuide(html, company, role, sourceUrl);
  }
  return [];
}

/**
 * Parse DataLemur blog HTML for SQL question blocks.
 * Matches both markdown (###) and HTML (h3) heading patterns.
 */
function parseDataLemurBlog(
  html: string,
  company: string,
  role: string,
  sourceUrl: string
): Question[] {
  const questions: Question[] = [];
  const questionBlockRegex =
    /(?:###|<h3[^>]*>)\s*SQL Question \d+:\s*([^<\n]+)(?:<\/h3>)?([\s\S]*?)(?=(?:###|<h3[^>]*>)\s*SQL Question \d+:|(?:###|<h[23][^>]*>)\s*Preparing|$)/gi;

  let match;
  let index = 0;
  while ((match = questionBlockRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const block = match[2];

    const description = extractDescription(block);
    if (!description || description.length < 20) continue;

    const isConceptual =
      /what (is|does|are)|difference between|give examples/i.test(title) ||
      /constraint|denormalization|relationship/i.test(title);

    const id = `web-${company.toLowerCase()}-${index}-${Date.now()}`;
    index++;

    questions.push({
      id,
      title,
      topic: 'sql',
      difficulty: isConceptual ? 'easy' : 'medium',
      description: `${description}\n\n(Source: ${sourceUrl})`,
      starterCode: isConceptual
        ? `-- Conceptual question: explain your answer in comments\n-- ${title}\n`
        : `-- Your query here\nSELECT \n  \nFROM `,
      solution: isConceptual
        ? 'See the problem description for the conceptual answer.'
        : `-- Solution for: ${title}\n-- Try writing your own query first!`,
      company,
      role,
      source: 'curated',
      skills: ['sql', 'payments'],
      datasetId: company.toLowerCase() === 'stripe' ? 'stripe' : 'fintech',
    });
  }

  return questions;
}

function extractDescription(block: string): string {
  const text = block
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const answerIdx = text.toLowerCase().indexOf('answer:');
  const desc = answerIdx > 0 ? text.slice(0, answerIdx) : text;
  return desc.trim().slice(0, 1500);
}

function parseStrataScratchBlog(
  html: string,
  company: string,
  role: string,
  sourceUrl: string
): Question[] {
  const questions: Question[] = [];
  const blockRegex =
    /(?:####|###)\s*(?:Data Analyst Interview Question #\d+:\s*)?([^<\n]+)([\s\S]*?)(?=(?:####|###)\s*(?:Data Analyst|SQL|Python)|$)/gi;

  let match;
  let index = 0;
  while ((match = blockRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const block = match[2] ?? '';
    if (title.length < 8 || title.length > 80) continue;
    if (/^(The Data Analyst|Categories|Written by)/i.test(title)) continue;

    const description = extractDescription(block);
    if (!description || description.length < 40) continue;

    const isPython = /python|pandas|def |import /i.test(block);

    const id = `web-stratascratch-${index}-${Date.now()}`;
    index++;

    questions.push({
      id,
      title,
      topic: isPython ? 'python' : 'sql',
      difficulty: 'medium',
      description: `${description.slice(0, 800)}\n\n(Source: StrataScratch)`,
      starterCode: isPython ? `# ${title}\n` : `-- ${title}\nSELECT \n  \nFROM `,
      solution: `See ${sourceUrl} for full solution.`,
      company,
      role,
      source: 'curated',
      skills: ['sql', 'python'],
      datasetId: 'fintech',
    });
  }
  return questions;
}

function parseInterviewQueryGuide(
  html: string,
  company: string,
  role: string,
  sourceUrl: string
): Question[] {
  const questions: Question[] = [];
  const blockRegex =
    /<h[23][^>]*>([^<]+(?:SQL|Python|Experiment|Product)[^<]*)<\/h[23]>([\s\S]*?)(?=<h[23][^>]*>|$)/gi;

  let match;
  let index = 0;
  while ((match = blockRegex.exec(html)) !== null) {
    const title = match[1].trim();
    const block = match[2] ?? '';
    if (title.length < 15 || title.length > 100) continue;

    const description = extractDescription(block);
    if (!description || description.length < 60) continue;

    const id = `web-iq-${index}-${Date.now()}`;
    index++;

    questions.push({
      id,
      title,
      topic: /python|pandas/i.test(block) ? 'python' : 'sql',
      difficulty: 'medium',
      description: `${description.slice(0, 800)}\n\n(Source: Interview Query)`,
      starterCode: `-- ${title}\nSELECT \n  \nFROM `,
      solution: `See ${sourceUrl} for full solution.`,
      company,
      role,
      source: 'curated',
      skills: ['sql', 'python'],
      datasetId: 'fintech',
    });
  }
  return questions;
}
