# Adding Information to the AI's Knowledge Base

This guide shows you how to add your organization's specific information to the AI so it can provide better, more relevant recommendations.

## What You Can Add

The AI's knowledge base supports:

1. **Internal Resources** - Programs you run (housing, counseling, etc.)
2. **Local Partnerships** - External organizations you work with
3. **Best Practices** - Your organization's protocols
4. **Referral Paths** - Step-by-step processes for common needs
5. **Staff Contacts** - Key people clients should know about
6. **Community Info** - Local context (transportation, food banks, etc.)

## Quick Start: Import from Files

### Already Have Treatment Provider Data?

If you have treatment provider data in a spreadsheet or TSV file:

```bash
# 1. Put your file in the Treatment/ folder
# 2. Run the import script
node scripts/import-treatment-providers.js

# 3. Commit and deploy
git add data/organizational-knowledge.json
git commit -m "Add treatment providers"
git push origin main
```

**✅ Done!** Your 244+ Nebraska treatment providers are now imported!

## Manual Method: Edit the JSON File

Open `data/organizational-knowledge.json` in any text editor.

### 1. Adding Internal Resources

Add programs your organization runs directly:

```json
"internal_resources": [
  {
    "name": "Men's Sober Living House",
    "type": "housing",
    "description": "Safe, structured housing for men in early recovery with 24/7 peer support",
    "contact": "Call main office at 402-555-1234",
    "eligibility": "Men 18+, minimum 30 days sobriety, employed or actively job-seeking"
  },
  {
    "name": "Weekly Recovery Support Group",
    "type": "support group",
    "description": "Peer-led recovery support group every Thursday evening",
    "contact": "Drop in, no appointment needed",
    "eligibility": "Open to all clients and alumni"
  }
]
```

### 2. Adding Local Partnerships

Your 244 treatment providers are already imported! To add more:

```json
"local_partnerships": [
  {
    "organization": "Mary Lanning Healthcare",
    "services": "Inpatient detox, psychiatric emergency services, outpatient counseling",
    "contact": "Phone: 402-463-4521 | Emergency: 911",
    "address": "715 N St Joseph Ave, Hastings, NE 68901",
    "location": "Hastings, NE",
    "notes": "We have a direct referral line - ask for Sarah in intake. Accepts Medicaid."
  }
]
```

### 3. Adding Best Practices

Add your organization's protocols for different situations:

```json
"best_practices": {
  "housing_crisis": [
    "Always assess immediate safety first - is client sleeping outside tonight?",
    "Connect with housing navigator within 24 hours",
    "Document current living situation and barriers",
    "Check for veterans benefits if applicable",
    "Complete housing assessment form before referring"
  ],
  "substance_use": [
    "Use harm reduction approach - meet client where they are",
    "Never shame or judge - addiction is a disease",
    "Assess readiness for change (pre-contemplation, contemplation, action)",
    "Provide immediate naloxone access and training",
    "Screen for co-occurring mental health conditions"
  ],
  "mental_health": [
    "Screen for crisis/suicide risk at every contact (use Columbia Protocol)",
    "Trauma-informed approach always - assume trauma history",
    "Connect with peer support if available",
    "Coordinate with existing providers - never duplicate services",
    "Document medication compliance and side effects"
  ],
  "employment": [
    "Start with resume and interview skills",
    "Address barriers first (transportation, childcare, ID)",
    "Connect with vocational rehab if disability present",
    "Follow up within 48 hours of job start"
  ]
}
```

### 4. Adding Referral Paths

Create step-by-step processes:

```json
"common_referral_paths": {
  "emergency_housing": {
    "immediate": [
      "Call Salvation Army emergency shelter: 402-463-6345",
      "Hotel voucher: Get director approval, maximum 3 nights",
      "Domestic violence: Safe Passage 24/7 hotline 402-463-4677"
    ],
    "short_term": [
      "Transitional housing application: Bring ID and proof of income",
      "Catholic Social Services: Call 402-463-6548 for intake appointment"
    ],
    "long_term": [
      "Housing authority waitlist: Apply at www.hascohousing.com",
      "Permanent supportive housing: Requires disability documentation"
    ]
  },
  "substance_use_treatment": {
    "assessment": [
      "Schedule ASAM assessment with intake coordinator",
      "Bring insurance card, ID, and medication list",
      "Results provided within 48 hours"
    ],
    "detox": [
      "Mary Lanning Hospital: 402-463-4521 (medical detox)",
      "Insurance pre-authorization usually required",
      "Medicaid accepted"
    ],
    "outpatient": [
      "Revive Inc - Horizon Recovery: 402-462-2066",
      "South Central Behavioral Services: 402-463-5684",
      "Most offer evening and weekend appointments"
    ],
    "residential": [
      "Apply online - typical wait 2-4 weeks",
      "Proof of income/insurance needed",
      "Can help with applications during case management"
    ]
  }
}
```

### 5. Adding Staff Contacts

Key people clients should know:

