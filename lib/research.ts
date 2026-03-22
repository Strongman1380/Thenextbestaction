import { anthropic, MODEL } from './anthropic-client';

export interface ResearchResult {
  summary: string;
  keyFindings: string[];
  sources?: string[];
}

/**
 * Research a topic using Claude
 */
export async function researchTopic(
  topic: string,
  context?: string,
  focusArea?: 'best_practices' | 'treatment_approaches' | 'crisis_intervention' | 'evidence_based'
): Promise<ResearchResult> {
  let researchQuery = '';

  switch (focusArea) {
    case 'best_practices':
      researchQuery = `What are the current evidence-based best practices for ${topic} in social work and case management? Focus on trauma-informed, client-centered approaches.`;
      break;
    case 'treatment_approaches':
      researchQuery = `What are effective treatment approaches and interventions for ${topic}? Include evidence-based protocols and step-by-step guidance.`;
      break;
    case 'crisis_intervention':
      researchQuery = `What are critical crisis intervention strategies for ${topic}? Include red flags, immediate actions, and safety considerations.`;
      break;
    case 'evidence_based':
      researchQuery = `What does current research say about ${topic}? Include evidence-based interventions, outcomes, and professional guidelines.`;
      break;
    default:
      researchQuery = `Provide evidence-based information about ${topic} relevant to social work, case management, and trauma-informed care.`;
  }

  if (context) {
    researchQuery += ` Context: ${context}`;
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: 'You are a research assistant for social workers and case managers. Provide concise, evidence-based information that is actionable and trauma-informed. Focus on practical guidance that can be immediately applied.',
      messages: [{ role: 'user', content: researchQuery }],
    });

    const researchContent = response.content[0].type === 'text' ? response.content[0].text : '';
    const keyFindings = extractKeyFindings(researchContent);

    return { summary: researchContent, keyFindings };
  } catch (error) {
    console.error('Research error:', error);
    return { summary: '', keyFindings: [] };
  }
}

function extractKeyFindings(content: string): string[] {
  const findings: string[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d\-\*•][\.\):]?\s+/)) {
      const cleaned = trimmed.replace(/^[\d\-\*•][\.\):]?\s+/, '');
      if (cleaned.length > 10) findings.push(cleaned);
    }
  }
  if (findings.length === 0) {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 5).map(s => s.trim());
  }
  return findings.slice(0, 8);
}

export function formatResearchForPrompt(research: ResearchResult): string {
  if (!research.summary && research.keyFindings.length === 0) return '';

  let formatted = '\n\n## CURRENT RESEARCH & EVIDENCE-BASED GUIDANCE\n\n';
  if (research.keyFindings.length > 0) {
    formatted += 'Key Evidence-Based Findings:\n';
    research.keyFindings.forEach((finding, index) => {
      formatted += `${index + 1}. ${finding}\n`;
    });
  }
  formatted += '\n**Important**: Incorporate these evidence-based insights into your recommendations where relevant.\n';
  return formatted;
}

export async function researchCaseNeed(
  primaryNeed: string,
  urgency: string,
  additionalContext?: string
): Promise<ResearchResult> {
  let focusArea: 'best_practices' | 'treatment_approaches' | 'crisis_intervention' | 'evidence_based';
  if (urgency === 'high') focusArea = 'crisis_intervention';
  else if (urgency === 'low') focusArea = 'evidence_based';
  else focusArea = 'best_practices';
  return researchTopic(primaryNeed, additionalContext, focusArea);
}

export async function researchSkillTopic(skillTopic: string, context?: string): Promise<ResearchResult> {
  const query = `Professional development and skill building for social workers and case managers: ${skillTopic}. What are effective learning strategies, exercises, and resources?`;
  return researchTopic(query, context, 'evidence_based');
}

export async function researchClientResource(topic: string, context?: string): Promise<ResearchResult> {
  const query = `Self-help strategies and coping skills for ${topic}. What are evidence-based techniques that individuals can use independently?`;
  return researchTopic(query, context, 'evidence_based');
}
