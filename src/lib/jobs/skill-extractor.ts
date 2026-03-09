export interface ExtractedSkills {
  skills: string[];
  difficultyBias: 'easy' | 'medium' | 'hard';
}

const SKILL_KEYWORDS: Record<string, string[]> = {
  sql: ['sql', 'proficiency in sql', 'sql queries', 'database', 'relational'],
  python: ['python', 'python or r', 'r or python', 'programming'],
  r: [' r ', ' r,', ' r.', 'statistical software'],
  ml: [
    'machine learning',
    'ml ',
    'ml models',
    'predictive',
    'modeling',
    'statistical models',
  ],
  statistics: ['statistics', 'statistical', 'hypothesis', 'probability'],
  experimentation: [
    'a/b',
    'a/b testing',
    'experimentation',
    'experiments',
    'ab testing',
  ],
  causal: ['causal inference', 'causal effect', 'causal analysis'],
  optimization: ['optimization', 'optimize', 'optimizing'],
  analytics: ['analytics', 'product analytics', 'data analysis'],
  spark: ['spark', 'pyspark'],
  hadoop: ['hadoop', 'hdfs'],
  payments: ['payments', 'payment', 'transaction', 'fintech'],
  fraud: ['fraud', 'fraud detection', 'risk'],
};

const EXPERIENCE_PATTERNS = [
  { pattern: /(\d+)[-+]?\s*years?/i, bias: 'medium' as const },
  { pattern: /(\d+)[-+]?\s*years?\s*experience/i, bias: 'medium' as const },
  { pattern: /senior|staff|lead|principal/i, bias: 'hard' as const },
  { pattern: /junior|entry|graduate|0-2/i, bias: 'easy' as const },
  { pattern: /3-8|5\+|8\+/i, bias: 'hard' as const },
];

export function extractSkills(jobDescription: string): ExtractedSkills {
  const text = jobDescription.toLowerCase();
  const skills: string[] = [];

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    const matched = keywords.some((kw) => text.includes(kw.toLowerCase()));
    if (matched && !skills.includes(skill)) {
      skills.push(skill);
    }
  }

  let difficultyBias: 'easy' | 'medium' | 'hard' = 'medium';
  for (const { pattern, bias } of EXPERIENCE_PATTERNS) {
    if (pattern.test(jobDescription)) {
      difficultyBias = bias;
      break;
    }
  }

  return { skills, difficultyBias };
}
