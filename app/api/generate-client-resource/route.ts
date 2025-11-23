import { NextRequest, NextResponse } from 'next/server';
import { getBestPractices } from '@/lib/knowledge-base';
import { createPerplexityClient, DEFAULT_MODEL } from '@/lib/perplexity-client';

const perplexity = createPerplexityClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_topic, context } = body;

    // Get relevant best practices from knowledge base
    const bestPractices = getBestPractices(skill_topic);
    let bestPracticesContext = '';
    if (bestPractices.length > 0) {
      bestPracticesContext = `\n**Organizational Best Practices for ${skill_topic}:**\n`;
      bestPractices.forEach(practice => {
        bestPracticesContext += `- ${practice}\n`;
      });
    }

    // Build the prompt for client-focused resources
    const prompt = `You are a compassionate recovery coach creating self-help resources for clients in recovery. A client is working on: "${skill_topic}"

${context ? `Additional context: ${context}` : ''}${bestPracticesContext}

Create a comprehensive, client-friendly resource that the person can use on their own. This should be trauma-informed, strengths-based, and empowering. Include:

1. **Why This Matters** - A brief, encouraging explanation of why working on this skill/topic is valuable for their recovery journey (2-3 sentences)

2. **Self-Reflection Questions** - 3-5 thoughtful questions the client can journal about or reflect on to gain insight into their situation

3. **Practical Exercises** - 2-3 concrete activities or exercises the client can do on their own:
   - Make them simple, achievable, and specific
   - Include step-by-step instructions
   - Focus on building awareness, coping skills, or positive behaviors
   - Each exercise should take 5-15 minutes

4. **Daily Practice** - A simple daily ritual or habit the client can adopt (1-2 minutes per day)

5. **Coping Strategies** - 3-4 quick tools or techniques they can use when feeling triggered or struggling with this issue

6. **Affirmations** - 3-5 positive, recovery-focused affirmations related to this topic

7. **Progress Tracking** - A simple way to track their progress (e.g., a weekly check-in question or simple rating scale)

8. **When to Reach Out** - Clear guidance on when they should contact their caseworker, sponsor, or support system

Use warm, encouraging language that emphasizes the client's strengths and capacity for growth. Avoid clinical jargon. Make this feel like a supportive friend who believes in them.

Format your response in clear sections with headings. Use bullet points and numbered lists where appropriate.`;

    const completion = await perplexity.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate recovery coach and counselor who creates empowering, trauma-informed self-help resources for clients in recovery. Your resources are practical, encouraging, and focused on building client autonomy and self-efficacy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const clientResource = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      client_resource: clientResource,
      metadata: {
        model: DEFAULT_MODEL,
        topic: skill_topic,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Error generating client resource:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate client resource',
      },
      { status: 500 }
    );
  }
}
