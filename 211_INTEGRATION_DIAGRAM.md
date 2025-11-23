# 211 API Integration Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT BEST ACTION COACH                           │
│                  (Next.js 14 Application)                           │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │  Caseworker  │
                              │   Browser    │
                              └───────┬──────┘
                                      │
                                      │ Enter case info
                                      │ + ZIP code
                                      ▼
                              ┌──────────────────┐
                              │ CaseInputForm    │
                              │ (Client Component)│
                              └────────┬─────────┘
                                       │
                                       │ Form Data
                                       ▼
                    ┌──────────────────────────────────────┐
                    │   /api/generate-plan (API Route)     │
                    │  (Next.js Backend)                   │
                    │                                      │
                    │  1. Receives form data               │
                    │  2. Calls search211Resources()       │
                    │  3. Gets resources from:             │
                    │     - 211 API (if key exists)        │
                    │     - AI fallback (if API fails)     │
                    │  4. Builds GPT prompt with resources │
                    │  5. Calls OpenAI API                 │
                    │  6. Returns formatted case plan      │
                    └──────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                    │
                    ▼                                    ▼
        ┌─────────────────────────────┐    ┌──────────────────────┐
        │   211 API                   │    │  OpenAI API          │
        │                             │    │  (GPT-4o-mini)       │
        │ https://api.211.org/search  │    │                      │
        │ Authorization: Bearer KEY   │    │ Generate case plan   │
        │ Returns:                    │    │ with embedded         │
        │ - Org names                 │    │ resources             │
        │ - Descriptions              │    └──────────────────────┘
        │ - Phone numbers             │
        │ - Websites                  │
        │ - Addresses                 │
        └─────────────────────────────┘
                    │
                    │ Formatted resources
                    │ (if 211 succeeds)
                    │
                    │ OR
                    │
                    ▼
        ┌──────────────────────────────────┐
        │  AI Fallback                     │
        │  (searchLocalResourcesWithAI)     │
        │                                  │
        │  Uses GPT-4o-mini to generate    │
        │  realistic local resources       │
        │  (if 211 API fails or no key)    │
        └──────────────────────────────────┘
                    │
                    │ Resources + Case Plan
                    ▼
        ┌──────────────────────────────────┐
        │  Client Receives Response        │
        │  - Success: true/false           │
        │  - case_plan: markdown text      │
        │  - metadata: timestamps          │
        └──────────────────────────────────┘
                    │
                    │ Display in React
                    ▼
        ┌──────────────────────────────────┐
        │  CasePlanCard Component          │
        │  (Client Component)              │
        │                                  │
        │  - Renders markdown content      │
        │  - Displays 211 resources        │
        │  - Copy & Print buttons          │
        │  - Urgency indicator             │
        └──────────────────────────────────┘
```

## Data Flow: ZIP Code to Resources

```
INPUT:
  zip_code = "60601"
  primary_need = "housing instability"
  
PROCESSING:
  ├─ Check if ZIP code provided
  │  └─ Yes → Continue to 211 search
  │
  ├─ Check if TWO_ONE_ONE_API_KEY in environment
  │  ├─ Yes → Call 211 API
  │  └─ No → Use AI fallback
  │
  ├─ Call 211 API with:
  │  {
  │    "terms": "housing instability",
  │    "location": "60601",
  │    "radius": 25,
  │    "max_results": 10
  │  }
  │
  ├─ Receive response
  │  ├─ Success → Format results (take top 8)
  │  └─ Failure → Use AI fallback
  │
  └─ Format as markdown:
     1. **Organization Name**
        - Description...
        - Phone: (555) 123-4567
        - Website: https://...
        - Address: 123 Main St

OUTPUT:
  Formatted string embedded in GPT prompt:
  "Local Resources Found (ZIP 60601):
   1. **Chicago Housing Authority**
      - Provides emergency housing assistance
      - Phone: (312) 555-1234
   2. **Community Shelter Alliance**..."
```

## API Key Configuration Flow

```
DEVELOPMENT:
  1. Get API key from https://apiportal.211.org/
  2. Add to .env.local (gitignored):
     TWO_ONE_ONE_API_KEY=your_actual_key
  3. Run locally: npm run dev
  4. Test with ZIP codes

