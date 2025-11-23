# Next-Best-Action Coach 🤝

> **A trauma-informed decision support tool for Next Right Step Recovery caseworkers**

Compassion in the chaos. Accountability without shame. Hope that's practical, not pie-in-the-sky.

---

## 🎯 What It Does

The Next-Best-Action Coach helps caseworkers navigate the overwhelming complexity of recovery support by:

- **Simplifying Decision Fatigue**: Input a client situation → Get one clear, actionable next step
- **Providing Ready Scripts**: Trauma-informed, MI-style conversation starters
- **One-Tap Actions**: Direct links to call hotlines, schedule meetings, or send resources
- **Tracking Impact**: Anonymous metrics to improve program outcomes
- **Centering Compassion**: Every recommendation includes dignity-affirming language and spiritual integration

This isn't AI hype—it's a rules-based playbook system codifying NRS's best practices for consistent, quality care.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A code editor (VS Code recommended)

### Local Development

1. **Install dependencies**
   ```bash
   cd "/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action"
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Add your API keys to .env.local:
   # - OPENAI_API_KEY (required - from https://platform.openai.com/api-keys)
   # - TWO_ONE_ONE_API_KEY (optional - from https://apiportal.211.org/)
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📦 Deployment (Vercel - 5 Minutes)

1. **Create Vercel account** at [vercel.com](https://vercel.com) (free tier works)

2. **Install Vercel CLI** (optional, but helpful)
   ```bash
   npm i -g vercel
   ```

3. **Deploy from this directory**
   ```bash
   vercel
   ```
   Follow the prompts—it will auto-detect Next.js and deploy instantly.

4. **Set up domain** (optional)
   - Go to your Vercel dashboard
   - Add a custom domain like `coach.nrsrecovery.org`
   - Update your DNS records as instructed

**That's it!** Your app is live and ready for caseworkers to use.

---

## 🧩 How It Works

### The Decision Engine

```
User Input (Crisis Type + Urgency + ZIP Code)
    ↓
AI Case Plan Generation (OpenAI GPT-4o-mini)
    ↓
211 API Resource Search (or AI Fallback)
    ↓
Comprehensive Case Plan with Local Resources
    ↓
Action Card (Steps + Resources + Risk Assessment)
    ↓
