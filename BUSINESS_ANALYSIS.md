# Table IA - BUSINESS ANALYSIS
**Project:** Table IA - Restaurant Concierge
**Date:** 2026-04-03
**Status:** Repositioned for cash-first execution

---

## REVENUE MODEL

| Item | Value |
|---|---|
| Setup price per restaurant | EUR 299 one-time |
| What's included | Menu setup, concierge configuration, QR deployment, first corrections, first month live |
| Ongoing billing | EUR 49/month starting in month 2 |
| Contract | Month-to-month after launch |
| Fair use | 2,000 queries/month included |
| Revenue target (1% Lisbon live base) | 71 x EUR 49 = EUR 3,479/month |
| Revenue target (3% Lisbon live base) | 214 x EUR 49 = EUR 10,486/month |
| Revenue target (5% Lisbon live base) | 357 x EUR 49 = EUR 17,493/month |

### Why this model beats EUR 29/month

- It creates real upfront cash instead of forcing volume too early.
- It matches the actual work being done during onboarding and launch.
- "First month included" feels cleaner than charging setup plus subscription on day one.
- EUR 49/month stays accessible for Portugal while still feeling like a real business tool.

---

## CASH COLLECTION MODEL

### Initial sale economics

| Item | Amount |
|---|---:|
| Cash collected at close | EUR 299 |
| Stripe fee on setup payment | ~EUR 8.92 |
| Net cash before delivery time | ~EUR 290.08 |

### Recurring monthly economics after launch

| Item | Amount |
|---|---:|
| Monthly price | EUR 49 |
| Stripe fee | ~EUR 1.67 |
| Net after Stripe, before infra/support | ~EUR 47.33 |

**Practical interpretation:** one setup close matters more this month than ten low-ticket subscriptions.

---

## COST STRUCTURE PER RESTAURANT

### Myth: "Each restaurant needs their own API key"
**Reality: Multi-tenant architecture - one AI brain, restaurant-specific memory**

How it works:
```
User message from Restaurant X
    ->
System loads Restaurant X's memory file (menu, wines, hours, context)
    ->
ONE AI instance processes ALL restaurants
    ->
Response tagged as Restaurant X
```

**Marginal cost per additional live restaurant:** roughly EUR 3.73-5.97/month once they are active on the EUR 49 plan.

### Per-live-restaurant monthly costs

| Cost Item | Monthly Cost | Notes |
|---|---|---|
| AI API (marginal) | EUR 0.01-0.10 | Minimal per-restaurant increase |
| Supabase DB (marginal) | EUR 0.05-0.20 | Small structured payloads |
| Vercel deployment | EUR 1.50-3.00 | Shared instance, cost divided |
| Stripe fees | ~EUR 1.67 | 2.9% + EUR 0.25 on EUR 49 |
| Customer support | EUR 0.50-1.00 | Human handles corrections and edge cases |
| **Total per live restaurant** | **EUR 3.73-5.97/month** | |

### Gross margin per live restaurant

| Price | Cost | Gross Margin |
|---|---|---|
| EUR 49/month | EUR 3.73-5.97 | **EUR 43.03-45.27 (88-92%)** |

### Setup margin logic

The EUR 299 setup is not pure software margin. It pays for:

- founder-led install and onboarding
- restaurant-specific setup and correction work
- the first month before recurring billing starts
- the reality that month-1 value comes from service effort, not just software

---

## BREAK-EVEN ANALYSIS

| Scenario | Monthly Cost | Clients Needed |
|---|---|---:|
| Cash break-even this month | ~EUR 65 fixed tooling | 1 setup close |
| Recurring break-even from month 2 onward | ~EUR 65 fixed + per-client costs | 2 live restaurants |

**Cash truth:** the setup fee solves the month-1 cash problem.  
**SaaS truth:** the monthly fee becomes meaningful once a small live base exists.

---

## FULL BUSINESS MODEL

### Monthly P&L once clients are on recurring billing

| Item | 10 live clients | 50 live clients | 100 live clients |
|---|---:|---:|---:|
| Revenue | EUR 490 | EUR 2,450 | EUR 4,900 |
| AI API cost | EUR 1 | EUR 5 | EUR 10 |
| Database cost | EUR 2 | EUR 10 | EUR 20 |
| Hosting cost | EUR 20 | EUR 20 | EUR 30 |
| Stripe fees | EUR 17 | EUR 84 | EUR 167 |
| Support time | EUR 15 | EUR 15 | EUR 30 |
| **Total costs** | **EUR 55** | **EUR 134** | **EUR 257** |
| **Net profit** | **EUR 435** | **EUR 2,316** | **EUR 4,643** |
| **Margin** | **89%** | **95%** | **95%** |

### Setup-cash scenarios

| Setup closes in 30 days | Cash collected |
|---|---:|
| 1 | EUR 299 |
| 2 | EUR 598 |
| 3 | EUR 897 |
| 4 | EUR 1,196 |