DEPLOYMENT (Vercel):
  1. Build & push code (without key in repo)
  2. Go to Vercel dashboard
  3. Project → Settings → Environment Variables
  4. Add new variable:
     Name: TWO_ONE_ONE_API_KEY
     Value: your_actual_key
     Environments: Production
  5. Redeploy
  6. Test in production

FILE REFERENCES:
  .env.example        ← Shows structure (no real keys)
  .env.local          ← Actual keys (gitignored)
  route.ts            ← Reads from process.env
  .gitignore          ← Prevents .env.local commit
```

## Error Handling & Fallback Chain

```
Try to get 211 resources
  │
  ├─ No ZIP code provided
  │  └─ Skip 211 search, return empty string
  │
  ├─ No API key found
  │  └─ Use AI fallback
  │
  ├─ Call 211 API
  │  ├─ Network error
  │  │  └─ Log error, use AI fallback
  │  │
  │  ├─ API returns 401/403
  │  │  └─ Auth failed, use AI fallback
  │  │
  │  ├─ API returns 500
  │  │  └─ Server error, use AI fallback
  │  │
  │  └─ API returns 200
  │     ├─ Has results
  │     │  └─ Format & return
  │     │
  │     └─ No results
  │        └─ Use AI fallback

AI FALLBACK:
  - Generate realistic resources for ZIP + need
  - Use GPT-4o-mini with knowledge cutoff training
  - Format same as 211 results
  - Ensure seamless user experience
  - Log which resources came from fallback
```

## Component Interaction Map

```
┌────────────────────┐
│   Home Page        │         render
│   (app/page.tsx)   │◄──────────────────────┐
└──────────┬─────────┘                       │
           │                                 │
     handle submit                      returns JSX
           │                                 │
           ▼                                 │
┌──────────────────────────┐                │
│  CaseInputForm           │                │
│  - Collects ZIP code     │                │
│  - Has form validation   │                │
│  - Speech-to-text        │                │
└──────────┬───────────────┘                │
           │                                 │
      onSubmit (POST)                       │
           │                                 │
           ▼                                 │
┌──────────────────────────────────────┐   │
│  /api/generate-plan                  │   │
│  1. search211Resources(zip, need)    │   │
│  2. openai.chat.completions.create() │   │
│  3. Return { success, case_plan }    │   │
└──────────┬───────────────────────────┘   │
           │                                 │
      JSON response                         │
           │                                 │
           ▼                                 │
┌──────────────────────────┐                │
│  Display Logic           │                │
│  (Home/page.tsx)         │                │
│  - Set casePlan state    │                │
│  - Render component      │                │
└──────────┬───────────────┘                │
           │                                 │
      conditional render                    │
           │                                 │
           ▼                                 │
┌──────────────────────────┐                │
│  CasePlanCard            │                │
│  - Display markdown      │                │
│  - Copy & Print buttons  │                │
│  - Urgency indicator     │                │
└──────────────────────────┘────────────────┘
           │
     (Back to start)
           │
       onNewCase()
           │
           ▼
     Clear state
```

## File Location Quick Reference

```
CONFIGURATION:
  ├─ .env.local
  │  └─ Contains TWO_ONE_ONE_API_KEY (never commit)
  │
  ├─ .env.example
  │  └─ Template showing structure (safe to commit)
  │
  └─ .gitignore
     └─ Prevents .env.local from being committed

CORE API INTEGRATION:
  ├─ app/api/generate-plan/route.ts
  │  ├─ search211Resources() function (lines 11-70)
  │  ├─ searchLocalResourcesWithAI() function (lines 75-98)
  │  ├─ Main POST handler (lines 100-184)
  │  └─ GPT prompt construction with resources
  │
  └─ app/api/generate-skill-resource/route.ts
     └─ Separate endpoint for skill building (no 211 integration)

UI COMPONENTS:
  ├─ components/CaseInputForm.tsx
  │  └─ Collects zip_code from user
  │
  ├─ components/CasePlanCard.tsx
  │  └─ Displays formatted case plan with resources
  │
  ├─ app/page.tsx
  │  └─ Main page logic, state management
  │
  └─ app/layout.tsx
     └─ Root layout wrapper

