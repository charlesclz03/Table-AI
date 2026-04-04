# v1 Live Interaction — What's Real, What's Later

**Date:** 2026-04-03
**Status:** CLARIFIED

---

## What "Live Interaction" Means

### v1: Real-Time AI Conversation ✅

Customer scans QR → talks to AI → AI responds in real-time.

**This IS v1.** The voice chat page we're building right now.

Flow:
```
Customer speaks → transcribed → GPT-4o mini → response → spoken aloud
                    (real-time, conversational)
```

Duration: 2-5 seconds response time.

---

### What v1 INCLUDES

| Feature | Status | How |
|---------|--------|-----|
| Voice in | ✅ | Web Speech API |
| Voice out | ✅ | Web Speech API |
| Text fallback | ✅ | If voice fails, type instead |
| Real-time conversation | ✅ | GPT-4o mini handles context |
| Language selection | ✅ | 6 languages |
| Theme selection | ✅ | 5 wine themes |
| Demo CTA | ✅ | After 3 messages |

---

### What v1 Does NOT Include (v2+)

| Feature | Status | When |
|---------|--------|-------|
| Live waiter handoff | ❌ | v2 |
| Order forwarding to POS | ❌ | v2 |
| Owner live dashboard | ❌ | v2 |
| Waiter notification (WhatsApp/SMS) | ❌ | v2 |
| Voice-only mode (no text) | ❌ | v2 |
| Live conversation replay for owner | ❌ | v2 |

---

## The v1 Customer Experience

```
1. Scan QR on table
2. Select language (EN/FR/ES/IT/PT/RU)
3. Select wine theme
4. See glassy wine sphere
5. Speak or type: "What wine pairs with the octopus?"
6. AI responds (voice + text) in 2-3 seconds
7. Continue conversation
8. After 3 messages: "Want this for your restaurant?" CTA
```

**The AI is live and real.** It's not pre-recorded. It's not a chatbot with fixed responses. GPT-4o mini generates real answers from the restaurant's specific menu data.

---

## What "Live" Means for the Restaurant Owner (v1)

**Owner sees NOTHING live in v1.**

v1 is customer-facing only. The restaurant owner:
- Sets up the AI during onboarding (quiz + menu)
- Gets a QR code to print
- Waits for customers to use it
- Sees usage analytics later (query count, popular questions) — this is v2

The owner is NOT in the conversation loop during v1.

---

## The Waiter Handoff (What Bidi Described)

> "The idea would be for the AI to ask the customer if they want to order, and send it to the waiter"

**This is v2.** In v1:
- AI recommends dishes
- AI says "I'll note that for the waiter"
- Actual ordering = human waiter handles

**v2 flow:**
```
Customer: "I'd like to order the octopus"
AI: "Great choice! I'll send that to your waiter. Table 7, octopus."
   → Notification sent to waiter's WhatsApp/POS
Waiter confirms → order goes to kitchen
```

---

## v1 Voice Quality Handling

**The noise problem:** Restaurants are loud. Web Speech API works best in quiet rooms.

**v1 solutions (locked):**
1. **Text fallback** — if voice fails, customer types instead
2. **Push-to-talk** — tap and hold reduces background noise pickup
3. **Headphone disclaimer** — encourages headphones for best quality

**This is enough for v1 launch.** Most restaurant tables are quiet enough for voice to work well.

## v1 Definition (Final)

**What the customer gets:**
- Real-time voice/text conversation with AI
- Restaurant-specific answers (menu, wine, recommendations)
- Beautiful glassy wine sphere UI
- 6 languages, 5 themes
- Push-to-talk + text fallback for noisy environments

**What the restaurant gets:**
- €299 setup + €49/month
- AI concierge live on their tables
- Usage dashboard (query count, popular questions) — v2

**What v1 does NOT include:**
- Waiter notifications
- POS integration
- Live owner dashboard
- Order forwarding

---

## v2 Priorities

1. **Menu navigation** — accent problem solved
2. **Waiter handoff** — AI → waiter notification
3. **Owner dashboard** — see conversations live
4. **Order forwarding** — AI → POS/kitchen

---

## Summary

**v1 = live AI conversation.** The AI talks to customers in real-time. That's the product.

**v2 = live human handoff.** AI talks to customers AND notifies the waiter when needed.

Ship v1. Validate. Then add waiter integration.
