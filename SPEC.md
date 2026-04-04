# Table IA — SPEC.md
**Project:** Restaurant AI Concierge
**Date:** 2026-04-02
**Status:** Ready to build

---

## WHAT IT IS

An AI concierge for restaurants. Customers scan a QR code → talk to an AI that knows THIS restaurant's menu, wines, recommendations, and story. Built via a 5-minute onboarding quiz + optional menu photo upload.

---

## THE PRODUCT

### Customer Experience
1. Customer scans QR code on table
2. AI avatar appears with pulsing animation
3. "Hi! I'm [Restaurant Name]'s concierge. Ask me anything about the menu."
4. Customer speaks or types: "What wine goes with the octopus?"
5. AI answers in English, with subtitles
6. Optional: order recommendation sent to waiter
7. **Demo CTA:** "👍 Yes, I want this" → payment | "👎 No, thanks" → demo stays 7 days then auto-deletes
1. Customer scans QR code on table
2. AI avatar appears with pulsing animation
3. "Hi! I'm [Restaurant Name]'s concierge. Ask me anything about the menu."
4. Customer speaks or types: "What wine goes with the octopus?"
5. AI answers in English, with subtitles
6. Optional: order recommendation sent to waiter

### Restaurant Owner Experience
1. Sees live demo for their restaurant
2. Pays the founding setup offer
3. Uploads menu photo OR fills menu editor
4. Takes 5-minute onboarding quiz (signature dishes, FAQs, wine pairings)
5. Reviews first launch version
6. Downloads QR code as PDF
7. Prints and places on tables

---

## ONBOARDING QUIZ (5 minutes)

```
Welcome! I'm [Restaurant Name]'s AI concierge.
Let me get to know you so I can represent your restaurant perfectly.

Q1: What's your signature dish?
→ [owner types]

Q2: If someone is unsure what to order, what do you recommend?
→ [owner types]

Q3: Which wine pairs best with your lamb?
→ [owner types]

Q4: What's a dish most tourists don't know to order but should?
→ [owner types]

Q5: Any dishes with allergens guests often ask about?
→ [owner types]

Q6: What's the story behind [signature dish]?
→ [owner types]

Q7: What are the 5 questions customers ask most?
→ [owner types 5 questions]
```

---

## FEATURES

### Customer Side (QR Interface)
- Voice input (Web Speech API — free)
- Voice output (Web Speech API — free)
- Subtitles always displayed
- Pulsing avatar animation
- Headphone disclaimer shown before voice
- Text input fallback

### Admin Side (Restaurant Dashboard)
- Menu editor (add/edit/delete items)
- Photo menu upload → AI parses
- Onboarding quiz
- QR code PDF download
- Usage analytics
- Billing (Stripe)

---

## TECHNICAL ARCHITECTURE

### Stack
- **Frontend:** Next.js (Vercel)
- **Database:** Supabase (auth, DB, storage)
- **LLM:** GPT-4o mini (OpenAI API)
- **Payments:** Stripe
- **Voice:** Web Speech API (browser, free)
- **QR Generation:** qrcode library

### Two-System Separation
- **Operator (OpenClaw/Codex):** Build demos, scrape data, automate outreach
- **Customer (GPT-4o mini):** Real-time chat, voice in/out

### Per-Restaurant Context Injection
```
User message → Load restaurant soul.md + menu → Inject into GPT-4o mini → Response
```
One shared LLM. Restaurant-specific context injected at request time.

### Data Model
```
Restaurant {
  id, name, soul_md, rules_md, menu_json, quiz_answers,
  stripe_customer_id, subscription_status, created_at
}

Conversation {
  id, restaurant_id, table_number, messages[],
  created_at
}
```

---

## FILES TO CREATE

1. `SPEC.md` (this file)
2. `CODEX_PROMPTS.md` (build prompts)
3. `SUPABASE_SCHEMA.md` (database setup)
4. `SOUL_TEMPLATE.md` (restaurant soul.md template)
5. `RULES_TEMPLATE.md` (restaurant rules.md template)

---

## PRICING

### Founding Offer (First 3 Restaurants)
- **€299 setup** — includes everything below
- First month live included
- After that: **€49/month**
- "Founding restaurant" angle — feels exclusive and urgent

### What €299 Setup Includes
- Menu and knowledge base setup
- Concierge customization for their restaurant (soul.md + rules.md)
- QR code creation and PDF download
- Installation and first configuration
- First corrections after launch

### After Month 1
- €49/month per restaurant
- Month-to-month, cancel anytime
- Fair-use policy (2,000 queries/month included)

### Pricing Tier (Future)
- €349-499 setup + €59/month — only after testimonials and proof

### Why This Works
- €299 gives real upfront cash now
- "First month included" feels clean, not pushy
- €49/month still reachable for Portugal restaurants
- Positions Table IA as a custom installed business tool, not a cheap SaaS

---

## COMPETITORS

- Slang AI: $399-599/month
- Zicbot: $50/month
- Hostie AI: voice-only

Our advantage: €299 setup + €49/month, voice + text, self-service onboarding, pre-built demo sales method.

---

## GOALS

- Month 1: 3 restaurants = €897 (3 × €299 setup)
- Month 1 cash target: 4 setup closes = €1,196
- Month 3: 10 restaurants live = €490 MRR
- Month 6: 30 restaurants = €1,470 MRR
- Long-term: 71 restaurants live = €3,479 MRR
