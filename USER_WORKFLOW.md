# User Workflow: How Caseworkers Will Use This Tool

A step-by-step walkthrough of the caseworker experience.

---

## 🎯 The Core Flow

```
Caseworker has client situation
         ↓
Opens Next-Best-Action Coach
         ↓
Fills out quick form (30 seconds)
         ↓
Gets personalized recommendation
         ↓
Takes action (call/text/schedule)
         ↓
Shares feedback (optional)
         ↓
Metrics improve the tool for everyone
```

---

## 📱 Step-by-Step Walkthrough

### Step 1: Access the Tool

**Desktop**: Navigate to coach.nrsrecovery.org (or your domain)
**Mobile**: Same URL, optimized for mobile
**Bookmark**: Add to home screen for quick access

**Time**: 2 seconds

---

### Step 2: Case Context Input

The caseworker sees a clean form with these fields:

#### Required Fields

**1. What's the primary need right now?**
- Dropdown with 10 options:
  - Acute Crisis - Withdrawal/Overdose
  - Isolation/Loneliness
  - Family Conflict
  - Relapse Risk
  - Housing Instability
  - Mental Health (Co-Occurring)
  - Employment Barrier
  - Spiritual Disconnect
  - Re-Entry Support
  - Follow-Up Check-In

**Example**: Caseworker selects "Relapse Risk"

**2. How urgent is this situation?**
- Three buttons with visual indicators:
  - 🟢 Low - Ongoing support needed
  - 🟡 Medium - Needs attention soon
  - 🔴 High - Immediate safety concern

**Example**: Caseworker clicks 🔴 High

#### Optional Fields (For Personalization)

**3. Client Initials** (e.g., "J.D.")
- Personalizes the script
- Never stored or tracked

**4. Your Name** (e.g., "Sarah")
- Makes the script feel more natural
- Encourages relationship-building language

**5. ZIP Code** (e.g., "60601")
- Future: Will filter to local resources
- Currently informational only

**6. Additional Context** (free text)
- Any other details that might help
- Not currently used in matching, but helpful for caseworker notes

**Time to complete**: 30-45 seconds

---

### Step 3: Get Recommendation

Caseworker clicks **"Get Next-Best-Action"**

**What happens**:
1. Brief loading spinner appears (300ms)
2. Form slides away
3. Action card appears with recommendation

**Time**: Under 1 second

---

### Step 4: Review the Recommendation

The caseworker sees a clean card with these sections:

#### A. Domain Badge
```
╔════════════════════╗
║ Relapse Prevention ║  ← Color-coded by domain
╚════════════════════╝
```

#### B. Action Title
```
Connect with Sponsor/Accountability Partner
```

#### C. Why This Step? (Rationale)
```
┌────────────────────────────────────────┐
│ Motivational interviewing lite;        │
│ reminds them 'You're not alone in     │
│ this moment.'                          │
└────────────────────────────────────────┘
```

#### D. Your Script (Copy-to-Clipboard)
```
┌─────────────────────────────────────────┐
│ Quick grace note: 'One day at a time—   │
│ I'm here if you need to talk, vent, or │
│ just breathe.' Plan to follow up       │
│ tomorrow.                               │
│                                         │
│              [📋 Copy Script]           │
└─────────────────────────────────────────┘
```

**Interaction**: Click "📋 Copy" to copy script to clipboard
**UX**: Button changes to "✓ Copied!" for 2 seconds

#### E. One-Tap Action Button
```
┌────────────────────────────────────────┐
│     💬  Text Sponsor                   │  ← Big, tappable button
└────────────────────────────────────────┘
```

**On Mobile**: Opens SMS app with pre-filled number
**On Desktop**: Opens default texting app or shows number

#### F. Compassion Note
```
┌────────────────────────────────────────┐
│ 💜 Relapse risk is a signal, not a    │
│    failure. This reach-out is courage. │
└────────────────────────────────────────┘
```

**Purpose**: Reminds caseworker this is about connection, not compliance

---

### Step 5: Take Action

Caseworker has three options:

**Option A: Follow the recommendation**
- Click the action button (call/text/schedule)
- Complete the action with client
- Come back to give feedback

**Option B: Use the script differently**
- Copy the script
- Adapt it to their style
- Use in person or via different channel

**Option C: Escalate**
- If situation feels too complex
- Trust intuition (tool reminds them to do this)
- Contact supervisor

**Average time**: 2-5 minutes for the action itself

---

### Step 6: Pause for Intuition

Below the action card, caseworker sees:

```
┌────────────────────────────────────────┐
│ 🤲 Pause for Your Intuition            │
│                                         │
│ This tool offers guidance, but your    │
│ relationship with the client and your  │
│ professional wisdom matter most. If    │
│ something feels off or you need        │
│ support, reach out to your supervisor  │
│ or clinical team.                      │
└────────────────────────────────────────┘
```

**Purpose**:
- Prevents over-reliance on the tool
- Centers human judgment
- Normalizes asking for help

---

### Step 7: Share Feedback (Optional)

Caseworker clicks **"Share Feedback"**

Modal appears with three questions:

**1. Did you follow through with this action?**
- [ ] Yes
- [ ] Not Yet

**2. How helpful was this guidance? (1-5)**
- Buttons: 1 | 2 | 3 | 4 | 5

**3. Any additional thoughts?** (optional text)
- "What worked? What could be better?"

Click **"Submit Feedback"** → Success message → Modal closes