**Month-1 target logic:** 4 setup closes beats chasing 35 restaurants at EUR 29/month.

### Lifetime value (LTV)

| Metric | Value |
|---|---|
| Setup revenue | EUR 299 |
| Monthly revenue after launch | EUR 49 |
| Churn assumption | 10% monthly |
| Average customer life | 10 months total |
| Estimated paid months after included month | 9 |
| **Estimated LTV per client** | **EUR 740** |

### Customer acquisition cost (CAC)

| Channel | Cost | Conversion Rate | CAC |
|---|---|---|---:|
| Restaurant visit (Bidi) | ~EUR 5 in time + transport | 20% (1 in 5) | EUR 25 |
| Referral | EUR 0 | 40% | EUR 0 |

**LTV:CAC ratio:** EUR 740:EUR 25 = 29.6:1

This is not a normal SaaS CAC story. It works because setup revenue subsidizes acquisition.

---

## UNIT ECONOMICS SCORING

| Metric | Score | Max | Notes |
|---|---:|---:|---|
| **Cash collected per close** | 20 | 20 | EUR 299 upfront is materially better than low-ticket SaaS |
| **Margin per live client** | 18 | 20 | 88-92% gross margin on recurring base |
| **Break-even speed** | 19 | 20 | One close covers tooling; two live clients cover recurring base |
| **Recurring revenue quality** | 17 | 20 | Lower MRR than premium US tools, but solid for Portugal |
| **Market size (Lisbon)** | 15 | 20 | 7,149 restaurants remains meaningful |
| **Acquisition speed** | 15 | 20 | Demo-first local sales can close fast |
| **Support burden** | 12 | 20 | Still manageable if scope stays tight |
| **Legal/IP risk** | 8 | 20 | Demo/photo gray area remains real |
| **Competition** | 14 | 20 | Local wedge still helps |
| **Technical complexity** | 12 | 20 | Scraping + memory + voice still not trivial |
| **TOTAL** | **150/180** | 180 | **83% - stronger under the new model** |

---

## RISK ANALYSIS

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Restaurants resist setup fee | Medium | High | Demo-first pitch, founding offer framing, first month included |
| Restaurant churn (>10%/month) | Medium | Medium | Keep monthly low, deliver visible utility, follow up after launch |
| AI gives wrong allergen info | Low | High | Never guess allergens, always escalate to staff |
| Vercel costs spike at scale | Low | Low | Shared architecture allows migration later |
| Competitor copies model | Medium | Medium | Local sales speed and implementation help defensibility |
| Scope creep during setup | Medium | Medium | Define setup clearly: one install, one correction round, no custom POS work |

---

## HONEST TIMELINE

| Milestone | Realistic | Optimistic |
|---|---|---|
| First demo built | Week 1 | Day 3 |
| First restaurant visited | Week 1-2 | Day 7 |
| First setup close | Week 2 | Day 10 |
| EUR 1,000 cash collected | 4 setup closes | 3 closes + one small add-on |
| EUR 1,000 MRR | ~21 live restaurants | ~15 if upsells appear |
| EUR 2,000 MRR | ~41 live restaurants | ~30 with premium add-ons |

---

## DECISIONS NOW LOCKED

| Decision | Final call |
|---|---|
| Setup fee | EUR 299 |
| First month included | Yes |
| Monthly price after month 1 | EUR 49/month |
| Minimum contract | Month-to-month |
| Free trial | No - the demo is the trial |
| Fair use | 2,000 queries/month included |
| Positioning | Founder-installed restaurant concierge, not generic AI waiter |
| Data ownership | Restaurant owns its data; Table IA hosts it |

---

## WHAT WE HAVE VS WHAT WE NEED

### We Have
- OpenClaw running with MiniMax
- Supabase database
- Nano Banana Pro access
- Discord bots
- 10 hours/day from Bidi
- BDR sales experience
- Registered freelance status in Portugal
- Codex for building

### We Need
- [ ] Vercel account (deployment platform)
- [ ] Stripe products for setup and recurring billing
- [ ] Demo template (base concierge app)
- [ ] Lead list scraping (OpenClaw + Google Maps)
- [ ] One real restaurant to build first demo

### Nice to Have
- [ ] 11 Labs (voice output - v2)
- [ ] Firecrawl API (advanced scraping)
- [ ] QR code printing + shipping logistics

---

## NEXT ACTIONS (THIS WEEK)

1. [ ] Create Stripe setup product: EUR 299 one-time
2. [ ] Create Stripe recurring product: EUR 49/month
3. [ ] Configure checkout so setup is charged immediately and monthly billing starts after 30 days
4. [ ] Build one demo concierge for a real Lisbon restaurant
5. [ ] Visit 5 restaurants with the live demo
6. [ ] Aim for the first paid setup, not vanity signups

---

## THE ONE THING THAT DETERMINES SUCCESS

> **Build one demo. Show up. Close the setup.**

This business is no longer pretending to be "cheap self-serve SaaS from day one."  
It wins if the demo makes EUR 299 feel obvious.

