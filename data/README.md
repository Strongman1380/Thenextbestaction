# Organizational Knowledge Base

This directory contains your organization's custom knowledge base that enhances the AI-generated case plans, worker skills resources, and client resources.

## Overview

The `organizational-knowledge.json` file allows you to customize the AI's responses with your organization's specific:
- Internal resources and programs
- Local partnerships and referral networks
- Best practices and protocols
- Staff contacts
- Community-specific information

This information is automatically incorporated into all AI-generated content, ensuring consistency with your organization's approach and making the recommendations more relevant to your actual resources.

## How It Works

When generating case plans, worker resources, or client resources, the AI automatically:

1. **Loads your knowledge base** from `organizational-knowledge.json`
2. **Filters relevant information** based on the need type (housing, mental health, substance use, etc.)
3. **Includes this context** in the AI prompt
4. **Generates responses** that incorporate your organization's actual resources and best practices

## File Structure

### `organization`
Basic information about your organization.

```json
{
  "name": "Next Right Step Recovery",
  "location": "Hastings, NE 68901",
  "mission": "Trauma-informed recovery support and case management",
  "philosophy": "Compassion in the chaos. Accountability without shame."
}
```

### `internal_resources`
Programs and services your organization provides directly.

```json
[
  {
    "name": "Sober Living House",
    "type": "housing",
    "description": "Safe, structured housing for men in early recovery",
    "contact": "402-555-1234",
    "eligibility": "Men 18+, minimum 30 days sobriety, employed or job-seeking"
  }
]
```

**Fields:**
- `name`: Program name
- `type`: Category (housing, counseling, employment, education, etc.)
- `description`: What the program does
- `contact`: How to access it
- `eligibility`: Who qualifies

### `local_partnerships`
External organizations you work with regularly.

```json
[
  {
    "organization": "Mary Lanning Healthcare",
    "services": "Inpatient detox, psychiatric emergency services",
    "contact": "402-463-4521",
    "notes": "We have a direct referral line - ask for Sarah in intake"
  }
]
```

**Fields:**
- `organization`: Partner organization name
- `services`: What they provide
- `contact`: Contact information
- `notes`: Special arrangements, referral procedures, contact names

### `best_practices`
Your organization's protocols and approaches for common situations.

```json
{
  "housing_crisis": [
    "Always assess immediate safety first",
    "Connect with housing navigator within 24 hours",
    "Document current living situation",
    "Check for veterans benefits if applicable"
  ],
  "substance_use": [
    "Use harm reduction approach",
    "Never shame or judge",
    "Assess readiness for change",
    "Provide immediate naloxone access"
  ]
}
```

**Categories you can add:**
- `housing_crisis`
- `substance_use`
- `mental_health`
- `employment`
- `legal_issues`
- `domestic_violence`
- `child_welfare`
- Any custom category

### `common_referral_paths`
Step-by-step referral processes for different needs.

```json
{
  "emergency_housing": {
    "immediate": [
      "Call Salvation Army emergency shelter: 402-463-6345",
      "Emergency hotel voucher: Contact director for approval"
    ],
    "short_term": [
      "Transitional housing application: Bring ID and income verification",
      "Catholic Social Services temporary placement"
    ],
    "long_term": [
      "Housing authority waitlist: Apply online or in person",
      "Permanent supportive housing referral: Must have disability documentation"
    ]
  }
}
```

### `staff_contacts`
Key staff members clients should know about.

```json
{
  "housing_navigator": {
    "name": "Jessica Smith",
    "phone": "402-555-1234",
    "email": "jessica@nrsrecovery.org",
    "hours": "Monday-Friday 8am-5pm"
  },
  "crisis_counselor": {
    "name": "Mike Johnson",
    "phone": "402-555-5678",
    "email": "mike@nrsrecovery.org",
    "hours": "24/7 on-call"
  }
}
```

### `client_forms_documents`
Required paperwork and where to get it.

```json
[
  {
    "name": "Housing Application",
    "location": "Front desk or download from website",
    "required_for": "All housing referrals"
  },
  {
    "name": "Release of Information",
    "location": "Must be signed in person with caseworker",
    "required_for": "Coordinating with external providers"
  }
]
```