```json
"staff_contacts": {
  "housing_navigator": {
    "name": "Jessica Smith",
    "phone": "402-555-1234",
    "email": "jessica@nrsrecovery.org",
    "hours": "Monday-Friday 8am-5pm, emergency cell: 402-555-5678"
  },
  "crisis_counselor": {
    "name": "Mike Johnson",
    "phone": "402-555-9999",
    "email": "mike@nrsrecovery.org",
    "hours": "24/7 on-call via main office"
  },
  "employment_specialist": {
    "name": "Sarah Williams",
    "phone": "402-555-4321",
    "email": "sarah@nrsrecovery.org",
    "hours": "Tuesday-Thursday 9am-4pm"
  }
}
```

### 6. Adding Community-Specific Info

Local context that affects service delivery:

```json
"community_specific_info": {
  "hastings_ne": {
    "transportation": "Public bus runs limited hours (7am-6pm weekdays only) - most clients need rides or gas vouchers",
    "food_resources": "Food bank open Tuesday/Thursday 9am-2pm at 123 Main St. Soup kitchen daily lunch 11:30am-1pm",
    "healthcare": "Community health center at 456 Oak Ave accepts Medicaid and sliding scale. Free clinic Wednesdays 5-8pm",
    "employment": "Hiring now: Tyson (food processing), Hotels (housekeeping), Retail (seasonal)",
    "notes": "Rural area - transportation is the #1 barrier. Plan accordingly. Cell service spotty in some areas."
  },
  "grand_island_ne": {
    "transportation": "Island Transit bus system, $1 per ride. Service stops at 6pm",
    "food_resources": "Lighthouse Food Pantry, open Mon/Wed/Fri 1-4pm",
    "healthcare": "CHI Health St. Francis ER, Mid Plains Center for Behavioral Health",
    "notes": "Larger city with more services but longer wait times"
  }
}
```

## How the AI Uses This Information

When generating case plans, the AI automatically:

1. **Includes your internal resources** when relevant
2. **Prioritizes your local partnerships** over generic resources
3. **Follows your best practices** in recommendations
4. **Provides your specific referral paths** instead of generic advice
5. **References your staff contacts** by name
6. **Considers community context** (e.g., transportation barriers)

### Example

**Without knowledge base:**
> "Contact local homeless shelter for emergency housing"

**With knowledge base:**
> "**Immediate Action:** Call Salvation Army emergency shelter at 402-463-6345. If full, contact Jessica Smith (Housing Navigator) at 402-555-1234 for hotel voucher approval (max 3 nights).
>
> **Best Practice:** Complete housing assessment form before referring. Note: Transportation is limited in Hastings - client may need ride to shelter."

## After Making Changes

### Local Testing (Optional)

```bash
# Restart dev server to reload knowledge base
npm run dev

# Test a case plan generation
# Look for your custom info in the results
```

### Deploy to Production

```bash
# 1. Stage your changes
git add data/organizational-knowledge.json

# 2. Commit with a description
git commit -m "Add housing referral paths and staff contacts"

# 3. Push to GitHub
git push origin main

# Vercel will automatically deploy in 2-3 minutes
```

## Tips for Success

### ✅ Do:
- Be specific with contact information
- Include hours of operation
- Note eligibility requirements
- Add practical details (what to bring, how long it takes)
- Update regularly as partnerships change

### ❌ Don't:
- Include client names or personal information
- Add staff personal phone numbers (use work contact only)
- Copy/paste confidential agreements
- Include information that would be outdated quickly

## JSON Syntax Quick Reference

**Important formatting rules:**

```json
{
  "key": "value",          // ✅ Correct: double quotes, comma after value
  "array": [               // Arrays for lists
    "item1",               // ✅ Comma after each item
    "item2",
    "item3"                // ❌ NO comma on last item
  ],
  "object": {              // Objects for structured data
    "name": "John",
    "phone": "555-1234"    // ❌ NO comma on last property
  }
}
```

**Common mistakes:**

```json
// ❌ WRONG
{
  'key': 'value',          // Single quotes not allowed
  "key": "value",          // Extra comma at end
}

// ✅ CORRECT
{
  "key": "value"           // No comma on last item
}
```

**Validate your JSON:**
- Use https://jsonlint.com to check for errors
- VS Code shows errors automatically
- The import script validates before saving

## Examples of What You Can Import

### From Spreadsheets

If you have data in Excel/Google Sheets:

1. Export as **Tab-separated values (.tsv)** or **CSV**
2. Put in `Treatment/` folder
3. Run import script (see Quick Start above)

### From Other Sources

You can import from:
- State/county resource directories
- 211 database exports
- United Way resource lists
- Healthcare provider networks
- Insurance provider directories

## Getting Help

**If JSON validation fails:**
1. Copy your JSON to https://jsonlint.com
2. It will show you exactly where the error is
3. Common issues: missing comma, extra comma, wrong quote type

**If import script fails:**
1. Check file is in `Treatment/` folder
2. Check file is tab-separated (not comma or space)
3. Check first row has column headers

**If changes don't appear:**
1. Verify file was saved
2. Check deployment completed on Vercel
3. Clear browser cache and refresh

## What's Next?

Now that your treatment providers are imported:

1. **Review** the imported data in `data/organizational-knowledge.json`
2. **Add notes** to providers you work with frequently
3. **Add best practices** for different crisis types
4. **Set up referral paths** for common needs
5. **Test** by generating a case plan with your ZIP code

The AI will now use all 244+ Nebraska treatment providers when making recommendations! 🎉
