# Gustia — Next Steps

**Project:** Gustia (formerly Table IA)
**Updated:** 2026-04-08
**Queue source:** `docs/CODEX PROMPTS from 23 to 30.md`

## Prompt Queue

All prompts from `CODEX PROMPTS from 23 to 30.md`:

### Prompt 23 — QR Code Generator
- **Read:** `app/admin/qr/page.tsx`, `app/api/qr/route.ts`, `docs/SPEC.md`
- **What:** Build working QR code generator with PDF download (`qrcode` + `jspdf`)
- **File:** `app/api/qr/[restaurantId]/route.ts`
- **Verification:** `npm run build` passes, QR codes generate, PDF downloads work, mobile scan works

### Prompt 24 — Usage Cap Enforcement
- **Read:** `app/api/chat/route.ts`, `lib/billing/usage.ts`, `docs/PRICING_DECISION.md`
- **What:** Track queries per restaurant, warn at 80%, block at 100% with upgrade message
- **Tables:** `usage_logs` in Supabase
- **Verification:** `npm run build` passes, usage increments on each chat, blocks at cap

### Prompt 25 — Stripe Subscription + Webhook
- **Read:** `app/api/stripe/webhook/route.ts`, `docs/PRICING_DECISION.md`
- **What:** Full subscription checkout, webhook handler (checkout.session.completed, invoice.paid/failed, subscription.deleted), billing ledger
- **Verification:** `npm run build` passes, subscription checkout works, webhook updates DB

### Prompt 26 — Referral System
- **Read:** `app/admin/referral/page.tsx`, `docs/SPEC.md`
- **What:** "Give 1 month free, get 1 month free" — referral codes, tables, apply logic
- **Tables:** `referrals`, `referral_codes`
- **Verification:** `npm run build` passes, codes generate, referral tracking works

### Prompt 27 — Critical Missing Features
- **Read:** `docs/DOCUMENTATION_AUDIT.md`, `docs/SPEC.md`
- **What:** Usage Cap + QR PDF + Email Notifications + Language Switching
- **Verification:** `npm run build` passes, all pages load, no console errors

### Prompt 28 — Growth & Polish
- **Read:** `docs/DOCUMENTATION_AUDIT.md`, `app/admin/**/*.tsx`
- **What:** Referral + Analytics (recharts) + Voice Toggle + Refund + Waitlist + Zapier webhook
- **Verification:** `npm run build` passes, all features visible, mobile responsive

### Prompt 29 — Missing Pieces
- **Read:** `docs/DOCUMENTATION_AUDIT.md`, `docs/SPEC.md`, `app/admin/**/*.tsx`
- **What:** Lead Pipeline (Kanban) + Invite Flow + Stripe Subscription + Customer Portal
- **Verification:** `npm run build` passes, all flows work

### Prompt 30 — Final Feature Completion
- **Read:** `docs/DOCUMENTATION_AUDIT.md`, `docs/SPEC.md`
- **What:** Verify all features done → create `docs/FEATURE_COMPLETION.md`
- **Verification:** `npm run build` passes, all checklist items ✅

## Done (Prompts 1–22)
- ✅ Stripe payment flow
- ✅ GPT-4o mini chat integration
- ✅ Supabase schema + Vercel deploy
- ✅ Mobile UX fixes
- ✅ Supabase Auth migration
- ✅ Menu photo upload + AI parsing
- ✅ Owner analytics dashboard

## Current Focus
Prompts 23–30 are the remaining work to reach full feature completion.
