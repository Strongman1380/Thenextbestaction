import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getBestPractices, loadKnowledgeBase } from '@/lib/knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_topic, worker_name, context, resource_type } = body;

    // Get organizational knowledge
    const kb = loadKnowledgeBase();
    const bestPractices = getBestPractices(skill_topic);

    // Build best practices context
    let bestPracticesContext = '';
    if (bestPractices.length > 0) {
      bestPracticesContext = `\n**${kb.organization.name} Best Practices:**\n`;
      bestPractices.forEach(practice => {
        bestPracticesContext += `- ${practice}\n`;
      });
    }

    // Build resource type instruction
    const resourceTypeInstruction = resource_type === 'worksheet'
      ? 'Create an interactive worksheet with exercises, reflection questions, and practical activities.'
      : resource_type === 'reading'
      ? 'Create a comprehensive reading material with key concepts, theories, and evidence-based practices.'
      : resource_type === 'exercise'
      ? 'Create a practical exercise or activity with step-by-step instructions and reflection prompts.'
      : 'Create the most appropriate resource type (worksheet, reading material, or exercise) based on the topic and context.';

    // Build the prompt for GPT
    const prompt = `You are a professional development specialist for social workers and case managers at ${kb.organization.name}. Our mission: ${kb.organization.mission}. Our philosophy: ${kb.organization.philosophy}

Create a high-quality, evidence-based learning resource to help develop professional skills.

**Topic/Skill to Address:**
${skill_topic}

${worker_name ? `**Social Worker:** ${worker_name}` : ''}

**Context & Situation:**
${context}${bestPracticesContext}

**Resource Type:**
${resourceTypeInstruction}

**Please create a comprehensive professional development resource that includes:**

1. **Introduction & Learning Objectives**
   - Clear, specific learning objectives
   - Why this skill matters in social work practice
   - How this addresses the described situation

2. **Core Content**
   - Evidence-based strategies and techniques
   - Real-world examples and scenarios
   - Trauma-informed and culturally responsive approaches
   - Research or theoretical framework (when applicable)

3. **Practical Application**
   ${resource_type === 'worksheet' ? '- Reflection questions\n   - Self-assessment items\n   - Goal-setting exercises\n   - Action planning template' : ''}
   ${resource_type === 'reading' ? '- Key takeaways\n   - Discussion questions\n   - Further reading suggestions' : ''}
   ${resource_type === 'exercise' ? '- Step-by-step instructions\n   - Guided practice scenarios\n   - Reflection prompts\n   - Implementation checklist' : ''}
   ${resource_type === 'any' ? '- Interactive elements\n   - Reflection questions\n   - Practical exercises\n   - Action steps' : ''}

4. **Resources & Next Steps**
   - Recommended readings or training
   - Professional organizations or communities
   - Self-care reminders
   - Follow-up suggestions

**Format Guidelines:**
- Use clear headings and sections
- Include bullet points and numbered lists
- Make it actionable and practical
- Use professional, accessible language
- Incorporate empathy and support for the worker
- Address ethical considerations when relevant

Create a resource that is immediately usable and genuinely helpful for professional growth.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in social work education, professional development, and evidence-based practice. You create high-quality, practical learning materials that support caseworkers and social workers in developing their skills. Your resources are trauma-informed, culturally responsive, and grounded in research.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const skillResource = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      skill_resource: skillResource,
      metadata: {
        model: 'gpt-4o-mini',
        skill_topic,
        resource_type,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Error generating skill resource:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate skill building resource',
      },
      { status: 500 }
    );
  }
}
