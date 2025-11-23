# Next Best Action Coach - Codebase Analysis & 211 API Integration Plan

## Executive Summary

**Project**: Next-Best-Action Coach - A trauma-informed decision support tool for caseworkers at Next Right Step Recovery

**Technology Stack**: 
- Framework: Next.js 14 (React + TypeScript)
- Styling: Tailwind CSS
- AI Integration: OpenAI API (GPT-4o-mini)
- Deployment: Vercel
- Data Storage: JSON files (localStorage for MVP, upgradeable to Supabase/Firebase)

**Current Status**: MVP complete with two main AI-powered features already implemented, 211 API infrastructure partially in place

---

## 1. Project Structure & Architecture

### Directory Layout
```
/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main interface (Case Plan & Skill Building tabs)
│   ├── layout.tsx               # Root layout with branding
│   ├── globals.css              # Tailwind + custom styles
│   ├── api/
│   │   ├── generate-plan/       # 211 API integration & case plan generation
│   │   └── generate-skill-resource/  # Skill building resource generation
│   └── metrics/page.tsx         # Analytics dashboard
├── components/                   # React components
│   ├── CaseInputForm.tsx        # Form for case information (with voice input)
│   ├── CasePlanCard.tsx         # Display generated case plan results
│   ├── SkillBuildingForm.tsx    # Form for skill building requests
│   ├── SkillResourceCard.tsx    # Display skill resources
│   ├── Header.tsx               # Application header
│   ├── CompassionFooter.tsx     # Footer with compassion messaging
│   ├── FeedbackModal.tsx        # User feedback collection
│   ├── ActionButton.tsx         # One-tap action buttons
│   └── ActionCard.tsx           # Display action recommendations
├── data/                         # Static data
│   └── playbooks.json           # 10 trauma-informed playbooks (original MVP feature)
├── lib/
│   └── engine.ts                # Decision engine + metrics functions
├── types/
│   └── index.ts                 # TypeScript type definitions
├── package.json                 # Dependencies (React, Next.js, OpenAI, Anthropic)
├── tailwind.config.js           # Styling configuration
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment variable template
├── .env.local                   # Current environment (contains API keys)
└── README.md                    # Main documentation

```

### Key Technologies
- **Next.js 14**: Full-stack React framework with built-in API routes
- **OpenAI SDK**: For GPT-4o-mini model integration
- **Anthropic SDK**: For Claude API access (installed but not yet utilized)
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Markdown**: Rendering markdown content from AI responses

---

## 2. Existing API Integrations & Service Files

### OpenAI Integration (Already Implemented)

**Location**: `/app/api/generate-plan/route.ts` and `/app/api/generate-skill-resource/route.ts`

**Features**:
- Case plan generation using GPT-4o-mini
- Skill building resource generation
- Trauma-informed prompt engineering
- Markdown-formatted responses

**Configuration**:
```typescript
// Both routes use OpenAI like this:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  max_tokens: 2048,
  temperature: 0.7,
});
```

### 211 API Infrastructure (Partially Implemented)

**Location**: `/app/api/generate-plan/route.ts` (lines 11-70)

**Current Implementation**:
```typescript
async function search211Resources(zip_code: string, primary_need: string): Promise<string>
```

**What's Already Built**:
- Function to search 211 database for local resources
- ZIP code and need-type based filtering
- Automatic fallback to AI-generated resources if API fails or key is missing
- Response formatting for markdown display
- Error handling with AI fallback

**API Configuration**:
- Uses `process.env.TWO_ONE_ONE_API_KEY`
- Calls 211 API endpoint: `https://api.211.org/search`
- Includes resource parsing for organization names, descriptions, phone, website, address
- Supports radius search (currently set to 25 miles)
- Returns 8 most relevant results

---

## 3. Application Purpose & 211 Integration Fit

### Core Purpose

The Next-Best-Action Coach is designed to help NRS caseworkers make better decisions faster by:

1. **Case Planning**: Input client situation → AI generates comprehensive, trauma-informed case plan
2. **Skill Building**: Request professional development resources → AI generates customized worksheets, readings, exercises
3. **Metrics Tracking**: Anonymous tracking of action outcomes for program improvement

