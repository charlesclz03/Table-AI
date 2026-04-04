# Table IA — Bidi's Morning Checklist
**Date:** 2026-04-03 (Day 1 of build)

---

## Claim Moltbook (5 min)
1. Open: https://www.moltbook.com/claim/moltbook_claim_LP5RMwv36BYuOnSRdm52XMKxZcD5RrBJ
2. Verify email
3. Post tweet with verification code
4. Done — emberdigital will be able to upvote/comment

---

## Start Building (Week 1, 2 weeks to MVP)

### Day 1 Checklist

#### 1. Codex Setup (10 min)
- [ ] Open Codex
- [ ] Create new project: `TableIA`
- [ ] Read `C:\Projects\TableIA\CODEX_PROMPTS.md`
- [ ] Paste Prompt 1 (Project Setup)

#### 2. Build Project Setup (30 min)
- [ ] Next.js project initialized
- [ ] Supabase connected
- [ ] .env.local configured
- [ ] Git initialized
- [ ] Deployed to Vercel (empty shell)

#### 3. Build Customer Chat Interface (2-3 hours)
- [ ] Paste Prompt 2 (Voice Chat Interface)
- [ ] Test voice in/out
- [ ] Test with sample restaurant data

#### 4. Build Admin Dashboard (2-3 hours)
- [ ] Paste Prompt 3 (Admin Dashboard)
- [ ] Menu editor working
- [ ] Quiz flow working

#### 5. Stripe Integration (1 hour)
- [ ] Paste Prompt 4 (Stripe)
- [ ] Webhook handler set up
- [ ] Test payment flow

#### 6. Deploy (30 min)
- [ ] Deploy to Vercel production
- [ ] Test with phone

---

## First Restaurant Visit (Day 3-4)

### Pre-Visit
- [ ] Pick restaurant from `FIRST_RESTAURANT.md` or find own
- [ ] Pre-build demo with Google Maps + TheFork data
- [ ] Test on your phone

### Pitch Script
```
\"Hi, I'm building an AI concierge for restaurants.
 Customers scan a QR code on the table and ask the AI anything about the menu.
 Can I show you a quick demo?\"
 [SHOW DEMO]
 \"Would you pay €29/month for this?\"
```

### If Yes
- [ ] Get email
- [ ] Send to /admin/signup
- [ ] Stripe payment link

---

## Tools Ready
- Codex: ChatGPT Plus ✅
- Supabase: Already configured (from Freestyla) ✅
- Vercel: Already configured (from Freestyla) ✅
- Stripe: Already configured (from Freestyla) ✅
- OpenAI API key: Need to get at platform.openai.com

---

## If Stuck
- Read `C:\Projects\TableIA\SPEC.md`
- Read `C:\Projects\TableIA\README.md`
- Check Codex prompts: `C:\Projects\TableIA\CODEX_PROMPTS.md`
