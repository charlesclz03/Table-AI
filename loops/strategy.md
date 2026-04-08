# Gustia Strategy — Updated 2026-04-08

## Mission

Get first paying restaurant customer.

## What's Built (Source of Truth: docs/DOCUMENTATION_AUDIT.md)

| Feature | Status |
|---------|--------|
| Landing page + pricing | ✅ Live |
| Supabase auth + invite flow | ✅ Working |
| Guest chat (4 themes) | ✅ Live |
| Owner admin dashboard | ✅ Working |
| Google Maps onboarding | ✅ Working |
| OpenAI TTS | ✅ Live |
| Stripe checkout | ✅ Working |
| Menu editor + photo upload | ✅ Working |

## What's Missing (Priority Order)

| Feature | Priority | Why |
|---------|----------|-----|
| Stripe subscription (real billing) | 🔴 | Can't charge without this |
| QR code PDF generator | 🔴 | Core product mechanic |
| Usage cap enforcement | 🔴 | Revenue protection |
| Email notifications | 🟡 | Customer communication |
| Referral system | 🟡 | Organic growth |
| Owner analytics dashboard | 🟡 | Shows value |
| Google OAuth enablement | 🟡 | Easier login |
| Voice mode toggle | 🟢 | Nice to have |
| Waitlist | 🟢 | Pre-launch only |

## Codex Prompts Status

| Prompt | Status |
|--------|--------|
| 21: Documentation Audit | ✅ Done |
| 22: PreText Performance | 🔄 Codex running |
| 23: QR Code Generator | 🔄 Codex running |
| 24: Usage Cap | ⬜ Queued |
| 25: Stripe Subscription | ⬜ Queued |
| 26: Referral System | ⬜ Queued |
| 27-30: Missing Features | ⬜ Queued |

## Pricing

- €99 setup + €49/month OR €470/year (20% off)
- 14-day retraction guarantee
- Annual = €39/month effective

## Market

- Lisbon: 7,149 restaurants
- Target: 50-200 seat restaurants
- Language: European Portuguese
- Channel: Instagram + LinkedIn + direct outreach

## Outreach Status

See: `loops/leads-list.md`

## Conversion Tracking

See: `loops/conversion-log.md`
