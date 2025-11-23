import { NextRequest, NextResponse } from 'next/server';
import { getBestPractices } from '@/lib/knowledge-base';
import { createPerplexityClient, DEFAULT_MODEL } from '@/lib/perplexity-client';

const perplexity = createPerplexityClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_topic, context, resource_type } = body;

    // Get relevant best practices from knowledge base
    const bestPractices = getBestPractices(skill_topic);
    let bestPracticesContext = '';
    if (bestPractices.length > 0) {
      bestPracticesContext = `\n**Organizational Best Practices for ${skill_topic}:**\n`;
      bestPractices.forEach(practice => {
        bestPracticesContext += `- ${practice}\n`;
      });
    }

    // Build resource type instruction
    const resourceTypeInstruction = resource_type === 'worksheet'
      ? 'Create an interactive WORKSHEET with exercises and activities the client can complete.'
      : resource_type === 'reading'
      ? 'Create READING MATERIAL with information, examples, and tips the client can review.'
      : resource_type === 'exercise'
      ? 'Create hands-on EXERCISES and activities the client can practice on their own.'
      : 'Create the most appropriate resource type (worksheet, reading material, or exercise) based on the skill topic and context.';

    // Build the prompt for client-focused resources
    const prompt = `A social worker needs help with a client issue. They need a self-help resource to GIVE TO THEIR CLIENT to help the client work on: "${skill_topic}".

**THE SITUATION:**
The worker is dealing with a client who has this issue/need. The worker wants to provide the client with something practical they can use on their own between sessions.${bestPracticesContext}

${context ? `**What the worker told us about the client's situation:**\n${context}\n` : ''}

**WHAT THEY NEED:**
${resourceTypeInstruction}

**YOUR TASK:**
Create a client-facing handout/resource that the WORKER can give to the CLIENT. This is NOT for the worker - it's FOR THE CLIENT to use independently.

**CRITICAL INSTRUCTIONS:**
- Write directly TO the client (use "you" language)
- Make it simple enough for anyone to understand
- Focus on what the CLIENT can do on their own
- Be encouraging and empowering (not clinical or preachy)
- This should help the worker address the client's needs by giving them tools to use

**CREATE A CLIENT RESOURCE WITH THESE SECTIONS:**

${resource_type === 'worksheet' ? `
**WORKSHEET FORMAT:**
1. **Introduction**: Why this worksheet helps them (2-3 sentences)
2. **Reflection Questions**: 5-7 thought-provoking questions they can write answers to
3. **Practice Exercises**: 3-4 fill-in-the-blank or structured activities they complete
4. **Action Planning**: Space for them to write specific goals or commitments
5. **Progress Tracking**: Simple checkboxes or ratings they can mark
6. **Encouragement**: Affirming statements and next steps
` : ''}
${resource_type === 'reading' ? `
**READING MATERIAL FORMAT:**
1. **Understanding the Issue**: Clear explanation of what they're experiencing (client-friendly language)
2. **Why This Happens**: Simple explanation of common causes or patterns
3. **What You Can Do**: Practical tips and strategies organized by topic
4. **Real Examples**: Relatable scenarios showing how others have worked through this
5. **Key Takeaways**: Bullet-point summary of main ideas
6. **Additional Resources**: Suggested books, websites, or hotlines
` : ''}
${resource_type === 'exercise' ? `
**EXERCISE/ACTIVITY FORMAT:**
1. **What This Exercise Does**: Brief intro (2-3 sentences)
2. **How to Do It**: Step-by-step instructions for 2-3 hands-on activities
3. **Practice Examples**: Sample scenarios they can work through
4. **Reflection After**: Questions to think about after completing each exercise
5. **Make It Your Own**: Ways to adapt the exercises to their life
6. **Keep Going**: How to practice this regularly
` : ''}
${resource_type === 'any' ? `
1. **Why This Matters** (for the client):
   - Brief explanation of why working on this helps THEM
   - Written in warm, encouraging tone
   - 2-3 sentences that inspire hope

2. **Think About It** (reflection questions):
   - 3-5 questions the client can journal about or think through
   - Help them understand their own experience
   - Non-judgmental and open-ended

3. **Things You Can Try** (simple activities):
   - 2-3 concrete exercises the client can do alone
   - Step-by-step instructions anyone can follow
   - Each takes 5-15 minutes
   - Focus on coping skills, awareness, or positive change

4. **Your Daily Practice** (tiny habit):
   - ONE simple thing they can do every day (1-2 minutes)
   - Easy to remember and do
   - Builds consistency

5. **When Things Get Hard** (quick coping tools):
   - 3-4 in-the-moment techniques for when they're struggling
   - Fast, practical, accessible
   - No special equipment needed

6. **Words of Encouragement** (affirmations):
   - 3-5 positive statements they can say to themselves
   - Related to this specific issue
   - Strength-based and hopeful

7. **Tracking Your Progress**:
   - Simple way for the client to see if they're improving
   - Could be a weekly question or simple rating
   - Easy and encouraging

8. **When to Reach Out for Help**:
   - Clear signs they should contact their worker/counselor
   - Permission to ask for help
   - Normalize needing support
` : ''}

**FORMATTING:**
- Clear section headings
- Bullet points and simple language (8th grade reading level)
- NO clinical jargon or therapy-speak
- Warm, supportive, friend-like tone
- Think: "helpful guide" not "treatment manual"

**REMEMBER:** The worker will HAND THIS to their client. The client will read it alone. Make it work for the CLIENT, help the WORKER address the issue.`;

    const completion = await perplexity.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate social worker who creates client-facing self-help materials. You understand that workers need practical handouts to give their clients - tools clients can use independently between sessions. Your materials are written DIRECTLY TO the client (not about them), using simple language, warm tone, and practical exercises. You help workers help their clients by creating empowering, trauma-informed resources that clients can actually use on their own.'
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
        resource_type,
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
