import { NextRequest, NextResponse } from 'next/server';
import { formatKnowledgeBaseContext } from '@/lib/knowledge-base';
import { loadDocumentKnowledge } from '@/lib/document-parser';
import { createPerplexityClient, DEFAULT_MODEL } from '@/lib/perplexity-client';
import { researchCaseNeed, formatResearchForPrompt } from '@/lib/research';
import { validateRequest } from '@/lib/validation/validate';
import { casePlanSchema } from '@/lib/validation/schemas';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders, RATE_LIMITS } from '@/lib/middleware/rate-limit';
import { sanitizeForAI } from '@/lib/security/input-sanitizer';
import { logError } from '@/lib/utils/error-handler';

const perplexity = createPerplexityClient();

interface StreamEvent {
  type: 'status' | 'content' | 'done' | 'error' | 'warning';
  status?: string;
  content?: string;
  message?: string;
  error?: string;
}

function formatSSE(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * Search 211 database for local resources
 */
async function search211Resources(zip_code: string, primary_need: string): Promise<{ resources: string; source: '211' | 'ai-fallback'; warning?: string }> {
  if (!zip_code) return { resources: '', source: '211' };

  const API_KEY = process.env.TWO_ONE_ONE_API_KEY;

  if (!API_KEY) {
    console.log('No 211 API key found, using AI fallback');
    const resources = await searchLocalResourcesWithAI(zip_code, primary_need);
    return {
      resources,
      source: 'ai-fallback',
      warning: undefined // Suppress warning - fallback to AI silently
    };
  }

  try {
    const keywords = encodeURIComponent(primary_need);
    const location = encodeURIComponent(zip_code);
    const apiUrl = `https://api.211.org/resources/v2/search/keyword?keywords=${keywords}&location=${location}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
        'locationMode': 'Within',
        'distance': '50',
        'size': '10',
        'orderByDistance': 'true',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('211 API error:', response.status, response.statusText);
      const resources = await searchLocalResourcesWithAI(zip_code, primary_need);
      return {
        resources,
        source: 'ai-fallback',
        warning: undefined // Suppress warning - fallback to AI silently
      };
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      let formattedResults = '';
      data.results.slice(0, 8).forEach((result: any, index: number) => {
        const orgName = result.nameOrganization || 'Resource';
        const serviceName = result.nameService || '';
        const locationName = result.nameLocation || '';
        let description = result.descriptionService || result.descriptionOrganization || '';
        description = description.replace(/<[^>]*>/g, '');

        formattedResults += `${index + 1}. **${orgName}**\n`;
        if (serviceName && serviceName !== orgName) {
          formattedResults += `   - Service: ${serviceName}\n`;
        }
        if (locationName && locationName !== orgName) {
          formattedResults += `   - Location: ${locationName}\n`;
        }
        if (description) {
          const desc = description.substring(0, 250).trim();
          formattedResults += `   - Description: ${desc}${description.length > 250 ? '...' : ''}\n`;
        }
        if (result.address) {
          const addr = result.address;
          const addressParts = [addr.streetAddress, addr.city, addr.stateProvince, addr.postalCode].filter(Boolean);
          if (addressParts.length > 0) {
            formattedResults += `   - Address: ${addressParts.join(', ')}\n`;
          }
          if (addr.county) {
            formattedResults += `   - County: ${addr.county}\n`;
          }
        }
        if (result.serviceAreas && result.serviceAreas.length > 0) {
          const areas = result.serviceAreas.map((sa: any) => sa.value).join(', ');
          formattedResults += `   - Service Areas: ${areas}\n`;
        }
        if (result.idServiceAtLocation) {
          formattedResults += `   - 211 ID: ${result.idServiceAtLocation}\n`;
        }
        formattedResults += `   - **IMPORTANT**: Call 211 directly at 2-1-1 to get current phone numbers, hours, and eligibility requirements for this resource.\n`;
        formattedResults += '\n';
      });

      return { resources: formattedResults, source: '211' };
    }

    const resources = await searchLocalResourcesWithAI(zip_code, primary_need);
    return {
      resources,
      source: 'ai-fallback',
      warning: undefined // Suppress warning - fallback to AI silently
    };

  } catch (error: any) {
    console.error('211 API error:', error.name === 'AbortError' ? 'Timeout' : error.message);
    const resources = await searchLocalResourcesWithAI(zip_code, primary_need);
    return {
      resources,
      source: 'ai-fallback',
      warning: undefined // Suppress warning - fallback to AI silently
    };
  }
}

async function searchLocalResourcesWithAI(zip_code: string, primary_need: string): Promise<string> {
  try {
    const resourceSearch = await perplexity.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a resource finder with knowledge of 211 databases and local social services. Provide real, verifiable local resources with contact information based on your training data.'
        },
        {
          role: 'user',
          content: `Find 5-8 real local resources for "${primary_need}" in ZIP code ${zip_code}. Include organization names, phone numbers, websites if available, physical addresses, and brief descriptions of services.`
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    return resourceSearch.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error with AI resource search:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting check before starting stream
  const clientId = getClientIdentifier(request);
  const rateCheck = checkRateLimit(clientId, RATE_LIMITS.generation);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please wait a moment before trying again.',
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateCheck, RATE_LIMITS.generation),
      }
    );
  }

  // Parse and validate body before starting stream
  let validatedData;
  try {
    const body = await request.json();
    const validation = validateRequest(body, casePlanSchema);
    if (!validation.success) {
      return validation.response;
    }
    validatedData = validation.data;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { primary_need, urgency, client_initials, caseworker_name, zip_code, additional_context, enable_research } = validatedData;

  // Sanitize inputs for AI to prevent prompt injection
  const sanitizedPrimaryNeed = sanitizeForAI(primary_need);
  const sanitizedAdditionalContext = additional_context ? sanitizeForAI(additional_context) : '';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {

        // Send initial status
        controller.enqueue(encoder.encode(formatSSE({ type: 'status', status: 'Starting case plan generation...' })));

        // Search for local resources
        let localResources = '';
        let resourceWarning: string | undefined;

        if (zip_code) {
          controller.enqueue(encoder.encode(formatSSE({ type: 'status', status: 'Searching local resources...' })));
          const resourceResult = await search211Resources(zip_code, sanitizedPrimaryNeed);
          localResources = resourceResult.resources;
          resourceWarning = resourceResult.warning;

          if (resourceWarning) {
            controller.enqueue(encoder.encode(formatSSE({ type: 'warning', message: resourceWarning })));
          }
        }

        // Research the topic if enabled
        const shouldResearch = enable_research !== false;
        let researchContext = '';

        if (shouldResearch) {
          controller.enqueue(encoder.encode(formatSSE({ type: 'status', status: 'Researching best practices...' })));
          try {
            const research = await researchCaseNeed(sanitizedPrimaryNeed, urgency || 'medium', sanitizedAdditionalContext);
            researchContext = formatResearchForPrompt(research);
          } catch (error) {
            console.error('Research failed:', error);
            controller.enqueue(encoder.encode(formatSSE({ type: 'warning', message: 'Research unavailable, continuing with knowledge base.' })));
          }
        }

        // Load knowledge base
        controller.enqueue(encoder.encode(formatSSE({ type: 'status', status: 'Loading knowledge base...' })));
        const knowledgeBaseContext = formatKnowledgeBaseContext(sanitizedPrimaryNeed, zip_code || undefined);
        const documentContext = await loadDocumentKnowledge();

        // Build the prompt
        const prompt = `You are creating a case plan to help a social worker address a client's needs. Your job is to carefully analyze ALL information provided and create a comprehensive, actionable plan.${knowledgeBaseContext}${documentContext}${researchContext}

**CLIENT CASE INFORMATION:**
- Primary Need: ${sanitizedPrimaryNeed}
- Urgency Level: ${urgency}
${client_initials ? `- Client Initials: ${client_initials}` : ''}
${caseworker_name ? `- Case Worker: ${caseworker_name}` : ''}
${zip_code ? `- Location (ZIP): ${zip_code}` : ''}
${sanitizedAdditionalContext ? `- Additional Context: ${sanitizedAdditionalContext}` : ''}

${localResources ? `**AVAILABLE LOCAL RESOURCES (ZIP ${zip_code}):**\n${localResources}\n` : ''}

**YOUR TASK:**
1. Read and understand ALL the information above - the client's needs, the context, the urgency, and the resources available
2. Identify the BEST and MOST RELEVANT resources from those listed above
3. Create a prioritized, actionable plan that connects the client to the right help

**CRITICAL INSTRUCTIONS:**
- Focus ONLY on resources that directly address the primary need: "${sanitizedPrimaryNeed}"
- When local resources are provided, SELECT THE BEST MATCHES from that list - do NOT make up new resources
- Prioritize based on urgency level: ${urgency}
- Every recommendation must be specific and actionable
- Consider what the client needs RIGHT NOW vs. what can wait

**CREATE A CASE PLAN WITH THESE SECTIONS:**

1. **Identified Need(s)**:
   - State the primary need clearly
   - Note any secondary concerns from the context
   - Assess severity based on urgency and context

2. **Immediate Action Steps** (what needs to happen first):
   - List 3-5 concrete steps in priority order
   - Each step should specify WHO does WHAT and WHEN
   - Be specific (not "find housing" but "call [specific resource] at [number] today")
   - Include trauma-informed approaches

3. **Best-Matched Local Resources** ${zip_code ? `(ZIP ${zip_code})` : ''}:
   ${localResources ? '**SELECT ONLY THE MOST RELEVANT resources from the list above.**\n\n   Format each resource clearly for easy reading and printing:\n\n   **[Resource Name]**\n   - **Why This Fits:** [Explain specifically why this resource matches the client\'s need]\n   - **How to Contact:** [Include ALL available contact methods from the resource details above: address, 211 reference number, and remind them to call 2-1-1 for phone/hours/eligibility]\n   - **Services:** [List the specific services they offer that are relevant to this case]\n   - **Location:** [Full address and service areas from the details above]\n   - **Important Notes:** [Eligibility requirements, hours, any barriers, or special considerations. If phone/website not listed, note "Call 2-1-1 for current contact info"]\n\n   CRITICAL: Include the complete address, 211 ID, and all information provided in the resource list above. Direct caseworkers to call 2-1-1 for phone numbers and current details.\n\n   List resources in priority order (most urgent/relevant first). Use clear spacing between resources for readability.' : 'Recommend specific resources with complete contact information and explanation of relevance.'}

4. **Risk Assessment**:
   - Identify immediate safety concerns
   - Note any red flags from the context
   - Recommend crisis intervention if needed

5. **Follow-up Plan**:
   - When should the next check-in occur?
   - What should the caseworker monitor?
   - What does success look like?

**REMEMBER:** This plan is for a REAL CLIENT in need. Choose resources carefully. Be specific. Make every recommendation count.

Format in clear sections with bullet points. Use compassionate, professional language.`;

        // Start streaming the AI response
        controller.enqueue(encoder.encode(formatSSE({ type: 'status', status: 'Generating case plan...' })));

        for await (const chunk of perplexity.createChatCompletionStream({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert case manager specializing in trauma-informed care and crisis intervention. You excel at reading case information carefully, understanding context deeply, and selecting the BEST resources from available options. You never recommend random resources - you always choose based on what truly fits the client\'s specific situation. You create actionable, prioritized plans that connect clients to real help.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7,
        })) {
          controller.enqueue(encoder.encode(formatSSE({ type: 'content', content: chunk })));
        }

        controller.enqueue(encoder.encode(formatSSE({ type: 'done' })));

      } catch (error: any) {
        logError(error, 'generate-plan-stream-api');
        controller.enqueue(encoder.encode(formatSSE({
          type: 'error',
          error: error.message || 'Failed to generate case plan'
        })));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
