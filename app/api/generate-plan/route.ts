import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { formatKnowledgeBaseContext } from '@/lib/knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const resourceSearch = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    const { primary_need, urgency, client_initials, caseworker_name, zip_code, additional_context } = body;

    // Search for local resources if ZIP code provided (uses 211 database)
    let localResources = '';
    if (zip_code) {
      localResources = await search211Resources(zip_code, primary_need);
    }

    // Load organizational knowledge base context
    const knowledgeBaseContext = formatKnowledgeBaseContext(primary_need, zip_code);

    // Build the prompt for GPT
    const prompt = `You are an AI assistant helping social workers create comprehensive case plans for clients in crisis situations. Analyze the following case information and create a detailed, actionable case plan.${knowledgeBaseContext}

**Case Information:**
- Primary Need: ${primary_need}
- Urgency Level: ${urgency}
${client_initials ? `- Client Initials: ${client_initials}` : ''}
${caseworker_name ? `- Case Worker: ${caseworker_name}` : ''}
${zip_code ? `- Location (ZIP): ${zip_code}` : ''}
${additional_context ? `- Additional Context: ${additional_context}` : ''}

${localResources ? `**Local Resources Found (ZIP ${zip_code}):**\n${localResources}\n` : ''}

**Please provide a comprehensive case plan that includes:**

1. **Identified Need(s)**: Clearly summarize the primary need(s) and any secondary concerns based on the information provided.

2. **Recommended Steps**: List 3-5 concrete, actionable steps to address or stabilize the situation. Each step should be:
   - Specific and trauma-informed
   - Prioritized by urgency
   - Realistic and achievable
   - Include who should take the action (caseworker, client, or both)

3. **Local Resources** ${zip_code ? `(for ZIP code ${zip_code})` : ''}: ${localResources ? 'Use the local resources found above and organize them by relevance to the case. Include:' : 'Suggest relevant community resources, services, or organizations that could help. Include:'}
   - Type of resource (hotline, shelter, clinic, support group, etc.)
   - Brief description of how it helps
   - Contact information (phone, website) when available
   ${!localResources ? '- General national resources and hotlines' : ''}

4. **Risk Assessment**: Brief note on any immediate safety concerns or red flags

5. **Follow-up Timeline**: Suggest when the next check-in should occur

Format your response in clear, easy-to-read sections with bullet points. Use compassionate, professional language that honors the client's dignity. Be trauma-informed and culturally sensitive.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert social work assistant specializing in trauma-informed care and crisis intervention. You help create comprehensive, actionable case plans.'
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
        model: 'gpt-4o-mini',
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
