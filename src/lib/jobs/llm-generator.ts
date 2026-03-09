import type { Question } from '@/types/question';
import type { ExtractedSkills } from './skill-extractor';

/**
 * Generates interview questions via OpenAI/Anthropic.
 * Only runs when user explicitly enables "Generate with AI" in the Add Job form.
 * Requires OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local.
 */
export async function generateQuestions(
  jobDescription: string,
  company: string,
  role: string,
  skills: string[]
): Promise<Question[]> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return [];
  }

  const provider = process.env.OPENAI_API_KEY ? 'openai' : 'anthropic';

  const prompt = `Generate 10 technical interview questions for a ${role} position at ${company}.

Job context: ${jobDescription.slice(0, 1500)}

Required skills: ${skills.join(', ')}

Generate a mix of SQL and Python questions focused on payments, fintech, and data analysis. Return a JSON array of objects with this exact structure:
[
  {"title": "...", "difficulty": "easy|medium|hard", "topic": "sql|python", "description": "...", "starterCode": "...", "solution": "...", "hints": ["..."], "skills": ["sql", "python", ...]}
]

Return ONLY the JSON array, no other text.`;

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!res.ok) return [];

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      return parseGeneratedQuestions(content, company, role);
    } else {
      const res = await fetch(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
          }),
        }
      );

      if (!res.ok) return [];

      const data = await res.json();
      const content = data.content?.[0]?.text ?? '';
      return parseGeneratedQuestions(content, company, role);
    }
  } catch {
    return [];
  }
}

function parseGeneratedQuestions(
  content: string,
  company: string,
  role: string
): Question[] {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      difficulty: string;
      topic: string;
      description: string;
      starterCode: string;
      solution: string;
      hints?: string[];
      skills?: string[];
    }>;

    return parsed.map((q, i) => ({
      id: `gen-${Date.now()}-${i}`,
      title: q.title ?? 'Generated Question',
      topic: (q.topic === 'sql' || q.topic === 'python' ? q.topic : 'sql') as 'sql' | 'python',
      difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty?.toLowerCase())
        ? q.difficulty.toLowerCase()
        : 'medium') as 'easy' | 'medium' | 'hard',
      description: q.description ?? '',
      starterCode: q.starterCode ?? '',
      solution: q.solution ?? '',
      hints: q.hints ?? [],
      skills: q.skills ?? [],
      company,
      role,
      source: 'generated' as const,
      datasetId: 'fintech',
    }));
  } catch {
    return [];
  }
}
