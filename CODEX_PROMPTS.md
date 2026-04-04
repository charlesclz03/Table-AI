# Table IA — CODEX PROMPTS
**Date:** 2026-04-02
**Use:** Paste these into Codex to build the app step by step

---

## CONTEXT

You are building Table IA — an AI concierge for restaurants. Customers scan QR codes on tables and chat with an AI that knows the restaurant's menu, wines, and recommendations.

Tech stack: Next.js + Supabase + Stripe + OpenAI GPT-4o mini + Web Speech API

---

## PROMPT 1: Project Setup

```
Build a Next.js 15 project on Vercel with:
- TypeScript
- App Router
- Tailwind CSS
- Supabase auth (email/password)
- Supabase database connection

Initialize the project in the current directory.
Create .env.local with:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SETUP_PRICE_ID
- STRIPE_MONTHLY_PRICE_ID

Create the Supabase schema from this SQL:

```sql
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  soul_md text default '',
  rules_md text default '',
  menu_json jsonb default '[]',
  quiz_answers jsonb default '{}',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  plan_name text default 'founding',
  setup_paid_at timestamp,
  billing_starts_at timestamp,
  qr_code_url text,
  created_at timestamp default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  table_number text,
  messages jsonb default '[]',
  created_at timestamp default now()
);
```
```

---

## PROMPT 2b: Demo CTA (Like/Dislike)

```
After the demo chat interface, add a simple feedback section:

[👍 Yes, I want this] [👎 No, thanks]

- 👍 "Yes, I want this" → redirects to /admin/payment (Stripe checkout)
- 👎 "No, thanks" → shows "No problem! Your demo will be available for 7 days."

The demo restaurant data stays in the system for 7 days, then auto-deletes.
```

## PROMPT 2: Customer Chat Interface

```
Build the voice chat interface at /chat/[restaurantId]

This is the main customer-facing page. Customers scan a QR code on their table and talk to the AI concierge.

DESIGN:
- Full-screen mobile-first layout
- Centered pulsing circle avatar (CSS animation: scale 1 → 1.1 → 1, 2s infinite)
- "Plug in headphones for best experience" banner (dismissible, only shows once)
- Subtitles below avatar (white text on dark background, max 2 lines)
- Voice input button (microphone icon) — hold to speak or tap to toggle
- Text input below as fallback
- Restaurant name and table number at top

VOICE INPUT (Web Speech API):
```javascript
const recognition = new webkitSpeechRecognition()
recognition.continuous = false
recognition.interimResults = true
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  // send to GPT-4o mini
}
```

VOICE OUTPUT (Web Speech API):
```javascript
const utterance = new SpeechSynthesisUtterance(response.text)
utterance.lang = 'en-US'
speechSynthesis.speak(utterance)
```

SYSTEM PROMPT FOR GPT-4o mini:
```
You are {restaurant_name}'s AI concierge.
Personality: {soul_md}
Menu: {menu_json}
Rules:
1. Only answer from the provided menu
2. If unsure: "Let me check with the staff"
3. Keep responses short (under 30 words for voice)
4. Escalate to human for: complaints, reservations, payments

Respond in this format:
- Voice response: short, natural, conversational
- Text response: can be longer with details
```

CONVERSATION FLOW:
1. Customer opens page → "Hi! I'm {name}'s concierge. Ask me anything about our menu."
2. Customer speaks/types → sent to GPT-4o mini with restaurant context
3. AI responds → displayed as text + spoken aloud
4. After 3 messages → show "👍 Yes, I want this" / "👎 No, thanks" CTA
5. 👍 → redirect to /admin/payment
6. 👎 → "No problem! Your demo will be available for 7 days."

DEMO MODE:
- No login required for customer
- Demo restaurant data pre-loaded
- Only shows when restaurant is in 'demo' status
```

## PROMPT 2b: Demo CTA (Like/Dislike)

```
Build the customer chat interface at /chat/[restaurantId]

Features:
- Pulsing circle avatar animation (CSS keyframes)
- "Plug in headphones" disclaimer shown before voice activates
- Voice input button (Web Speech API)
- Text input fallback
- Subtitles displayed below avatar for every response
- AI responses appear with typing indicator

The chat loads the restaurant's soul_md and menu_json from Supabase and injects into GPT-4o mini API calls.

System prompt for GPT-4o mini:
"You are {restaurant_name}'s AI concierge. 
Personality: {soul_md}
Menu: {menu_json}
Rules: {rules_md}
Language: English
Only answer from the provided menu data. If unsure, say 'Let me check with the staff.'"

Use the Web Speech API for voice input/output.
Store conversation history in Supabase conversations table.
```

