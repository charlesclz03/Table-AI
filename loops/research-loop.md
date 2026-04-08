# Gustia Research Loop

Based on: karpathy/autoresearch pointer philosophy

## What It Is

Ember's research agent for Gustia. Reads the project, researches the market, updates strategy, and logs findings.

## Loop

```
1. READ
   └── Code state (what's built vs documented)
   └── docs/DOCUMENTATION_AUDIT.md
   └── docs/SPEC.md
   └── Pricing, competitors, market data

2. RESEARCH
   └── Lisbon restaurant market
   └── Competitor pricing
   └── SEO opportunities
   └── Outreach conversion rates
   └── GitHub: restaurant AI tools, QR code trends

3. UPDATE
   └── strategy.md (priorities)
   └── competitor-research.md
   └── leads-list.md

4. ACT
   └── Generate outreach templates
   └── Flag conversion issues
   └── Update pricing if needed
```

## Files

| File | Role |
|------|------|
| `loops/strategy.md` | Current priorities, what's working |
| `loops/competitor-research.md` | Market research findings |
| `loops/leads-list.md` | Prospects, outreach status |
| `loops/conversion-log.md` | What worked, what didn't |

## Current State (2026-04-08)

- Live at gustia.wine ✅
- Codex prompts 21-30 queued
- Documentation audit: ~60% of documented features built
- Missing: Stripe subscription, QR PDF, usage cap, email notifications
- Google OAuth: pending (needs Supabase config)

## Priority

1. Get first paying restaurant
2. Fix Stripe subscription flow
3. Build QR PDF generator (core product mechanic)
4. Usage cap enforcement

## Questions to Answer

- [ ] What's the actual conversion rate on outreach?
- [ ] Is €99 setup fee too high for Lisbon SMBs?
- [ ] What do restaurants say when they say no?
- [ ] Is the 14-day guarantee being used?
