import { NextRequest, NextResponse } from 'next/server';
import { getBestPractices, loadKnowledgeBase } from '@/lib/knowledge-base';
import { loadDocumentKnowledge } from '@/lib/document-parser';
import { createPerplexityClient, DEFAULT_MODEL } from '@/lib/perplexity-client';
import { researchSkillTopic, formatResearchForPrompt } from '@/lib/research';

const perplexity = createPerplexityClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_topic, worker_name, context, resource_type, enable_research } = body;

    // Research the topic if enabled (default: true)
    const shouldResearch = enable_research !== false;
    let researchContext = '';

    if (shouldResearch) {
      console.log(`Researching skill topic: ${skill_topic}`);
      const research = await researchSkillTopic(skill_topic, context);
      researchContext = formatResearchForPrompt(research);
      console.log('Research completed');
    }

    // Get organizational knowledge
    const kb = loadKnowledgeBase();
    const bestPractices = getBestPractices(skill_topic);
    
    // Load additional document knowledge
    const documentContext = await loadDocumentKnowledge();

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

    // Build the prompt for worker skill-building
    const prompt = `A social worker ${worker_name ? `(${worker_name}) ` : ''}is seeking to build their OWN professional knowledge and skills. They want to learn and grow in this area: "${skill_topic}".

This is NOT about helping a client - this is about helping the WORKER themselves become better at their job.${bestPracticesContext}${documentContext}${researchContext}

**WORKER'S LEARNING CONTEXT:**
${context}

**WHAT THEY NEED:**
${resourceTypeInstruction}

**YOUR TASK:**
Create a professional development resource specifically for this social worker to use for their own learning and growth. This should help THEM develop skills, knowledge, and confidence in their practice at ${kb.organization.name}.

**ORGANIZATION VALUES TO INCORPORATE:**
- Mission: ${kb.organization.mission}
- Philosophy: ${kb.organization.philosophy}

**CREATE A LEARNING RESOURCE WITH THESE SECTIONS:**

1. **Why This Matters for YOU as a Social Worker**:
   - Explain why developing this skill is important for the worker's effectiveness
   - Connect to the specific context they described
   - Set clear learning objectives for what they'll gain

2. **Core Knowledge & Skills**:
   - Evidence-based strategies and frameworks
   - Trauma-informed and culturally responsive approaches
   - Real-world examples from social work practice
   - Theory that informs practice

3. **Self-Directed Learning Activities** (for the worker to do themselves):
   ${resource_type === 'worksheet' ? '- Reflection questions to process their own experiences\n   - Self-assessment to identify strengths and growth areas\n   - Goal-setting exercises for their professional development\n   - Practice scenarios to work through' : ''}
   ${resource_type === 'reading' ? '- Key concepts clearly explained\n   - Discussion questions for peer learning groups\n   - Recommended readings and resources\n   - Takeaways they can apply immediately' : ''}
   ${resource_type === 'exercise' ? '- Step-by-step practice activities\n   - Guided scenarios to work through\n   - Reflection prompts after each exercise\n   - Self-check questions to assess understanding' : ''}
   ${resource_type === 'any' ? '- Interactive learning activities\n   - Reflection questions about their practice\n   - Practical exercises to build skill\n   - Real scenarios to analyze' : ''}

4. **Building Your Competence**:
   - How to practice this skill in real cases
   - Common challenges and how to overcome them
   - Signs you're improving
   - When to seek supervision or consultation

5. **Continuing Your Professional Growth**:
   - Recommended trainings or certifications
   - Professional organizations to join
   - Books, articles, or resources for deeper learning
   - Self-care reminder for workers

**REMEMBER:** This is for the WORKER'S professional development - not client materials. Write TO the worker, FOR the worker. Help them become more skilled and confident.

Use clear headings, bullet points, and professional but supportive tone. Make it immediately useful for their learning.`;

    const completion = await perplexity.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert social work educator and professional development specialist. You create learning resources specifically designed for social workers to develop THEIR OWN skills and knowledge. You understand that the worker is the learner here - not teaching a client, but learning themselves. Your materials help professionals grow, build competence, and gain confidence in their practice through self-directed learning.'
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
        model: DEFAULT_MODEL,
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