---

## PROMPT 3: Restaurant Admin Dashboard

```
Build the admin dashboard at /admin

Pages:
- /admin/login — Supabase auth email/password
- /admin/dashboard — restaurant overview
- /admin/menu — menu editor (CRUD: add/edit/delete items)
- /admin/quiz — onboarding quiz (7 questions)
- /admin/qr — QR code download as PDF
- /admin/settings — restaurant profile

Menu editor:
- Item name, price, category, description, allergens
- Drag to reorder
- Save to menu_json in Supabase

QR Code:
- Generate using 'qrcode' npm package
- URL format: /chat/{restaurant_id}?table={table_number}
- Download as PDF with restaurant name + table number field
- Include "Scan to chat with our AI concierge" text
- Share button (WhatsApp share API)
```

---

## PROMPT 4: Stripe Integration

```
Add Stripe payment at /admin/payment

Flow:
1. Create Stripe Checkout session with:
   - EUR 299 setup price charged immediately
   - EUR 49/month recurring price
   - 30-day trial on the subscription so the first monthly charge happens after month 1
2. Redirect to Stripe
3. On success: update subscription_status to 'active_trial' in Supabase
4. On cancel: redirect back to /admin

Webhook handler at /api/stripe/webhook:
- Handle checkout.session.completed
- Handle customer.subscription.updated
- Handle customer.subscription.deleted (set status to 'inactive')
- Store stripe_customer_id, stripe_subscription_id, setup_paid_at, billing_starts_at, and subscription_status

Env vars:
- STRIPE_SETUP_PRICE_ID
- STRIPE_MONTHLY_PRICE_ID
```

---

## PROMPT 5: Menu Photo Upload

```
Add menu photo upload at /admin/menu/photo

Flow:
1. Owner uploads photo of paper menu
2. Send to GPT-4o vision API
3. Extract menu items: name, price, category
4. Show preview to owner
5. Owner edits/confirms
6. Save to menu_json

Use OpenAI vision (gpt-4o):
```
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Extract this menu. Format: JSON array of {name, price, category}' },
      { type: 'image_url', image_url: { url: photoUrl } }
    ]
  }]
});
```
```

---

## PROMPT 6b: QR Code PDF Generation

```
Build QR code generation at /admin/qr

Uses 'qrcode' npm package:
npm install qrcode

CODE:
```javascript
import QRCode from 'qrcode'

const qrDataUrl = await QRCode.toDataURL(
  `${process.env.NEXT_PUBLIC_APP_URL}/chat/${restaurantId}?table=TABLE_NUMBER`,
  { width: 300, margin: 2 }
)
```

PDF LAYOUT (using React-PDF or html2canvas + jsPDF):
```
┌─────────────────────────────────┐
│                                 │
│      [Restaurant Logo]          │
│      RESTAURANT NAME            │
│                                 │
│   ┌─────────────────────────┐  │
│   │                         │  │
│   │      [QR CODE]          │  │
│   │                         │  │
│   └─────────────────────────┘  │
│                                 │
│  Scan to chat with our          │
│  AI concierge                   │
│                                 │
│  Table: ___                     │
│  (fill in table number)        │
│                                 │
│  🇬🇧 English                   │
│                                 │
└─────────────────────────────────┘
```

FEATURES:
- Restaurant logo at top (from Supabase logo_url)
- QR code centered
- Table number field (handwritten after printing)
- "Scan to chat with our AI concierge" text
- Language flag
- Share button → WhatsApp share URL:
  `https://wa.me/?text=Scan%20to%20chat%20with%20our%20AI%20concierge%3A%20${qrUrl}`
- Download as PDF button
```

## PROMPT 6: Soul.md + Rules.md System

```
Create the soul/rules system:

SOUL.md per restaurant:
```
You are {name}'s AI concierge.
Personality: {from quiz answers}
You speak like a knowledgeable local friend.
You know the menu inside out.
When recommending: be specific, use details.
```

RULES.md per restaurant:
```
1. RETRIEVE ONLY from the provided menu
2. NEVER generate ingredient or allergen information
3. If unsure: "Let me check with the staff"
4. Escalate to human for: complaints, reservations, payments
5. Language: respond in the customer's language
```

These load into the system prompt for every GPT-4o mini call.
```

---

## NOTES FOR CODEX

- Use shadcn/ui components where possible
- Mobile-first design (restaurant customers on phones)
- Keep the customer chat interface extremely simple (just voice + chat)
- Admin dashboard can be more complex
- Test with real restaurant data when building

---

## DEPLOY

After building, deploy to Vercel:
```
vercel --prod
```

Set environment variables in Vercel dashboard.
