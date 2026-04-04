# Feature Assessment: Menu Navigation + Comparison
**Date:** 2026-04-03
**Status:** ASSESSED

---

## The Feature Idea

**Problem:** Accents + dish names = voice transcription fails.
Customer says "bacalhau" → AI hears "bak一亮"} → confusion.

**Proposed solution:**
1. Show menu in navigable format (sections → items)
2. Customer says "the third dish in fish section"
3. AI identifies exact dish
4. AI explains in customer's language

**Additional idea:** Compare dishes to known equivalents:
- "Bacalhau is like cod — salt-cod, which is iconic Portuguese comfort food"
- "This dish is similar to what you might know as shepherd's pie"

---

## Honest Assessment: v2

### Why NOT v1

**v1 is already complex enough:**
- Voice chat interface ✅
- Glassy wine sphere ✅
- Language selection ✅
- Theme selection ✅
- Demo CTA ✅
- Stripe payment ✅

Adding menu navigation = 4 steps before conversation:
```
Scan QR → Language → Theme → [Menu Navigation] → Chat
```
vs
```
Scan QR → Language → Theme → Chat
```

**Voice-only fallback handles accents in v1:**
- Customer types if voice fails
- Text fallback is already built
- Good enough for initial validation

**v1 goal: prove the concept works, not perfect every UX edge case.**

### Why it IS a v2 priority

**The accent problem is REAL.** Portuguese dish names are hard to transcribe. Bacalhau, alheira, pastéis de nata — these confuse voice recognition.

**Voice-only scenario:** If customer is on the phone (hands busy, restaurant loud), they can't type. Menu navigation becomes critical.

**Competitive differentiation:** "Show me the fish section" is magical UX that competitors don't have.

---

## Verdict

| Feature | v1? | v2? | Why |
|---------|------|------|-----|
| Voice + text fallback | ✅ | | Core product |
| Glassy wine sphere | ✅ | | Key differentiator |
| Language + theme selection | ✅ | | Already planned |
| Menu navigation | | ✅ | Too complex for v1 |
| Dish comparison/translation | | ✅ | Nice-to-have |
| Voice-only menu control | | ✅ | Solves accent problem |

---

## v2 Features (Priority Order)

1. **Menu Navigation** — sections + item selection via voice commands
2. **Dish Comparison** — "this is like X from your country"
3. **Simple Translations** — dish names in customer's language
4. **Wine Pairing Engine** — based on menu + preferences
5. **Voice-only mode** — for phone/loud environments

---

## v1 Definition (LOCKED)

Keep v1 scope:
- Voice chat ✅
- Text fallback ✅
- Theme selection ✅
- Language selection ✅
- Glassy sphere ✅
- Demo CTA ✅

**Ship v1. Validate. Then add menu navigation.**
