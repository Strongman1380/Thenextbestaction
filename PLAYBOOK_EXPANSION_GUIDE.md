# Playbook Expansion Guide

This guide helps NRS clinical staff and developers add new scenarios to the Next-Best-Action Coach.

---

## 🎯 Overview

The coach uses **playbooks**—pre-written decision trees that match client situations to specific actions. Each playbook includes:
- **Triggers**: When to use this playbook (crisis type + urgency)
- **Action**: What the caseworker should do
- **Script**: Trauma-informed talking points
- **Resource**: Link to call, schedule, or read
- **Rationale**: Why this step matters
- **Compassion Note**: Dignity-affirming message

---

## 📋 Current Playbooks (MVP - 10)

1. Acute Crisis - Withdrawal
2. Isolation/Loneliness
3. Family Conflict
4. Relapse Risk
5. Housing Instability
6. Mental Health (Co-Occurring)
7. Employment Barrier
8. Spiritual Disconnect
9. Re-Entry Support
10. Follow-Up Check-In

**Goal**: Expand to 20-30 playbooks covering the full spectrum of NRS cases.

---

## 🔧 How to Add a New Playbook

### Step 1: Identify the Need

Answer these questions:
- What client situation is not covered by existing playbooks?
- How often does this situation occur? (High frequency = high priority)
- What's the best next step when this happens?
- What resources do we have for this scenario?

### Step 2: Draft the Playbook

Use this template:

```json
{
  "id": "unique-identifier-kebab-case",
  "domain": "Category Name",
  "triggers": {
    "crisis_type": "crisis_key",
    "urgency": "low|medium|high"
  },
  "action": "Clear, Actionable Step",
  "script": "Trauma-informed script with [placeholders]",
  "resource_link": "tel:+1XXX or https://...",
  "resource_label": "Button text",
  "button_type": "call|text|schedule|link",
  "rationale": "Why this step matters (clinical reasoning)",
  "compassion_note": "Dignity-affirming message for caseworker"
}
```

### Step 3: Add to `/data/playbooks.json`

1. Open the file in your code editor
2. Add your new playbook to the array (copy-paste the template above)
3. Save the file
4. Test in the app (select your new crisis type + urgency)

### Step 4: Update Crisis Type List (If New Category)

If you're adding a **new crisis type** (not just a variation of an existing one):

1. Open `/types/index.ts`
2. Add your crisis type to the `CrisisType` union:
   ```typescript
   export type CrisisType =
     | 'withdrawal'
     | 'isolation'
     // ... existing types
     | 'your_new_type'; // Add here
   ```

3. Open `/lib/engine.ts`
4. Add to `getCrisisTypes()` function:
   ```typescript
   { value: 'your_new_type', label: 'Display Name for Form' }
   ```

---

## 📚 Playbook Examples

### Example 1: Trauma Anniversary Trigger

```json
{
  "id": "trauma-anniversary",
  "domain": "Trauma Support",
  "triggers": {
    "crisis_type": "trauma_trigger",
    "urgency": "medium"
  },
  "action": "Share Grounding Technique",
  "script": "When the past feels present, try this: 5-4-3-2-1 grounding. Name 5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste. Let's walk through it together if you'd like.",
  "resource_link": "https://nrsrecovery.org/grounding-techniques",
  "resource_label": "Learn Grounding Techniques",
  "button_type": "link",
  "rationale": "Grounding techniques create safety in the moment without re-traumatization. Engages the present senses to counter flashback states.",
  "compassion_note": "Your body remembers trauma—and it can heal. This moment of presence is powerful."
}
```

### Example 2: Women's Program - Gender-Specific Trauma

```json
{
  "id": "womens-program-domestic-violence",
  "domain": "Women's Recovery Support",
  "triggers": {
    "crisis_type": "domestic_violence",
    "urgency": "high"
  },
  "action": "Connect to Domestic Violence Hotline",
  "script": "Your safety comes first. The National DV Hotline is available 24/7—they're trauma-informed, confidential, and ready to help you create a safety plan. I'm here to support whatever you decide.",
  "resource_link": "tel:+18007997233",
  "resource_label": "Call National DV Hotline",
  "button_type": "call",
  "rationale": "Immediate safety planning is critical. Hotline counselors are trained in lethality assessment and can coordinate with local shelters.",
  "compassion_note": "Leaving is the hardest—and bravest—step. You deserve safety, dignity, and peace."
}
```

### Example 3: Holiday Trigger Support

```json
{
  "id": "holiday-trigger-support",
  "domain": "Seasonal Support",
  "triggers": {
    "crisis_type": "holiday_stress",
    "urgency": "medium"
  },
  "action": "Book Extra Peer Circle Session",
  "script": "Holidays can be tough when you're in recovery. Let's add an extra circle session this week—a space to share honestly without the pressure of 'perfect family moments.' You're not alone in this.",
  "resource_link": "https://calendly.com/nrs-holiday-support",
  "resource_label": "Schedule Holiday Support Circle",
  "button_type": "schedule",
  "rationale": "Holidays are high-risk for relapse due to family triggers, isolation, and societal pressure. Extra support normalizes difficulty and reduces shame.",
  "compassion_note": "The holidays don't define your worth. Your progress matters more than any calendar."
}
```