Metrics Logged for Improvement
```

**Core Files:**
- `/app/api/generate-plan/route.ts` - API integration (OpenAI + 211)
- `/app/page.tsx` - Two-tab interface (Case Plan + Skill Building)
- `/components/CaseInputForm.tsx` - Input form with ZIP code
- `/components/CasePlanCard.tsx` - Case plan display

### 211 API Integration ✅ WORKING

The app is **fully integrated** with the **211 National Data Platform Search V2 API** to provide real-time, location-based social service resources:

- ✅ **LIVE & VERIFIED**: Successfully tested with 211 Nebraska database
- ✅ **Real Resources**: Returns actual organizations (Habitat for Humanity, Community Action, etc.)
- ✅ **ZIP Code Based**: Searches within 25-mile radius, sorted by distance
- ✅ **Comprehensive Data**: Organization names, services, addresses, descriptions
- ✅ **AI Fallback**: Generates realistic local resources when 211 API is unavailable
- ✅ **Production Ready**: Deployed and ready for caseworkers to use

**Integration Details**: See [211_INTEGRATION_COMPLETE.md](211_INTEGRATION_COMPLETE.md) for full documentation

**Test the Integration**:
```bash
node test-211-api.js
# Returns 7+ real resources from 211 database
```

**Example Output** (Housing assistance, ZIP 68901):
- Maryland Living Center - Residential Housing
- Hastings Area Habitat For Humanity - Housing Services
- Midland Area Agency On Aging - Resource Center
- *...and 4 more verified organizations*

### The Playbook Structure

Each playbook includes:
- **Triggers**: Crisis type + urgency level
- **Action**: Clear next step (e.g., "Call Crisis Hotline")
- **Script**: Trauma-informed talking points with placeholders
- **Resource Link**: Phone number, URL, or scheduling link
- **Rationale**: Why this step matters
- **Compassion Note**: Dignity-affirming message

---

## 🎨 Customization for NRS

### 1. Add More Playbooks

Edit `/data/playbooks.json` to include:
- Women's/men's-specific scenarios
- Seasonal needs (holidays, triggers)
- Co-occurring conditions (trauma + substance use)
- Regional resources (by ZIP code)

**Example: Adding a new playbook**
```json
{
  "id": "trauma-anniversary",
  "domain": "Trauma Support",
  "triggers": {
    "crisis_type": "trauma_trigger",
    "urgency": "medium"
  },
  "action": "Share Grounding Technique",
  "script": "Try this when the past feels present: 5-4-3-2-1 grounding. Name 5 things you see, 4 you touch...",
  "resource_link": "https://nrsrecovery.org/grounding",
  "resource_label": "Learn More",
  "button_type": "link",
  "rationale": "Grounding techniques create safety in the moment without re-traumatization.",
  "compassion_note": "Your body remembers—and it can heal. One breath at a time."
}
```

### 2. Update NRS Branding

- **Colors**: Edit `tailwind.config.js` to match NRS brand palette
- **Logo**: Add to `/public` and update `Header.tsx`
- **Messaging**: Customize `CompassionFooter.tsx` with NRS-specific language

### 3. Integrate Real Resources

Replace placeholder links in playbooks:
- SAMHSA hotline: Already set (`tel:+18006624357`)
- Peer circles: Link to your Calendly or booking system
- Shelters: Update with actual local partner orgs
- Devotionals: Point to NRS content library

### 4. Add ZIP Code Resource Matching (Future)

Create `/data/resources-by-zip.json`:
```json
{
  "60601": {
    "shelter": "https://chicago-shelter.org",
    "crisis_hotline": "tel:+13125551234"
  }
}
```

Update `engine.ts` to filter playbooks by location.

---

## 📊 Metrics & Insights

### What's Tracked
- Total actions suggested
- Completion rate (% of actions followed through)
- Average helpfulness score (1-5 rating)
- Breakdown by urgency level

### Viewing Metrics
Navigate to `/metrics` in the app to see dashboard.

**Data Storage (MVP):**
- Client-side localStorage (anonymous, per-device)
- No server required

**For Production:**
- Upgrade to Supabase, Firebase, or Postgres
- Add user authentication for multi-user teams
- Export CSV reports for program evaluation

---

## 🔒 Privacy & Ethics

### What This Tool Does NOT Do
- Store identifiable client information
- Make clinical diagnoses
- Replace professional judgment
- Track individual caseworker performance punitively

### Best Practices
- **Always** include supervisor escalation option
- **Always** prompt caseworkers to trust their intuition
- **Never** use metrics to shame or pressure staff
- **Regularly** review playbooks with clinical team to ensure quality

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (or any Node.js host)
- **Data**: JSON files (upgrade to DB as needed)

---

## 🌱 Roadmap: From MVP to Full Platform

### Phase 1: MVP (Complete ✅)
- 10 playbooks
- Rules-based matching
- Basic metrics
- Vercel deployment

### Phase 2: Expanded Playbooks (Next 2-4 weeks)
- 20-30 scenarios covering full NRS case spectrum
- ZIP code resource integration
- Gender-specific pathways
- Seasonal/holiday support

### Phase 3: Enhanced Metrics (Month 2)
- Multi-user authentication
- Team dashboards
- CSV export for program evaluation
- A/B testing different scripts

### Phase 4: AI-Assisted (Optional, Month 3+)
- GPT-4 integration for script personalization
- Sentiment analysis on client interactions
- Predictive risk modeling (with strict ethical oversight)

---

## 📖 Learning Resources

### For Developers
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

### For Caseworkers
- Motivational Interviewing (MI) techniques
- Trauma-Informed Care principles
- SAMHSA resources: [samhsa.gov](https://www.samhsa.gov)

---

## 🤲 Philosophy

This tool embodies Next Right Step Recovery's core values:

> **"Progress over perfection. Hope that's practical, not pie-in-the-sky."**

Every feature is designed to:
- **Reduce burnout** through clear guidance
- **Honor dignity** with compassionate language
- **Build connection** between caseworker and client
- **Sustain hope** with faith-integrated support

This isn't about automation—it's about amplifying the human heart of recovery work.

---

## 📞 Support & Feedback

**For technical issues:**
- Open an issue in this repository
- Email: [your-dev-email]

**For content/playbook suggestions:**
- Contact NRS clinical team
- Submit feedback via in-app form

---

## 📄 License

This tool is built for Next Right Step Recovery. All rights reserved.

For licensing inquiries, contact NRS leadership.

---

## 🙏 Acknowledgments

Built with love for the caseworkers who show up every day in the mess, holding space for dignity and transformation.

**One step. One call. One script at a time.**

---

*"This step honors progress—one breath at a time."*
