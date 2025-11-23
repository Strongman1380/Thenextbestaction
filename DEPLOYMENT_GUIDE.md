# Deployment Guide: Next-Best-Action Coach

## 🚀 Deploy to Vercel (Recommended - 5 Minutes)

Vercel is the easiest way to deploy Next.js apps. It's free for small teams and includes:
- Automatic HTTPS
- Global CDN
- Zero-config deployment
- Automatic updates on git push

### Step-by-Step Instructions

#### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   cd "/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action"
   git init
   git add .
   git commit -m "Initial commit: Next-Best-Action Coach MVP"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Leave everything else default

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live!

#### Option 2: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "/Users/brandonhinrichs/Local Repositories/Apps/The Next Best Action"
   vercel
   ```

   Follow prompts:
   - Set up and deploy? **Y**
   - Scope: Select your account
   - Link to existing project? **N**
   - Project name: `next-best-action-coach`
   - Directory: `./`
   - Override settings? **N**

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup

1. **In Vercel Dashboard**
   - Go to Project Settings > Domains
   - Add your domain (e.g., `coach.nrsrecovery.org`)

2. **Update DNS Records**
   - Add CNAME record:
     - Name: `coach` (or `@` for root domain)
     - Value: `cname.vercel-dns.com`
   - Wait 5-10 minutes for propagation

3. **Verify SSL**
   - Vercel auto-provisions SSL certificate
   - Your site will be accessible via HTTPS

---

## 🐳 Alternative: Deploy with Docker

If your organization prefers self-hosting:

### Dockerfile
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Build & Run
```bash
docker build -t next-best-action .
docker run -p 3000:3000 next-best-action
```

---

## 🗄️ Database Upgrade (Optional - For Production)

The MVP uses localStorage for metrics. To scale:

### Option 1: Supabase (Free Tier Available)

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project

2. **Create Tables**
   ```sql
   CREATE TABLE action_logs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     timestamp TIMESTAMPTZ DEFAULT NOW(),
     action_id TEXT,
     urgency TEXT,
     crisis_type TEXT,
     completed BOOLEAN,
     feedback_score INT,
     feedback_notes TEXT
   );
   ```

3. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Update engine.ts**
   Replace localStorage calls with Supabase queries.

### Option 2: Firebase, MongoDB, or Postgres

Similar process—swap out `logAction()` and `getMetricsSummary()` in `/lib/engine.ts`.

---

## 🔐 Environment Variables

For production, add `.env.local`:

```bash
# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Database (if using Supabase/Firebase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Contact emails
NEXT_PUBLIC_SUPPORT_EMAIL=support@nrsrecovery.org
```

Add these in Vercel Dashboard → Settings → Environment Variables.

---

## 📊 Monitoring & Analytics

### Add Google Analytics (Optional)

1. **Create GA4 Property**
   - Visit [analytics.google.com](https://analytics.google.com)
   - Create measurement ID

2. **Install Package**
   ```bash
   npm install @next/third-parties
   ```

3. **Update layout.tsx**
   ```tsx
   import { GoogleAnalytics } from '@next/third-parties/google'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <GoogleAnalytics gaId="G-XXXXXXXXXX" />
         </body>
       </html>
     )
   }
   ```

### Error Tracking

Consider [Sentry](https://sentry.io) for production error monitoring:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🔄 Continuous Deployment

With Vercel + GitHub:
1. Every push to `main` auto-deploys to production
2. Pull requests create preview deployments
3. Rollback to previous deployments with one click

### Branch Strategy
- `main` → Production
- `develop` → Staging (set up separate Vercel project)
- `feature/*` → Preview deployments

---

## ✅ Pre-Launch Checklist

Before sharing with caseworkers:

- [ ] Test all 10 playbook scenarios
- [ ] Verify phone links work on mobile
- [ ] Update placeholder resource URLs with real NRS links
- [ ] Add NRS branding (logo, colors)
- [ ] Set up custom domain
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Train 2-3 pilot caseworkers
- [ ] Set up feedback collection process
- [ ] Document escalation procedures
- [ ] Review with clinical team for accuracy

---

## 🆘 Troubleshooting

### Build Errors
- Check Node.js version: `node -v` (should be 18+)
- Clear cache: `rm -rf .next node_modules && npm install`

### Deployment Fails
- Check build logs in Vercel dashboard
- Verify all imports are correct (case-sensitive on Linux)
- Ensure `next.config.js` has no syntax errors

### Metrics Not Saving
- Check browser console for localStorage errors
- Verify localStorage is enabled (private browsing disables it)
- For production, upgrade to database storage

---

## 📞 Support

**Technical Issues:**
- Vercel Support: [vercel.com/help](https://vercel.com/help)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)

**NRS-Specific:**
- Contact your development team
- Email: [your-email]

---

*Ready to deploy? You've got this. One click at a time.* 🚀
