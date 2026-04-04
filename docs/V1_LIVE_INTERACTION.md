# v1 Live Interaction - What's Real, What's Later

**Date:** 2026-04-03
**Status:** CLARIFIED

---

## What "Live Interaction" Means

### v1: Real-Time AI Conversation

Customer scans QR -> talks to AI -> AI responds in real time.

**This IS v1.** The voice chat page we're building right now.

Flow:
```text
Customer speaks -> transcribed -> GPT-4o mini -> response -> spoken aloud
                    (real-time, conversational)
```

Duration: 2-5 seconds response time.

---

### What v1 INCLUDES

| Feature | Status | How |
|---------|--------|-----|
| Voice in | Yes | Web Speech API |
| Voice out | Yes | OpenAI TTS with browser fallback |
| Text fallback | Yes | If voice input fails, type instead |
| Real-time conversation | Yes | GPT-4o mini handles context |
| Language selection | Yes | 6 languages |
| Theme selection | Yes | 5 wine themes |
| Demo CTA | Yes | After 3 messages |

---

### What v1 Does NOT Include (v2+)

| Feature | Status | When |
|---------|--------|-------|
| Live waiter handoff | No | v2 |
| Order forwarding to POS | No | v2 |
| Owner live dashboard | No | v2 |
| Waiter notification (WhatsApp/SMS) | No | v2 |
| Voice-only mode (no text) | No | v2 |
| Live conversation replay for owner | No | v2 |

---

## The v1 Customer Experience

```text
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
- sets up the AI during onboarding (quiz + menu)
- gets a QR code to print
- waits for customers to use it
- sees usage analytics later (query count, popular questions) - this is v2

The owner is NOT in the conversation loop during v1.

---

## The Waiter Handoff (What Bidi Described)

> "The idea would be for the AI to ask the customer if they want to order, and send it to the waiter"

**This is v2.** In v1:
- AI recommends dishes
- AI says "I'll note that for the waiter"
- actual ordering = human waiter handles

**v2 flow:**
```text
Customer: "I'd like to order the octopus"
AI: "Great choice! I'll send that to your waiter. Table 7, octopus."
   -> Notification sent to waiter's WhatsApp/POS
Waiter confirms -> order goes to kitchen
```

---

## v1 Voice Quality Handling

**The noise problem:** Restaurants are loud. Voice input still depends on Web Speech API, which works best in quieter moments.

**v1 solutions (locked):**
1. **Text fallback** - if voice input fails, customer types instead
2. **Push-to-talk** - tap and hold reduces background noise pickup
3. **OpenAI voice out** - reply audio sounds more natural than the native browser voice
4. **Headphone disclaimer** - encourages headphones for best quality

**This is enough for v1 launch.** Most restaurant tables are quiet enough for voice to work well.

## v1 Definition (Final)

**What the customer gets:**
- real-time voice/text conversation with AI
- restaurant-specific answers (menu, wine, recommendations)
- beautiful glassy wine sphere UI
- 6 languages, 5 themes
- push-to-talk + text fallback for noisy environments

**What the restaurant gets:**
- EUR 299 setup + EUR 49/month
- AI concierge live on their tables
- usage dashboard (query count, popular questions) - v2

**What v1 does NOT include:**
- waiter notifications
- POS integration
- live owner dashboard
- order forwarding

---

## v2 Priorities

1. **Menu navigation** - accent problem solved
2. **Waiter handoff** - AI -> waiter notification
3. **Owner dashboard** - see conversations live
4. **Order forwarding** - AI -> POS/kitchen

---

## Summary

**v1 = live AI conversation.** The AI talks to customers in real time. That's the product.

**v2 = live human handoff.** AI talks to customers and notifies the waiter when needed.

Ship v1. Validate. Then add waiter integration.