### How 211 API Fits

**Current State**: The 211 API integration is already partially implemented in the case plan generation flow

**When 211 Data is Used**:
- User provides ZIP code in the case input form
- Case plan API endpoint searches 211 database for local resources
- If 211 API key is provided and available, it returns real verified resources
- If not available, it falls back to AI-generated resources

**Integration Points**:
1. **CaseInputForm.tsx**: Collects ZIP code input
2. **generate-plan/route.ts**: Calls search211Resources() function
3. **Case Plan Card Display**: Shows formatted resources in the generated plan

**Value Proposition**:
- Real, verified local resources instead of AI-generated recommendations
- Better outcomes through concrete service provider connections
- ZIP code-based matching for truly relevant recommendations
- Automatic fallback ensures service doesn't break if 211 API unavailable

---

## 4. Configuration Files & API Key Storage

### Environment Variables Structure

**File**: `.env.local` (gitignored, never committed)

**Current Content**:
```
# OpenAI API Key
OPENAI_API_KEY=sk-proj-[...key...]

# 211 API Key (Optional - get from https://apiportal.211.org/)
# If not provided, will use AI fallback for resource search
# TWO_ONE_ONE_API_KEY=your_211_api_key_here
```

**Template**: `.env.example` (safe to commit, shows structure)
```
# OpenAI API Key
OPENAI_API_KEY=

# 211 API Key (Optional - get from https://apiportal.211.org/)
# If not provided, will use AI fallback for resource search
# TWO_ONE_ONE_API_KEY=your_211_api_key_here

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Database (If upgrading from localStorage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Support Contact
NEXT_PUBLIC_SUPPORT_EMAIL=support@nrsrecovery.org

# App Configuration
NEXT_PUBLIC_APP_NAME=Next-Best-Action Coach
NEXT_PUBLIC_ORG_NAME=Next Right Step Recovery
```

### Important Notes on Environment Variables

**Private vs Public**:
- `OPENAI_API_KEY`: Private (backend only) - ✅ Correctly not prefixed with NEXT_PUBLIC
- `TWO_ONE_ONE_API_KEY`: Private (backend only) - ✅ No NEXT_PUBLIC prefix
- Analytics/Org config: Public variables - ✅ Correctly prefixed with NEXT_PUBLIC

**Server-Side Access**:
- Both API keys are accessed in route handlers (backend only)
- Safe from client-side exposure
- Good security practice already implemented

---

## 5. Components & Pages Where 211 Resources Display

### Components Involved in 211 Integration

#### 1. **CaseInputForm.tsx**
- **Purpose**: Collects case information from caseworker
- **Key Fields**:
  - `primary_need` (string) - What the client needs
  - `urgency` (low/medium/high) - Urgency level
  - `zip_code` (string) - Used for 211 resource search
  - `client_initials` (optional)
  - `caseworker_name` (optional)
  - `additional_context` (optional)
- **Speech-to-Text**: Uses Web Speech API for voice input
- **Location**: `/components/CaseInputForm.tsx` (lines 1-100+)

#### 2. **CasePlanCard.tsx**
- **Purpose**: Displays the AI-generated case plan
- **Displays**:
  - Case plan text (rendered via React Markdown)
  - Urgency level indicator
  - Copy & Print functionality
  - 211 resources are embedded in the markdown content
- **Location**: `/components/CasePlanCard.tsx`
- **Key Feature**: Uses `ReactMarkdown` component to render formatted AI output including resource listings

#### 3. **API Route: generate-plan/route.ts**
- **Purpose**: Orchestrates case plan generation with optional 211 resource search
- **Process Flow**:
  1. Receives form data with ZIP code
  2. Calls `search211Resources()` if ZIP code provided
  3. Gets formatted resource list (from 211 or AI fallback)
  4. Includes resources in GPT prompt
  5. GPT generates plan with resources integrated
  6. Returns complete markdown-formatted case plan
- **Location**: `/app/api/generate-plan/route.ts` (lines 1-184)

