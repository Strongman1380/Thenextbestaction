import { NextRequest, NextResponse } from 'next/server';
import { formatKnowledgeBaseContext } from '@/lib/knowledge-base';
import { loadDocumentKnowledge } from '@/lib/document-parser';
import { createPerplexityClient, DEFAULT_MODEL } from '@/lib/perplexity-client';
import { researchCaseNeed, formatResearchForPrompt } from '@/lib/research';

const perplexity = createPerplexityClient();

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
        'locationMode': 'Near', // Search mode: Near, Within, Serving
        'distance': '25', // Search within 25 miles
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

        // Get description (remove HTML tags)
        let description = result.descriptionService || result.descriptionOrganization || '';
        description = description.replace(/<[^>]*>/g, ''); // Strip HTML tags

        formattedResults += `${index + 1}. **${orgName}**\n`;

        if (serviceName && serviceName !== orgName) {
          formattedResults += `   - Service: ${serviceName}\n`;
        }

        if (description) {
          const desc = description.substring(0, 200).trim();
          formattedResults += `   - ${desc}${description.length > 200 ? '...' : ''}\n`;
        }

        // Get address
        if (result.address) {
          const addr = result.address;
          const addressParts = [addr.streetAddress, addr.city, addr.stateProvince, addr.postalCode].filter(Boolean);
          if (addressParts.length > 0) {
            formattedResults += `   - Address: ${addressParts.join(', ')}\n`;
          }
        }

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
    const resourceSearch = await perplexity.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a resource finder with knowledge of 211 databases and local social services. Provide real, verifiable local resources with contact information based on your training data.'
        },
        {
          role: 'user',
          content: `Find 5-8 real local resources for "${primary_need}" in ZIP code ${zip_code}. Include organization names, phone numbers, websites if available, physical addresses, and brief descriptions of services. Format as a numbered list with clear contact details. Focus on verified organizations like United Way 211, local nonprofits, government services, hospitals, and community centers.`
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
  try {
    const body = await request.json();
    const { primary_need, urgency, client_initials, caseworker_name, zip_code, additional_context, enable_research } = body;

    // Search for local resources if ZIP code provided (uses 211 database)
    let localResources = '';
    if (zip_code) {
      localResources = await search211Resources(zip_code, primary_need);
    }

    // Research the topic if enabled (default: true)
    const shouldResearch = enable_research !== false; // Default to true
    let researchContext = '';

    if (shouldResearch) {
      console.log(`Researching topic: ${primary_need}`);
      const research = await researchCaseNeed(primary_need, urgency, additional_context);
      researchContext = formatResearchForPrompt(research);
      console.log('Research completed');
    }

    // Load organizational knowledge base context
    const knowledgeBaseContext = formatKnowledgeBaseContext(primary_need, zip_code);
    
    // Load additional document knowledge
    const documentContext = await loadDocumentKnowledge();

    // Build the prompt for case plan generation
    const prompt = `You are creating a case plan to help a social worker address a client's needs. Your job is to carefully analyze ALL information provided and create a comprehensive, actionable plan.${knowledgeBaseContext}${documentContext}${researchContext}

**CLIENT CASE INFORMATION:**
- Primary Need: ${primary_need}
- Urgency Level: ${urgency}
${client_initials ? `- Client Initials: ${client_initials}` : ''}
${caseworker_name ? `- Case Worker: ${caseworker_name}` : ''}
${zip_code ? `- Location (ZIP): ${zip_code}` : ''}
${additional_context ? `- Additional Context: ${additional_context}` : ''}

${localResources ? `**AVAILABLE LOCAL RESOURCES (ZIP ${zip_code}):**\n${localResources}\n` : ''}

**YOUR TASK:**
1. Read and understand ALL the information above - the client's needs, the context, the urgency, and the resources available
2. Identify the BEST and MOST RELEVANT resources from those listed above
3. Create a prioritized, actionable plan that connects the client to the right help

**CRITICAL INSTRUCTIONS:**
- Focus ONLY on resources that directly address the primary need: "${primary_need}"
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
   ${localResources ? '**SELECT ONLY THE MOST RELEVANT resources from the list above.**\n\n   Format each resource clearly for easy reading and printing:\n\n   **[Resource Name]**\n   - **Why This Fits:** [Explain specifically why this resource matches the client\'s need]\n   - **Contact:** [Phone, website, and/or address - make it easy to find and reach them]\n   - **Services:** [List the specific services they offer that are relevant to this case]\n   - **Important Notes:** [Eligibility requirements, hours, any barriers, or special considerations]\n\n   List resources in priority order (most urgent/relevant first). Use clear spacing between resources for readability.' : 'Recommend specific resources with complete contact information and explanation of relevance.'}

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

    const completion = await perplexity.chat.completions.create({
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
    });

    const casePlan = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      case_plan: casePlan,
      metadata: {
        model: DEFAULT_MODEL,
        urgency,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Error generating case plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate case plan',
      },
      { status: 500 }
    );
  }
}
