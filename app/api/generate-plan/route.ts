import { NextRequest, NextResponse } from 'next/server';
import { formatEnhancedKnowledgeContext } from '@/lib/knowledge-base';
import { loadDocumentKnowledge } from '@/lib/document-parser';
import { anthropic, MODEL } from '@/lib/anthropic-client';
import { researchCaseNeed, formatResearchForPrompt } from '@/lib/research';
import { validateRequest } from '@/lib/validation/validate';
import { casePlanSchema } from '@/lib/validation/schemas';
import { checkRateLimit, getClientIdentifier, getRateLimitHeaders, RATE_LIMITS } from '@/lib/middleware/rate-limit';
import { sanitizeForAI } from '@/lib/security/input-sanitizer';
import { logError } from '@/lib/utils/error-handler';

/**
 * Search 211 database for local resources based on ZIP code and need type
 * Uses 211 National Data Platform Search API v2
 */
async function search211Resources(zip_code: string, primary_need: string): Promise<string> {
  if (!zip_code) return '';

  const API_KEY = process.env.TWO_ONE_ONE_API_KEY;

  // If no 211 API key, fall back to AI-generated resources
  if (!API_KEY) {
    console.log('No 211 API key found, using AI fallback');
    return searchLocalResourcesWithAI(zip_code, primary_need);
  }

  try {
    // 211 National Data Platform Search V2 API - Keyword Search (GET method)
    // OpenAPI Spec: https://api.211.org/resources/v2/search/keyword
    // Note: keywords and location are query params, but locationMode, distance, size, etc. are HEADERS
    const keywords = encodeURIComponent(primary_need);
    const location = encodeURIComponent(zip_code);
    const apiUrl = `https://api.211.org/resources/v2/search/keyword?keywords=${keywords}&location=${location}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY, // 211 API uses Api-Key header for authentication
        'locationMode': 'Within', // Search mode: Within (strict radius), Near (nearby), Serving (service area)
        'distance': '50', // Search within 50 miles
        'size': '10', // Return up to 10 results
        'orderByDistance': 'true', // Sort by nearest first
      },
    });

    if (!response.ok) {
      console.error('211 API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('211 API error details:', errorText);
      // Fall back to AI if API fails
      return searchLocalResourcesWithAI(zip_code, primary_need);
    }

    const data = await response.json();
    console.log('211 API response:', JSON.stringify(data, null, 2));

    // Format 211 Search V2 results into readable text
    // Search V2 API returns results in the format: { count, results: [...] }
    if (data.results && data.results.length > 0) {
      let formattedResults = '';
      data.results.slice(0, 8).forEach((result: any, index: number) => {
        // Extract organization and service names
        const orgName = result.nameOrganization || 'Resource';
        const serviceName = result.nameService || '';
        const locationName = result.nameLocation || '';

        // Get description (remove HTML tags)
        let description = result.descriptionService || result.descriptionOrganization || '';
        description = description.replace(/<[^>]*>/g, ''); // Strip HTML tags

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

        // Get address with coordinates
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

        // Add service areas if available
        if (result.serviceAreas && result.serviceAreas.length > 0) {
          const areas = result.serviceAreas.map((sa: any) => sa.value).join(', ');
          formattedResults += `   - Service Areas: ${areas}\n`;
        }

        // Add 211 ID for reference
        if (result.idServiceAtLocation) {
          formattedResults += `   - 211 ID: ${result.idServiceAtLocation}\n`;
        }

        formattedResults += `   - **IMPORTANT**: Call 211 directly at 2-1-1 to get current phone numbers, hours, and eligibility requirements for this resource.\n`;
        formattedResults += '\n';
      });

      console.log(`Found ${data.count} total resources from 211 API, showing first ${Math.min(8, data.results.length)}`);
      return formattedResults;
    }

    // If no results from 211, fall back to AI
    console.log('No 211 results found, using AI fallback');
    return searchLocalResourcesWithAI(zip_code, primary_need);

  } catch (error) {
    console.error('Error searching 211 resources:', error);
    // Fall back to AI on error
    return searchLocalResourcesWithAI(zip_code, primary_need);
  }
}

/**
 * Fallback: Use AI to generate realistic local resources
 */
async function searchLocalResourcesWithAI(zip_code: string, primary_need: string): Promise<string> {
  try {
    const resourceSearch = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: 'You are a resource finder with knowledge of 211 databases and local social services. Provide real, verifiable local resources with contact information based on your training data.',
      messages: [{ role: 'user', content: `Find 5-8 real local resources for "${primary_need}" in ZIP code ${zip_code}. Include organization names, phone numbers, websites if available, physical addresses, and brief descriptions of services. Format as a numbered list with clear contact details. Focus on verified organizations like United Way 211, local nonprofits, government services, hospitals, and community centers.` }],
    });

    return resourceSearch.content[0].type === 'text' ? resourceSearch.content[0].text : '';
  } catch (error) {
    console.error('Error with AI resource search:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
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

    const body = await request.json();

    // Validate request body
    const validation = validateRequest(body, casePlanSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { primary_need, urgency, client_initials, caseworker_name, zip_code, additional_context, enable_research } = validation.data;

    // Sanitize inputs for AI to prevent prompt injection
    const sanitizedPrimaryNeed = sanitizeForAI(primary_need);
    const sanitizedAdditionalContext = additional_context ? sanitizeForAI(additional_context) : '';

    // Search for local resources if ZIP code provided (uses 211 database)
    let localResources = '';
    if (zip_code) {
      localResources = await search211Resources(zip_code, sanitizedPrimaryNeed);
    }

    // Research the topic if enabled (default: true)
    const shouldResearch = enable_research !== false; // Default to true
    let researchContext = '';

    if (shouldResearch) {
      console.log(`Researching topic: ${sanitizedPrimaryNeed}`);
      const research = await researchCaseNeed(sanitizedPrimaryNeed, urgency || 'medium', sanitizedAdditionalContext);
      researchContext = formatResearchForPrompt(research);
      console.log('Research completed');
    }

    // Load organizational knowledge base context (includes treatment providers if ZIP provided)
    const knowledgeBaseContext = formatEnhancedKnowledgeContext({
      needType: sanitizedPrimaryNeed,
      location: zip_code || undefined,
      zipCode: zip_code || undefined,
      includeProviders: true,
    });

    // Load additional document knowledge
    const documentContext = await loadDocumentKnowledge();

    // Build the prompt for case plan generation
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
${localResources ? '- Local resources have ALREADY BEEN FOUND from the 211 database and are listed above - USE THESE SPECIFIC RESOURCES in your action steps\n- DO NOT tell the caseworker to "call 2-1-1 to find resources" - the resources are ALREADY PROVIDED above\n- The caseworker should only call 2-1-1 to get PHONE NUMBERS for the specific resources you recommend from the list above' : ''}
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
${localResources ? '   - Be specific using the resources from the list above (e.g., "Contact [Organization Name from list] at [Address from list]")\n   - First action should be contacting a specific resource from the list, NOT calling 2-1-1 to search for resources' : '   - Be specific (not "find housing" but "call [specific resource] at [number] today")'}
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

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: 'You are an expert case manager specializing in trauma-informed care and crisis intervention. You excel at reading case information carefully, understanding context deeply, and selecting the BEST resources from available options. You never recommend random resources - you always choose based on what truly fits the client\'s specific situation. You create actionable, prioritized plans that connect clients to real help.',
      messages: [{ role: 'user', content: prompt }],
    });

    const casePlan = completion.content[0].type === 'text' ? completion.content[0].text : '';

    return NextResponse.json({
      success: true,
      case_plan: casePlan,
      metadata: {
        model: MODEL,
        urgency,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    logError(error, 'generate-plan-api');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate case plan',
      },
      { status: 500 }
    );
  }
}