### Data Flow for 211 Resources

```
User Input (Case Form)
    ↓
CaseInputForm.tsx captures zip_code
    ↓
POST to /api/generate-plan
    ↓
search211Resources(zip_code, primary_need)
    ↓
Call 211 API or use AI fallback
    ↓
Format resources into text
    ↓
Include in GPT prompt
    ↓
GPT integrates resources into case plan
    ↓
Return markdown formatted response
    ↓
CasePlanCard.tsx displays with ReactMarkdown
```

---

## 6. Recommendations for 211 API Integration Enhancement

### Current Status
✅ The 211 API integration is already designed and partially implemented
✅ Configuration structure is in place
✅ Error handling and AI fallback is coded
✅ The API key storage is secure

### What's Still Needed

#### Phase 1: Activation (Immediate)
1. **Obtain 211 API Key**
   - Visit https://apiportal.211.org/
   - Register for API access
   - Document the API key and authentication method
   - Update `.env.local` with: `TWO_ONE_ONE_API_KEY=your_key_here`

2. **Test the Integration**
   - Run app locally: `npm run dev`
   - Open case plan form
   - Enter a ZIP code and primary need
   - Verify 211 resources appear in the generated plan
   - Check browser console for any API errors

3. **Deployment Configuration**
   - For Vercel deployment: Add `TWO_ONE_ONE_API_KEY` to Environment Variables
   - Settings → Environment Variables → Add new variable
   - Ensure it's available to API routes (not marked as NEXT_PUBLIC)

#### Phase 2: Validation & Testing (Week 1-2)
1. **Test with Multiple ZIP Codes**
   - Verify results vary by location
   - Test edge cases (rural areas, small towns)
   - Validate resource accuracy

2. **A/B Testing**
   - Compare AI-generated vs 211 real resources
   - Measure caseworker preference via feedback system
   - Check completion rates for resources

3. **Error Monitoring**
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor 211 API failures
   - Alert if fallback happens frequently

#### Phase 3: Enhancement (Week 2-3)
1. **Resource Filtering**
   - Add crisis-type specific filtering to 211 search
   - Implement resource relevance scoring
   - Support multiple resource types (shelter, mental health, employment, etc.)

2. **Caching**
   - Cache ZIP code searches for 24-48 hours
   - Reduce API call volume
   - Improve response speed

3. **Direct Integration**
   - Add 211 resource links directly in case plan
   - One-click resource scheduling where available
   - Phone number formatting and validation

#### Phase 4: Advanced Features (Month 2)
1. **Expand to Other ZIP Code Ranges**
   - Pre-populate common service areas
   - Support radius search expansion
   - Consider SAMHSA and state-specific databases

2. **Analytics Integration**
   - Track which resources are most used
   - Measure referral outcomes
   - Identify gaps in local services

3. **Mobile Optimization**
   - Ensure 211 resource links work on mobile
   - Test click-to-call functionality
   - Optimize for low-bandwidth scenarios

---

## 7. Technical Implementation Details

### The search211Resources Function

**Located**: `/app/api/generate-plan/route.ts` lines 11-70

**Key Code**:
```typescript
async function search211Resources(zip_code: string, primary_need: string): Promise<string> {
  if (!zip_code) return '';

  const API_KEY = process.env.TWO_ONE_ONE_API_KEY;

  if (!API_KEY) {
    console.log('No 211 API key found, using AI fallback');
    return searchLocalResourcesWithAI(zip_code, primary_need);
  }

  try {
    const apiUrl = 'https://api.211.org/search';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        terms: primary_need,
        location: zip_code,
        radius: 25, // miles
        max_results: 10,
      }),
    });

    if (!response.ok) {
      console.error('211 API error:', response.status, response.statusText);
      return searchLocalResourcesWithAI(zip_code, primary_need);
    }

    const data = await response.json();

    // Format and return results...
    if (data.results && data.results.length > 0) {
      let formattedResults = '';
      data.results.slice(0, 8).forEach((resource: any, index: number) => {
        formattedResults += `${index + 1}. **${resource.organization_name || resource.name}**\n`;
        if (resource.description) formattedResults += `   - ${resource.description}\n`;
        if (resource.phone) formattedResults += `   - Phone: ${resource.phone}\n`;
        if (resource.website) formattedResults += `   - Website: ${resource.website}\n`;
        if (resource.address) formattedResults += `   - Address: ${resource.address}\n`;
        formattedResults += '\n';
      });
      return formattedResults;
    }

    return searchLocalResourcesWithAI(zip_code, primary_need);

  } catch (error) {
    console.error('Error searching 211 resources:', error);
    return searchLocalResourcesWithAI(zip_code, primary_need);
  }
}
```

