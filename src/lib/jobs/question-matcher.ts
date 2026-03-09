import { companyQuestions } from '@/lib/questions/company-questions';
import { allQuestionsWithCompany } from '@/lib/questions';
import type { Question } from '@/types/question';
import type { ExtractedSkills } from './skill-extractor';

export function matchQuestionsToJob(
  extractedSkills: ExtractedSkills,
  company?: string,
  role?: string
): Question[] {
  const { skills: jobSkills, difficultyBias } = extractedSkills;

  const allCandidates = allQuestionsWithCompany.filter((q) => {
    const qSkills = q.skills ?? [];
    const qDomain = q.fintechDomain ? [q.fintechDomain] : [];
    const qRelevant = [...qSkills, ...qDomain];
    if (qRelevant.length === 0) return true;
    return jobSkills.some((js) =>
      qRelevant.some((qs) => qs.toLowerCase().includes(js.toLowerCase()))
    );
  });

  const scored = allCandidates.map((q) => {
    let score = 0;
    const qSkills = new Set((q.skills ?? []).map((s) => s.toLowerCase()));
    const qDomain = q.fintechDomain ? [q.fintechDomain] : [];

    for (const js of jobSkills) {
      if (qSkills.has(js)) score += 2;
      else if (qDomain.some((d) => d.includes(js) || js.includes(d))) score += 1;
    }

    if (company && q.company?.toLowerCase() === company.toLowerCase()) score += 3;
    if (role && q.role?.toLowerCase().includes(role.toLowerCase())) score += 2;

    const diffMatch =
      difficultyBias === q.difficulty ? 1 : difficultyBias === 'medium' ? 0.5 : 0;
    score += diffMatch;

    return { question: q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  return scored
    .filter(({ question }) => {
      if (seen.has(question.id)) return false;
      seen.add(question.id);
      return true;
    })
    .map(({ question }) => question)
    .slice(0, 20);
}