---

## 🧩 Advanced: Multi-Factor Playbooks (Future)

For complex cases, you might want playbooks that consider multiple factors:

### Concept: Layered Triggers
```json
{
  "id": "relapse-plus-housing-crisis",
  "triggers": {
    "crisis_type": "relapse_risk",
    "urgency": "high",
    "secondary_factors": ["housing_instability"],
    "location": "urban"
  },
  "action": "Coordinate Immediate Shelter + Sponsor Check-In",
  "script": "Let's tackle both: I'm calling [Shelter Name] for emergency housing while we connect you with your sponsor. You don't have to choose between safety and sobriety—we're doing both.",
  // ... rest of playbook
}
```

To implement this, update `engine.ts` to check `secondary_factors` array.

---

## 📊 Prioritization Framework

When deciding which playbooks to add next, use this scoring:

| Factor | Weight | Score (1-5) |
|--------|--------|-------------|
| **Frequency** (How often does this situation occur?) | 3x | ___ |
| **Severity** (How urgent/dangerous is it?) | 2x | ___ |
| **Gap** (How poorly do existing playbooks cover it?) | 2x | ___ |
| **Resource Availability** (Do we have partners for this?) | 1x | ___ |

**Total Score** = (Frequency × 3) + (Severity × 2) + (Gap × 2) + (Resources × 1)

Focus on playbooks scoring 20+.

---

## ✅ Quality Checklist

Before adding a playbook, ensure:

- [ ] **Trauma-Informed**: Language avoids blame, centers client agency
- [ ] **Actionable**: Caseworker knows exactly what to do next
- [ ] **Resource-Linked**: Direct link to hotline, booking, or PDF
- [ ] **Compassionate**: Includes dignity-affirming note
- [ ] **Tested**: Reviewed by clinical team for safety/accuracy
- [ ] **Accessible**: Works on mobile devices (phone links tested)
- [ ] **Consistent**: Follows NRS voice and values

---

## 🎨 Script Writing Guidelines

### Do's
✅ Use first-person ("I'm here to help")
✅ Include placeholders (`[Client Name]`, `[Symptom]`)
✅ Offer choice ("Would you like to..." not "You should...")
✅ Normalize struggle ("This is hard—and normal")
✅ Keep it brief (2-3 sentences max)

### Don'ts
❌ Use clinical jargon ("maladaptive coping")
❌ Make promises ("This will fix everything")
❌ Assume motivation ("I know you want to change")
❌ Shame or pressure ("You need to...")
❌ Overcomplicate (keep it conversational)

### Motivational Interviewing Integration

Incorporate MI principles:
- **Open questions**: "What feels most pressing for you right now?"
- **Affirmation**: "It took courage to share this with me."
- **Reflection**: "It sounds like you're feeling torn between..."
- **Summary**: "So far, we've talked about..."

---

## 🚀 Deployment Process

### For Developers
1. Edit `/data/playbooks.json`
2. Test locally: `npm run dev`
3. Verify new scenario appears in form dropdown
4. Test recommendation flow end-to-end
5. Commit and push to GitHub
6. Vercel auto-deploys in ~2 minutes

### For Clinical Staff (Non-Coders)
1. Draft playbook in this format (Google Doc or email)
2. Send to development team
3. They'll add it and notify you when live
4. Test and provide feedback

---

## 📖 Suggested Next Playbooks (20-30 Total)

### High Priority
- [ ] Domestic violence (women's program)
- [ ] Child custody issues
- [ ] Medication-assisted treatment (MAT) support
- [ ] Grief/loss in recovery
- [ ] Legal issues (warrants, court dates)
- [ ] Transportation barriers
- [ ] Medical crisis (non-substance-related)
- [ ] Peer conflict resolution
- [ ] Financial crisis (eviction, debt)
- [ ] Faith community reintegration

### Medium Priority
- [ ] Holiday triggers (Thanksgiving, Christmas, New Year's)
- [ ] Parenting skills support
- [ ] Vocational training referral
- [ ] Mental health medication adherence
- [ ] Nutrition/food insecurity
- [ ] Exercise/physical wellness
- [ ] Creative expression (art/music therapy)
- [ ] Men's program-specific issues
- [ ] LGBTQ+ affirming support
- [ ] Cultural/linguistic barriers

---

## 🤲 Final Reminder

Every playbook you add is a lifeline. These aren't just scripts—they're compassion codified, wisdom shared, and hope multiplied.

**One step. One call. One script at a time.**

---

*Need help adding playbooks? Contact your development team or email [support email].*