### Fallback AI Function

**Purpose**: Ensures service continuity if 211 API unavailable

**Located**: `/app/api/generate-plan/route.ts` lines 75-98

**Uses OpenAI to Generate Local Resources**:
```typescript
async function searchLocalResourcesWithAI(zip_code: string, primary_need: string): Promise<string> {
  // Uses GPT-4o-mini to generate realistic local resources
  // Fallback only, not primary integration
}
```

---

## 8. Security Considerations

### API Key Security
- ✅ Keys stored in `.env.local` (not committed)
- ✅ Keys not exposed to client (no NEXT_PUBLIC prefix)
- ✅ Backend-only access via API routes
- ✅ Authorization header properly formatted

### Data Privacy
- ✅ No client PII stored permanently
- ✅ No tracking of individual clients (anonymous caseworker usage only)
- ✅ ZIP code used only for resource matching, not stored
- ✅ localStorage for metrics doesn't contain identifying info

### Recommendations
1. Implement rate limiting on API routes
2. Add request validation before calling 211 API
3. Log failed API calls for monitoring
4. Consider secrets management for production (AWS Secrets Manager, etc.)
5. Implement CORS restrictions if API is called from frontend

---

## 9. Summary & Next Steps

### Current Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| 211 API Function | ✅ Complete | `search211Resources()` fully coded |
| Error Handling | ✅ Complete | Graceful fallback to AI |
| Environment Setup | ✅ Ready | `.env.example` configured |
| Form Input | ✅ Complete | ZIP code collection in CaseInputForm |
| Integration in Case Plan | ✅ Complete | Resources included in prompt |
| Display Components | ✅ Complete | CasePlanCard renders resources |
| API Key Documentation | ✅ Complete | Comments in code and .env.example |
| Testing | ⚠️ Pending | Needs actual 211 API key |
| Deployment Config | ⚠️ Pending | Needs Vercel environment variables |

### Quick Start Checklist

- [ ] Get 211 API key from https://apiportal.211.org/
- [ ] Add key to `.env.local`: `TWO_ONE_ONE_API_KEY=your_key`
- [ ] Test locally with `npm run dev`
- [ ] Try case plan generation with a valid ZIP code
- [ ] Verify 211 resources appear in output (not AI fallback)
- [ ] Deploy to Vercel
- [ ] Add environment variable to Vercel project
- [ ] Test in production
- [ ] Set up monitoring/error alerts

### File Paths (Absolute)

Critical files for 211 integration:
- `/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/app/api/generate-plan/route.ts` (primary integration)
- `/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/components/CaseInputForm.tsx` (input)
- `/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/components/CasePlanCard.tsx` (display)
- `/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/.env.local` (configuration)
- `/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action/.env.example` (template)

---

## 10. Optional Enhancements

### Future Integrations to Consider
1. **SAMHSA Treatment Locator**: For mental health & substance use resources
2. **Local Government Services**: Housing, employment, government assistance
3. **Faith-Based Resources**: Aligned with NRS's spiritual mission
4. **Peer Support Networks**: Local support groups and peer circles
5. **Crisis Text Line API**: Direct integration with crisis services

### AI Enhancement Opportunities
- Anthropic Claude for more nuanced resource matching (SDK already installed)
- Sentiment analysis to detect genuine crisis vs routine follow-up
- Predictive risk modeling to flag high-urgency situations
- Multilingual support for diverse client populations

---

**End of Analysis**
