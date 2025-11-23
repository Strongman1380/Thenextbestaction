# Vercel Deployment Guide

This guide will walk you through deploying the Next Best Action Coach to Vercel.

---

## Prerequisites

- GitHub account (already set up ✅)
- Vercel account (free tier works perfectly)
- Your API keys ready:
  - OpenAI API Key (required)
  - 211 Search API Key (optional but recommended)

---

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" for easy integration
4. Authorize Vercel to access your GitHub account

---

## Step 2: Deploy from GitHub

### Option A: Using Vercel Dashboard (Easiest)

1. **Log in to Vercel Dashboard**
   - Go to https://vercel.com/dashboard

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find and select: `Strongman1380/Thenextbestaction`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

4. **Add Environment Variables** (CRITICAL!)

   Click "Environment Variables" and add:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `OPENAI_API_KEY` | `your_openai_api_key_here` | Production, Preview, Development |
   | `TWO_ONE_ONE_API_KEY` | `your_211_api_key_here` | Production, Preview, Development |

   **IMPORTANT**: Select all three environments (Production, Preview, Development) for each variable.

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://thenextbestaction.vercel.app`

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   cd "/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action"
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - What's your project's name? `thenextbestaction`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Add Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   # Paste your OpenAI API key from .env.local
   # Select: Production, Preview, Development (all three)

   vercel env add TWO_ONE_ONE_API_KEY
   # Paste your 211 API key from .env.local
   # Select: Production, Preview, Development (all three)
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Deployment

1. **Visit Your App**
   - Your app will be at: `https://thenextbestaction.vercel.app`
   - Or your custom URL if configured

2. **Test All Features**
   - ✅ Case Plan Generator
   - ✅ Worker Skills
   - ✅ Client Resources
   - ✅ 211 API Integration

3. **Test Case Plan with 211 Resources**
   - Go to "Case Plan" tab
   - Enter: "housing assistance"
   - ZIP: "68901"
   - Urgency: "High"
   - Generate plan
   - Verify you see real 211 resources (Maryland Living Center, Habitat for Humanity, etc.)

---

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Enter your domain: `coach.nrsrecovery.org`
   - Click "Add"

2. **Update DNS Records**
   Vercel will provide DNS records to add to your domain registrar:
   - Type: `CNAME`
   - Name: `coach`
   - Value: `cname.vercel-dns.com`

3. **Wait for Propagation**
   - DNS changes take 5 minutes to 48 hours
   - Vercel will automatically provision SSL certificate

---

## Environment Variables Reference

### Required

**OPENAI_API_KEY**
- **Purpose**: AI-powered case plan generation
- **Get from**: https://platform.openai.com/api-keys
- **Value**: Copy from your `.env.local` file

### Optional (Highly Recommended)

**TWO_ONE_ONE_API_KEY**
- **Purpose**: Real-time local resource lookup from 211 database
- **Get from**: https://apiportal.211.org/
- **Value**: Copy from your `.env.local` file
- **Fallback**: If not set, AI will generate realistic local resources

---

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:

- ✅ Deploy every push to `main` branch (Production)
- ✅ Create preview deployments for pull requests
- ✅ Run builds and tests before deployment
- ✅ Show deployment status in GitHub

**To trigger a new deployment:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically detect the push and deploy within 2-3 minutes.

---

## Build Configuration

Your project is configured with:

**Framework**: Next.js 14
**Node Version**: 20.x (auto-detected)
**Build Command**: `npm run build`
**Install Command**: `npm install`
**Output Directory**: `.next`

These are automatically detected from your `package.json` and `next.config.js`.

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- **Solution**: Add `OPENAI_API_KEY` in Vercel dashboard → Project Settings → Environment Variables

**Error: Module not found**
- **Solution**: Run locally first: `npm install && npm run build`
- Check for missing dependencies in `package.json`

### 211 API Not Working

**Symptom**: Case plans don't show real 211 resources
- **Check**: Environment variable `TWO_ONE_ONE_API_KEY` is set
- **Check**: Variable is set for "Production" environment
- **Fallback**: AI will generate realistic resources if API key missing

### App Shows 404

**Symptom**: Main page shows 404 error
- **Check**: Build completed successfully in Vercel logs
- **Check**: `app/page.tsx` exists in repository
- **Solution**: Redeploy from Vercel dashboard

---

## Monitoring & Analytics

Vercel provides built-in monitoring:

1. **Deployment Logs**
   - View build logs: Project → Deployments → Click deployment → "Building"

2. **Runtime Logs**
   - View API errors: Project → Deployments → Click deployment → "Functions"

3. **Analytics** (Free tier includes basic analytics)
   - Page views
   - Top pages
   - Top referrers

---

## Security Best Practices

✅ **Environment Variables**: Never commit API keys to Git (`.env.local` is gitignored)

✅ **HTTPS**: Vercel automatically provides SSL for all deployments

✅ **API Routes**: All API routes are server-side only (not exposed to client)

✅ **Rate Limiting**: Consider adding rate limiting for production use

---

## Cost Estimate

**Vercel Free Tier** (Hobby Plan):
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Analytics (basic)
- ✅ **FREE** for this use case

**OpenAI API Costs**:
- Model: GPT-4o-mini
- Cost per case plan: ~$0.0015
- 1,000 case plans/month: ~$1.50
- Very affordable for case management use

**211 API**:
- Free tier should cover most usage
- Check https://apiportal.211.org/ for limits

---

## Production Checklist

Before going live with caseworkers:

- [ ] Deployed to Vercel successfully
- [ ] All 3 tabs working (Case Plan, Worker Skills, Client Resources)
- [ ] 211 API returning real resources (test with ZIP 68901)
- [ ] Custom domain configured (if desired)
- [ ] Caseworkers trained on how to use the tool
- [ ] Backup plan if API fails (AI fallback is built-in)
- [ ] Monitor OpenAI usage/costs
- [ ] Set up error monitoring (Vercel logs)

---

## Support & Updates

**Update the App:**
```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main
# Vercel auto-deploys in 2-3 minutes
```

**Check Deployment Status:**
- Dashboard: https://vercel.com/dashboard
- Project URL: https://vercel.com/strongman1380/thenextbestaction

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- OpenAI Docs: https://platform.openai.com/docs

---

## Quick Deploy Command

**One-command deployment** (if Vercel CLI installed):
```bash
cd "/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action"
vercel --prod
```

That's it! Your Next Best Action Coach will be live and ready for caseworkers to use! 🚀