### `community_specific_info`
Local context that affects service delivery.

```json
{
  "hastings_ne": {
    "transportation": "Public bus runs limited hours - most clients need rides",
    "food_resources": "Food bank open Tuesday/Thursday 9am-2pm",
    "healthcare": "Community health center accepts Medicaid and sliding scale",
    "notes": "Rural area - plan for transportation barriers"
  }
}
```

## How to Customize

### 1. Edit the JSON File

Open `organizational-knowledge.json` in any text editor and update the sections relevant to your organization.

**Important:** Maintain valid JSON syntax:
- Use double quotes `"` (not single quotes)
- Separate items with commas
- Don't put a comma after the last item in a list
- Check for matching brackets `{}` and `[]`

### 2. Validate Your JSON

After editing, verify your JSON is valid:
- Use an online validator: https://jsonlint.com
- Or use VS Code (shows errors automatically)

### 3. Test Your Changes

After saving your changes:
1. Generate a case plan
2. Look for your custom resources in the AI's response
3. Verify best practices are reflected in recommendations

### 4. Update Regularly

Keep your knowledge base current:
- Add new partnerships as you develop them
- Update contact information when staff changes
- Revise best practices based on what works
- Remove outdated resources

## Examples

### Example 1: Adding a New Internal Resource

```json
{
  "name": "Job Readiness Workshop",
  "type": "employment",
  "description": "Weekly workshop covering resume writing, interview skills, and job search strategies",
  "contact": "Sign up with your caseworker",
  "eligibility": "Open to all clients, meets Wednesdays 2-4pm"
}
```

### Example 2: Adding a Best Practice

```json
"mental_health": [
  "Screen for crisis/suicide risk at every contact",
  "Trauma-informed approach always",
  "Connect with peer support if available",
  "Coordinate with existing providers - never duplicate",
  "Document medication compliance and side effects",
  "Flag for psychiatry if medication adjustments needed"
]
```

### Example 3: Adding a Referral Path

```json
"substance_use_treatment": {
  "assessment": [
    "Schedule ASAM assessment with intake coordinator",
    "Bring insurance card and ID",
    "Results within 48 hours"
  ],
  "outpatient": [
    "Mary Lanning Outpatient: 402-463-4521",
    "Regional West IOP: 308-635-3711"
  ],
  "residential": [
    "CenterPointe: Apply online, 2-4 week waitlist",
    "Hastings Regional: Insurance pre-auth required"
  ]
}
```

## Technical Details

### File Location
`/data/organizational-knowledge.json`

### How It's Used

The knowledge base is loaded by the `lib/knowledge-base.ts` module and provides several helper functions:

- `loadKnowledgeBase()` - Loads the entire knowledge base
- `getBestPractices(category)` - Gets best practices for a specific need
- `getInternalResources(type)` - Finds internal resources matching a type
- `getLocalPartnerships(serviceType)` - Finds relevant partnerships
- `formatKnowledgeBaseContext(needType, location)` - Formats context for AI prompts

### Caching

The knowledge base is cached in memory after the first load, so changes require restarting the application (or redeploying on Vercel).

**Local development:**
```bash
# After editing organizational-knowledge.json
# Restart the dev server
npm run dev
```

**Production (Vercel):**
- Changes will be picked up on next deployment
- Or trigger a new deployment: `vercel --prod`

## Privacy & Security

**What to include:**
- Organization contact information
- Staff names and work contact info
- Public referral sources
- General best practices
- Community resources

**What NOT to include:**
- Client names or identifying information
- Confidential agreements with partners
- Internal administrative details
- Private phone numbers or personal contact info
- Sensitive security procedures

This file is part of your deployed application and should only contain information you'd be comfortable sharing with your staff.

## Support

If you have questions or need help customizing your knowledge base:

1. Check the JSON syntax with https://jsonlint.com
2. Look at the examples in this README
3. Review the default structure in `organizational-knowledge.json`
4. Test changes locally with `npm run dev` before deploying

## Roadmap

Future enhancements could include:
- Web-based admin interface for editing the knowledge base
- Version history and rollback
- Import/export functionality
- Multi-organization support
- Real-time updates without redeployment
