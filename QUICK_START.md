# Quick Start: Test Your App Right Now! 🚀

The Next-Best-Action Coach is **running live** on your machine right now!

---

## ✅ Status Check

Your development server is running at:
👉 **http://localhost:3000**

Click that link or open it in your browser to see your app.

---

## 🎮 How to Test the App

### Test Scenario 1: Acute Crisis (High Urgency)

1. **Open** http://localhost:3000
2. **Select**: "Acute Crisis - Withdrawal/Overdose"
3. **Set Urgency**: High (🔴)
4. **Optional**: Add client initials "J.D." and your name "Brandon"
5. **Click**: "Get Next-Best-Action"

**Expected Result:**
- Action: "Call Crisis Hotline"
- Script personalized with your name and client initials
- Button: "📞 SAMHSA National Helpline" (will dial when clicked on mobile)
- Compassion note about honoring agency

### Test Scenario 2: Isolation (Medium Urgency)

1. **Refresh** the page or click "New Case Assessment"
2. **Select**: "Isolation/Loneliness"
3. **Set Urgency**: Medium (🟡)
4. **Click**: "Get Next-Best-Action"

**Expected Result:**
- Action: "Book Peer Support Meetup"
- Script about NRS circle
- Button: "📅 Schedule Peer Circle"
- Message about connection building

### Test Scenario 3: Follow-Up (Low Urgency)

1. **New case**
2. **Select**: "Follow-Up Check-In"
3. **Set Urgency**: Low (🟢)
4. **Click**: "Get Next-Best-Action"

**Expected Result:**
- Action: "Send Gentle Check-In Message"
- Text message template
- Button: "💬 Send Check-In Text"

---

## 🧪 Testing Checklist

Go through each of these to verify everything works:

### Basic Functionality
- [ ] Form loads without errors
- [ ] All 10 crisis types appear in dropdown
- [ ] Urgency buttons toggle (green/yellow/red)
- [ ] Optional fields accept text
- [ ] "Get Next-Best-Action" button works
- [ ] Loading spinner appears briefly
- [ ] Action card displays correctly

### Action Cards
- [ ] Domain badge shows (colored pill at top)
- [ ] "Why this step?" rationale appears
- [ ] Script is readable and formatted
- [ ] Copy button works (test by clicking "📋 Copy")
- [ ] Action button has correct icon (📞/💬/📅/🔗)
- [ ] Compassion note appears at bottom
- [ ] "Pause for Your Intuition" card displays

### Personalization
- [ ] Client initials appear in script when entered
- [ ] Caseworker name appears in script when entered
- [ ] Placeholders remain if fields left empty

### Feedback System
- [ ] "Share Feedback" button opens modal
- [ ] "Yes/Not Yet" buttons toggle
- [ ] 1-5 rating buttons work
- [ ] Text area accepts notes
- [ ] "Submit Feedback" shows success message
- [ ] Modal closes after submission

### Metrics Dashboard
- [ ] Navigate to http://localhost:3000/metrics
- [ ] See "0" for all metrics (fresh install)
- [ ] Go back to home and submit 2-3 actions
- [ ] Refresh metrics page
- [ ] Numbers update correctly
- [ ] Urgency breakdown chart appears

### Mobile Responsiveness
- [ ] Open on phone or resize browser to mobile width
- [ ] Form is usable (no horizontal scroll)
- [ ] Buttons are tap-friendly (not too small)
- [ ] Cards stack vertically
- [ ] Text is readable without zooming

---

## 🔍 What to Look For

### Good Signs ✅
- Clean, professional design
- Easy to understand what to do next
- Compassionate tone throughout
- Fast loading (< 2 seconds)
- No console errors (check browser DevTools)

### Issues to Watch For ❌
- Broken layouts on mobile
- Placeholder text (e.g., `[Your Name]` not replaced)
- 404 errors when clicking buttons
- Slow performance
- TypeScript errors in console

---

## 🎨 Customization You Can Do Right Now

### 1. Change the Colors

Edit `tailwind.config.js`:
```js
colors: {
  'nrs-blue': '#2563eb',      // Change to your brand blue
  'nrs-warmth': '#f59e0b',    // Change to your brand orange
  'nrs-hope': '#10b981',      // Change to your brand green
  'nrs-compassion': '#8b5cf6', // Change to your brand purple
}
```

Save and refresh—colors update instantly!

### 2. Update the Header Message

Edit `components/Header.tsx`:
```tsx
<h1 className="text-4xl font-bold text-gray-900 mb-3">
  Your Custom Title Here
</h1>
<p className="text-lg text-gray-600 max-w-2xl mx-auto">
  Your custom tagline or mission statement
</p>
```

### 3. Add a Real Phone Number

Edit `data/playbooks.json` and find this line:
```json
"resource_link": "sms:+1XXXXXXXXXX"
```

Replace with:
```json
"resource_link": "sms:+18165551234"
```

Now the text button will actually work on mobile!

---

## 🐛 Troubleshooting

### "Page not loading"
- Check if dev server is running: You should see "Ready" in terminal
- Try http://127.0.0.1:3000 instead
- Clear browser cache and refresh

### "Cannot find module" errors
- Stop server (Ctrl+C)
- Run: `npm install`
- Start again: `npm run dev`

### Changes not appearing
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check you saved the file
- Wait 2-3 seconds for hot reload

### TypeScript errors
- These are usually helpful! Read the error message
- Most common: typo in a variable name
- Fix and save—Next.js will auto-compile

---

## 📸 Share Your Progress

Take screenshots and share:
1. The input form (show off the clean design!)
2. An action card (show the script and compassion note)
3. The metrics dashboard (even if it's all zeros)

**Tag NRS team**: "Check out the Next-Best-Action Coach MVP! 🚀"

---

## 🚀 Ready to Deploy?

When you're happy with local testing:

1. **Stop the dev server**: Press Ctrl+C in terminal
2. **Follow deployment guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. **Go live on Vercel**: ~5 minutes to production!

---

## 💡 Ideas to Try

### Add Your First Custom Playbook
1. Open `data/playbooks.json`
2. Copy one of the existing playbooks
3. Change the fields (id, script, resource link)
4. Save and refresh the app
5. Your new scenario appears!

See [PLAYBOOK_EXPANSION_GUIDE.md](PLAYBOOK_EXPANSION_GUIDE.md) for details.

### Test with a Caseworker
1. Share your local URL: http://localhost:3000
2. (They need to be on same WiFi, or use ngrok for remote testing)
3. Watch them use it—don't explain!
4. Take notes on where they get confused
5. Iterate based on feedback

---

## 🎉 You Did It!

You just built a production-ready trauma-informed decision support tool. Here's what you accomplished:

✅ Modern web app with React + Next.js + TypeScript
✅ 10 compassion-centered playbooks
✅ Rules-based decision engine
✅ Metrics tracking system
✅ Mobile-responsive design
✅ One-tap actions for caseworkers
✅ Complete documentation

**Next step**: Deploy to Vercel and get it in the hands of real caseworkers.

---

## 📞 Need Help?

**Technical issues?**
- Check [README.md](README.md) for overview
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment
- Search Next.js docs: https://nextjs.org/docs

**Want to customize?**
- Edit colors/text and see changes live
- Add playbooks using the expansion guide
- Experiment—it's hard to break!

---

*"This step honors progress—one breath at a time."*

**Keep building. You're doing something that matters.** 🤲