TYPE DEFINITIONS:
  └─ types/index.ts
     ├─ CaseInput interface
     ├─ UrgencyLevel type
     └─ Other types

UTILITIES:
  └─ lib/engine.ts
     ├─ getNextBestAction()
     ├─ logAction()
     ├─ getMetricsSummary()
     └─ getCrisisTypes()

DOCUMENTATION:
  ├─ README.md
  │  └─ Overview and quick start
  │
  ├─ CODEBASE_ANALYSIS.md
  │  └─ Detailed structure and integration plan (THIS FILE)
  │
  ├─ DEPLOYMENT_GUIDE.md
  │  └─ How to deploy to Vercel
  │
  ├─ PROJECT_SUMMARY.md
  │  └─ High-level project overview
  │
  └─ FILE_STRUCTURE.md
     └─ Directory and file organization
```

## Environment Variables Reference

```
REQUIRED:
  OPENAI_API_KEY
    ├─ Source: OpenAI dashboard
    ├─ Access: Backend only (no NEXT_PUBLIC prefix)
    ├─ Used in: /api/generate-plan/route.ts
    │          /api/generate-skill-resource/route.ts
    └─ Security: Never commit to git

OPTIONAL (for 211 integration):
  TWO_ONE_ONE_API_KEY
    ├─ Source: https://apiportal.211.org/
    ├─ Access: Backend only (no NEXT_PUBLIC prefix)
    ├─ Used in: /api/generate-plan/route.ts
    ├─ Fallback: AI generation if missing
    └─ Security: Never commit to git

OPTIONAL (for analytics):
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    ├─ Source: Google Analytics account
    ├─ Access: Can be in client (has NEXT_PUBLIC prefix)
    ├─ Used in: Not currently implemented
    └─ Security: Safe to expose

OPTIONAL (for database):
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
    ├─ Source: Supabase account (for future enhancement)
    ├─ Access: Supabase client key (can be public)
    ├─ Used in: Not currently implemented
    └─ Upgrade: localStorage → Supabase/Firebase

APPLICATION CONFIG:
  NEXT_PUBLIC_SUPPORT_EMAIL = support@nrsrecovery.org
  NEXT_PUBLIC_APP_NAME = Next-Best-Action Coach
  NEXT_PUBLIC_ORG_NAME = Next Right Step Recovery
    ├─ These are branding/config
    ├─ Can be public (NEXT_PUBLIC prefix)
    └─ Edit in .env.example
```

## Request/Response Flow

```
CLIENT REQUEST:
  POST /api/generate-plan
  Content-Type: application/json
  {
    "primary_need": "housing instability",
    "urgency": "high",
    "client_initials": "JD",
    "caseworker_name": "Sarah",
    "zip_code": "60601",
    "additional_context": "Client lost job, eviction notice pending"
  }

SERVER PROCESSING:
  1. Extract body JSON
  2. search211Resources("60601", "housing instability")
     ├─ Check API key
     ├─ Call 211 API
     ├─ Format results or use fallback
     └─ Return formatted string
  3. Build GPT prompt:
     "Case Information:
      - Primary Need: housing instability
      - Urgency: high
      - Location: ZIP 60601
      - Additional Context: ...
      
      Local Resources Found (ZIP 60601):
      1. Chicago Housing Authority
         - Emergency housing assistance
         - Phone: (312) 555-1234
      
      Please generate comprehensive case plan..."
  4. Call OpenAI API
  5. Format response

SERVER RESPONSE:
  {
    "success": true,
    "case_plan": "# Case Plan\n\n**Client Situation**\n...",
    "metadata": {
      "model": "gpt-4o-mini",
      "urgency": "high",
      "timestamp": "2024-11-18T..."
    }
  }

CLIENT RENDERING:
  ├─ Check success flag
  ├─ If true:
  │  ├─ Store case_plan in state
  │  ├─ Render CasePlanCard component
  │  └─ Display with ReactMarkdown
  │
  └─ If false:
     ├─ Store error message
     └─ Display error alert
```

---

**Document Purpose**: Provides visual reference for understanding the 211 API integration architecture and data flow through the Next Best Action Coach application.

**Last Updated**: November 18, 2024
