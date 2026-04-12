# Gustia Landing Page — Taste-Skill Redesign Report

**Date:** 2026-04-12
**Branch:** main (pushed ✅)

---

## What Changed

### Design Direction
Full redesign away from dark/purple "AI startup" aesthetic → **editorial luxury warm palette** that matches a premium restaurant brand.

**Before:** Deep purple/blue gradients, centered hero, glass morphism panels, generic SaaS feel
**After:** Warm bone/off-white (#F7F5F0), amber accents (#B45309), split-screen hero, editorial bento grid

### Skills Applied

| Skill | Contribution |
|---|---|
| `taste-skill` | DESIGN_VARIANCE 8 (asymmetric bento), spring physics, micro-animations, strict typography hierarchy |
| `soft-skill` | Editorial luxury aesthetic, warm cream palette, double-bezel card structure, cinematic motion |
| `minimalist-skill` | Warm monochrome, 1px borders, generous whitespace, editorial typography, no decorative noise |

### Key Design Decisions

**Palette:**
- Background: `#F7F5F0` (bone/cream)
- Surface cards: `rgba(255,255,255,0.80)` with `1px solid #E7E5E4` borders
- Primary accent: `#B45309` (amber/ochre)
- Text: `#1C1917` (near-black), `#78716C` (warm gray), `#A8A29E` (muted)
- Dark sections: `#1C1917` (deep charcoal) with warm amber ambient glow

**Typography:**
- Font: Space Grotesk (already installed, not Inter ✅)
- Hero H1: `tracking-[-0.04em] leading-[1.05]`
- No Inter, no oversize H1s, typographic hierarchy via weight + color

**Layout:**
- Split-screen hero: text LEFT (55%), image RIGHT (45%) — NO centered hero
- Bento grid for problem section: 2-column offset (1fr / 1.4fr)
- 2-column bento grid for 4-step owner setup
- Pricing: 3-column grid with `1.2fr` activation card spanning 2 rows
- No symmetrical 3-equal-column card layouts

**Motion (MOTION_INTENSITY 6):**
- Staggered card reveals: `staggerChildren: 0.1, delayChildren: 0.1`
- Spring physics: `ease: [0.32, 0.72, 0, 1]` (custom cubic-bezier)
- Per-step delays: `index * 0.07s`
- Image hover zoom: `scale-[1.03]` over `700ms`
- Hero image: `scale(1.04) → scale(1)` over `1.1s`
- Scroll chevron: infinite `y: [0, 6, 0]` loop, `2s` duration
- All animations: `transform` and `opacity` only (GPU-safe)

**Hero Image:**
- Generated with Nano Banana Pro (Gemini 3 Pro Image)
- Prompt: "Elegant restaurant interior, warm amber lighting, tables set for fine dining, Lisbon evening atmosphere, cinematic lighting, luxury feel, no text"
- Saved to: `public/hero-restaurant.jpg`

### Sections

1. **Hero** — Split-screen, text LEFT, image RIGHT. Amber eyebrow tag, italic accent on "AI concierge", two CTAs, floating pricing card overlay
2. **Problem** — Asymmetric 2-col bento: editorial heading LEFT, problem cards RIGHT
3. **How It Works** — 4-step bento grid (2-col on desktop), each card has image + content + bullets
4. **Guest Preview** — Phone mockup with guest onboarding flow, staggered reveal
5. **Pricing** — Dark section with warm amber ambient glow, 3-col bento (Activation spans 2 rows)
6. **CTA/Pilot** — Light section with trust signals and dual CTAs

### Build Status
- `npm run build` — **PASSED ✅**
- ESLint warnings: 0 errors
- TypeScript errors: 0
- All 57 routes build successfully

### Files Changed
```
app/page.tsx            — Full redesign (707 insertions, 771 deletions)
public/hero-restaurant.jpg — New AI-generated hero image
```

---

## Design Principles Summary

| Setting | Value | Applied As |
|---|---|---|
| DESIGN_VARIANCE | 8 | Asymmetric bento grids, offset text/image sections |
| MOTION_INTENSITY | 6 | Spring physics, staggered reveals, image zoom on hover |
| VISUAL_DENSITY | 4 | Generous whitespace, clean cards, 1px borders |

**No banned patterns present:**
- No Inter font ✅
- No AI purple/blue aesthetic ✅
- No centered hero ✅
- No generic 3-column equal card layouts ✅
- No neon/glow box-shadows ✅
- No pure black backgrounds ✅
- No emojis ✅