**Time**: 15-30 seconds
**Impact**: Improves recommendations for the whole team

---

### Step 8: New Case Assessment

When ready for next client:

Click **"New Case Assessment"** button

Form reappears, ready for next situation.

**Time**: 1 second

---

## 📊 Metrics Dashboard (Admin/Supervisor View)

Supervisors can navigate to `/metrics` to see:

### Summary Cards
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Total Actions    │  │ Completion Rate  │  │ Avg. Score       │
│                  │  │                  │  │                  │
│      127         │  │      84%         │  │    4.2 / 5       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Actions by Urgency
```
High   ███████████████████░░ 45 (35%)
Medium ████████████████████████ 58 (46%)
Low    ████████░░░░░░░░░░░ 24 (19%)
```

**Purpose**:
- Track usage patterns
- Identify high-frequency scenarios
- Celebrate wins (completion rate, helpfulness scores)
- Inform training needs

**Privacy**: No individual caseworker or client data shown

---

## 🎨 Visual Design Principles

### Color Coding
- **Blue** (nrs-blue): Primary actions, trust
- **Green** (nrs-hope): Success, completion, growth
- **Orange** (nrs-warmth): Resources, warmth, connection
- **Purple** (nrs-compassion): Compassion notes, spiritual elements
- **Red/Yellow/Green**: Urgency levels (universal traffic light metaphor)

### Typography
- **Headlines**: Bold, clear, scannable
- **Scripts**: Italic, conversational, easy to read aloud
- **Rationale**: Small but readable, provides "why"
- **Compassion notes**: Distinctive styling (italic, indented, icon)

### Layout
- **Mobile-first**: Everything fits on phone screen
- **Single-column**: No side-by-side comparisons (reduces cognitive load)
- **Generous spacing**: Breathing room between sections
- **Clear CTAs**: Big buttons, obvious next steps

---

## 🧠 Decision-Making Support

### What the Tool Provides
✅ Clear next step (reduces decision paralysis)
✅ Evidence-based script (reduces script anxiety)
✅ Direct resource link (reduces search time)
✅ Rationale (builds caseworker competence)
✅ Compassion note (reduces burnout, reminds of purpose)

### What the Tool Does NOT Provide
❌ Clinical diagnosis
❌ Replacement for supervision
❌ Every possible scenario (only common patterns)
❌ Guarantee of outcomes

---

## 🔄 Common Workflows

### Workflow 1: Crisis Call
1. Client calls in distress
2. Caseworker opens coach on phone
3. Selects "Acute Crisis - Withdrawal" + High urgency
4. Gets hotline number instantly
5. Three-way call with client and hotline
6. Logs completion after

**Impact**: Saves 2-3 minutes of searching for number, reduces panic

---

### Workflow 2: Weekly Check-In
1. Caseworker prepares for client meeting
2. Opens coach before session
3. Selects "Follow-Up Check-In" + Low urgency
4. Reads script, adapts to client's story
5. Uses as conversation starter
6. Builds trust through consistency

**Impact**: Standardizes quality of care, reduces prep anxiety

---

### Workflow 3: Team Meeting
1. Supervisor opens metrics dashboard
2. Shows completion rate: 84% (above 80% target!)
3. Discusses high-urgency patterns (45% of cases)
4. Team brainstorms: "Do we need more crisis training?"
5. Decision: Add 3 new crisis playbooks

**Impact**: Data-informed program improvement

---

## 💬 Caseworker Testimonials (Anticipated)

> "I used to spend 10 minutes Googling resources. Now I get it in 10 seconds."

> "The compassion notes remind me why I do this work—especially on hard days."

> "I love that it doesn't tell me what to say word-for-word. It gives me a starting point, and I make it mine."

> "My supervisor said our follow-up rates went up 20% since we started using this. That's real impact."

---

## 🚀 Onboarding New Caseworkers

### 5-Minute Training Script

**Trainer**: "This is the Next-Best-Action Coach. It helps when you're not sure what to do next with a client."

**Demo**:
1. "Let's say you have a client at risk of relapse. Click here, select 'Relapse Risk,' mark it high urgency."
2. "Hit this button. See? It tells you to connect with their sponsor, gives you a script, and a text button."
3. "You can copy the script, adapt it, use it however fits your style."
4. "After, click 'Share Feedback' so we keep improving this tool."

**Q&A**: "What if the situation is more complex than the options?"
**Answer**: "Trust your gut. Use the tool as a starting point, but you're the expert on your client. Always talk to your supervisor if you're unsure."

**Homework**: "Try it with your next three clients and tell me how it goes."

---

## 📈 Success Metrics (6-Month Goals)

| Metric | Baseline | 6-Month Goal |
|--------|----------|--------------|
| Weekly Active Users | 0 | 15 caseworkers |
| Average Actions/Week | 0 | 50+ |
| Completion Rate | N/A | 80%+ |
| Helpfulness Score | N/A | 4.0+/5.0 |
| Time to First Action | N/A | < 2 min average |
| Supervisor Escalations | N/A | Track (not reduce—we want healthy escalation) |

---

## 🎯 The Big Picture

This tool isn't about replacing caseworkers—it's about **amplifying their impact**.

Every minute saved searching for resources is a minute spent connecting with a client.

Every moment of clarity reduces burnout.

Every compassion note reminds: **This work matters.**

---

*"One step. One call. One script at a time."*

**This is how we scale compassion.** 🤲
