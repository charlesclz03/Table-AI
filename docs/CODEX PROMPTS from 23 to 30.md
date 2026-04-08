* **PROMPT 23 — QR Code Generator**

Read first: app/admin/qr/page.tsx, app/api/qr/route.ts, docs/SPEC.md

\<output\_contract\>  
Build working QR code generator with PDF download. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

* \#\# What to build

\#\#\# QR Code Generator  
Currently shows a link — should generate real downloadable QR codes.

\*\*1. Create QR API Route\*\*

* File: app/api/qr/\[restaurantId\]/route.ts  
* typescript import { NextRequest, NextResponse } from 'next/server' import QRCode from 'qrcode' export async function GET( req: NextRequest, { params }: { params: { restaurantId: string } } ) { const { restaurantId } \= params  
* const baseUrl \= process.env.NEXT\_PUBLIC\_SITE\_URL || '[https://gustia.wine/](https://gustia.wine/)' const chatUrl \= ${baseUrl}/chat/${restaurantId}  
   // Generate QR code as PNG const qrDataUrl \= await QRCode.toDataURL(chatUrl, { width: 400, margin: 2, color: { dark: '\#000000', light: '\#ffffff' } })  
   return NextResponse.json({ qrDataUrl, chatUrl }) }  
* \*\*2. Install QR library\*\*  
* bash npm install qrcode

\*\*3. Update QR Page\*\*  
File: app/admin/qr/page.tsx

\- Show restaurant name and chat URL  
\- Display QR code image  
\- "Download PNG" button  
\- "Download PDF" button (generate PDF with QR \+ restaurant branding)

* \*\*4. PDF Generator\*\*  
* typescript import { jsPDF } from 'jspdf' async function generateQRPDF(qrDataUrl: string, restaurantName: string) { const pdf \= new jsPDF({ orientation: 'landscape' })

// Add QR code pdf.addImage(qrDataUrl, 'PNG', 20, 40, 80, 80\)  
 // Add restaurant name pdf.setFontSize(24) pdf.text(restaurantName, 120, 60\)  
 // Add instructions pdf.setFontSize(12) pdf.text('Scan to chat with our AI concierge', 120, 80\) pdf.text('Available 24/7 in multiple languages', 120, 95\)  
 pdf.save(${restaurantName}-gustia-qr.pdf) } 

* 

\#\#\# Verification  
\- npm run build passes  
\- QR codes generate for each restaurant  
\- PDF downloads work

* \- Mobile scan works  
* \--- **PROMPT 24 — Usage Cap Enforcement**

Read first: app/api/chat/route.ts, lib/billing/usage.ts, docs/PRICING\_DECISION.md

* \<output\_contract\>

Implement usage cap enforcement. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# What to build

\#\#\# Usage Tracking  
Track queries per restaurant to enforce the usage cap.

* \*\*1. Create usage table in Supabase\*\*  
* sql CREATE TABLE usage\_logs ( id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), restaurant\_id UUID REFERENCES restaurants(id), query\_count INTEGER DEFAULT 0,  
* period\_start DATE, period\_end DATE, created\_at TIMESTAMP DEFAULT now() );

\*\*2. Create usage tracking API\*\*

* File: app/api/usage/track/route.ts  
* typescript // Increment usage counter // Check if over cap // Return remaining queries  
* \*\*3. Update chat API\*\*

File: app/api/chat/route.ts

* Before processing chat:  
* typescript const usage \= await checkUsage(restaurantId) if (usage.remaining \<= 0\) { return NextResponse.json({ error: 'Usage cap reached', message: 'Upgrade to continue', upgradeUrl: '/admin/billing' }, { status: 429 }) }  
* \*\*4. Add usage cap to .env.local\*\*  
* USAGE\_CAP\_PER\_MONTH=2000

\*\*5. Admin usage display\*\*  
File: app/admin/analytics/page.tsx

Show:  
\- Queries used this month  
\- Queries remaining  
\- % of cap used

\#\#\# Verification  
\- npm run build passes  
\- Usage increments on each chat message  
\- Returns warning at 80% cap

* \- Blocks at 100% cap with upgrade prompt  
* \--- **PROMPT 25 — Stripe Subscription \+ Webhook**

Read first: app/api/stripe/webhook/route.ts, docs/PRICING\_DECISION.md

\<output\_contract\>  
Implement full Stripe subscription flow with proper webhook handling. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# What to build

* \#\#\# Stripe Subscription Flow

\*\*1. Create subscription checkout\*\*

* File: app/api/stripe/subscribe/route.ts  
* typescript import Stripe from 'stripe' const stripe \= new Stripe(process.env.STRIPE\_SECRET\_KEY\!) export async function POST(req: NextRequest) { const { restaurantId, plan } \= await req.json()  
   // Get or create Stripe customer const session \= await stripe.checkout.sessions.create({ customer\_email: ownerEmail, line\_items: \[{ price\_data: {

currency: 'eur', product\_data: { name: Gustia ${plan} }, unit\_amount: plan \=== 'monthly' ? 4900 : 47000, recurring: { interval: plan \=== 'monthly' ? 'month' : 'year' } }, quantity: 1 }\], mode: 'subscription', success\_url: ${baseUrl}/admin/billing?success=true, cancel\_url: ${baseUrl}/admin/billing?canceled=true, metadata: { restaurantId } })  
 return NextResponse.json({ url: session.url }) } 

* 

\*\*2. Update webhook handler\*\*  
File: app/api/stripe/webhook/route.ts

Handle events:  
\- \`checkout.session.completed\` → Create subscription record  
\- \`invoice.paid\` → Update subscription status  
\- \`invoice.payment\_failed\` → Send warning email  
\- \`customer.subscription.deleted\` → Mark as canceled

* \*\*3. Add billing ledger table\*\*  
* sql CREATE TABLE billing\_ledger ( id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), restaurant\_id UUID REFERENCES restaurants(id), event\_type TEXT, \-- 'subscription\_created' | 'payment' | 'failed' | 'canceled'  
* amount INTEGER, \-- cents stripe\_event\_id TEXT, created\_at TIMESTAMP DEFAULT now() );

\*\*4. Customer portal\*\*

* File: app/api/stripe/portal/route.ts

typescript const session \= await stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return\_url: ${baseUrl}/admin/billing }) return NextResponse.json({ url: session.url }) 

* 

\#\#\# Verification  
\- npm run build passes  
\- Subscription checkout works  
\- Webhook updates database

* \- Customer portal accessible  
* \--- **PROMPT 26 — Referral System**  
* Read first: app/admin/referral/page.tsx, docs/SPEC.md

\<output\_contract\>  
Build referral system logic. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# What to build

\#\#\# Referral System: "Give 1 Month Free, Get 1 Month Free"

* \*\*1. Create referral table\*\*  
* sql CREATE TABLE referrals ( id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), referrer\_restaurant\_id UUID REFERENCES restaurants(id), referred\_restaurant\_id UUID REFERENCES restaurants(id),  
* status TEXT DEFAULT 'pending', \-- 'pending' | 'completed' | 'rewarded' reward\_months INTEGER DEFAULT 1, created\_at TIMESTAMP DEFAULT now() ); CREATE TABLE referral\_codes ( id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), restaurant\_id UUID REFERENCES restaurants(id), code TEXT UNIQUE, created\_at TIMESTAMP DEFAULT now() );

\*\*2. Generate referral code\*\*

* File: app/api/referral/code/route.ts  
* typescript  
* // Generate unique code: GUSTIA-{restaurant\_name\_short}-{random} const code \= GUSTIA-${nameSlug}-${shortId}

\*\*3. Apply referral\*\*

* File: app/api/referral/apply/route.ts  
* typescript // When new restaurant signs up with code: // 1\. Give new restaurant 1 month free // 2\. When they pay, give referrer 1 month credit

\*\*4. Update referral page\*\*

* File: app/admin/referral/page.tsx

\- Show referral code  
\- Show shareable link  
\- Show pending referrals  
\- Show earned rewards

\#\#\# Verification  
\- npm run build passes  
\- Codes generate for each restaurant

* \- Referral tracking works  
* **PROMPT 27 — Critical Missing Features**

Read first: docs/DOCUMENTATION\_AUDIT.md, docs/SPEC.md, app/\*\*/\*.tsx

\<output\_contract\>  
Build critical missing features: Usage Cap, QR PDF, Email Notifications, Language Switching. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# Build These (Priority Order)

\#\#\# 1\. Usage Cap Enforcement

* Files: app/api/chat/route.ts, lib/billing/usage.ts

\- Track queries per restaurant/month in Supabase  
\- Cap at 2000/month (env: USAGE\_CAP\_PER\_MONTH=2000)  
\- Warn at 80%, block at 100% with upgrade message  
\- Show usage meter in /admin/analytics

\#\#\# 2\. QR Code PDF Generator  
Files: app/admin/qr/page.tsx, app/api/qr/\[restaurantId\]/route.ts

\- npm install qrcode jspdf  
\- Generate QR PNG from chat URL  
\- Generate PDF with: QR code \+ restaurant name \+ "Scan to chat with our AI concierge"  
\- Download PNG \+ Download PDF buttons

\#\#\# 3\. Email Notifications

* Files: lib/email.ts, app/api/notifications/\*.ts

\- npm install nodemailer  
\- SMTP env vars: SMTP\_HOST, SMTP\_USER, SMTP\_PASS  
\- Send on: new\_lead, payment\_received, payment\_failed  
\- Templates for each notification type

\#\#\# 4\. Language Switching in AI  
Files: lib/languages.ts, app/api/chat/route.ts

\- Define 6 languages: EN, FR, ES, PT, IT, RU  
\- Inject language into system prompt in chat API  
\- Store selected language in restaurant record

* \---

\#\# Verification  
\- npm run build passes  
\- All pages load

* \- No console errors  
* \--- **PROMPT 28 — Growth & Polish**

Read first: docs/DOCUMENTATION\_AUDIT.md, app/admin/\*\*/\*.tsx

\<output\_contract\>

* Build growth features: Referral, Analytics, Voice Toggle, Refund, Waitlist, Zapier. Report what you did in plain language for Bidi to paste back to Ember.

\</output\_contract\>

\---

\#\# Build These

\#\#\# 1\. Referral System  
Files: app/admin/referral/page.tsx, app/api/referral/\*.ts

\- Generate unique code per restaurant (GUSTIA-{name}-{id})  
\- Tables: referral\_codes, referrals  
\- On signup with code: new restaurant gets 1 month free  
\- When new pays: referrer gets 1 month credit

* \- Track: pending → completed → rewarded

\#\#\# 2\. Owner Analytics Dashboard  
Files: app/admin/analytics/page.tsx, app/api/admin/analytics/route.ts

\- npm install recharts  
\- Charts: queries over time, top questions, language distribution  
\- Usage meter: used vs cap

\#\#\# 3\. Voice Mode Toggle  
Files: components/chat/VoiceModeToggle.tsx

\- Toggle: Auto-play vs Push-to-talk  
\- Save in sessionStorage  
\- Default: auto-play

* \#\#\# 4\. 14-Day Refund Mechanism

Files: app/api/stripe/refund/route.ts

\- Check signup date vs refund request date  
\- If within 14 days: trigger Stripe refund  
\- Mark restaurant status

\#\#\# 5\. Waitlist System  
Files: app/waitlist/page.tsx, app/api/waitlist/route.ts

\- Email form  
\- Store in waitlist table  
\- Show position number

\#\#\# 6\. Zapier/Make.com Integration

* Files: docs/INTEGRATIONS.md, app/api/webhooks/gustia/route.ts

\- REST webhook sender  
\- Events: new\_lead, payment\_received, subscription\_created  
\- Config URL in GUSTIA\_WEBHOOK\_URL env

\---

\#\# Verification  
\- npm run build passes  
\- All features visible

* \- Mobile responsive  
* **PROMPT 29 — Missing Pieces**

Read first: docs/DOCUMENTATION\_AUDIT.md, docs/SPEC.md, app/admin/\*\*/\*.tsx

\<output\_contract\>  
Build the remaining missing pieces: Lead Pipeline, Invite Flow, Stripe Subscription. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# Build These

\#\#\# 1\. Lead Status Pipeline

* Files: app/admin/leads/page.tsx, app/api/admin/leads/route.ts

Kanban board with stages:  
\- New → Contacted → Qualified → Demo → Won → Lost

Features:  
\- Drag and drop between stages  
\- Add notes per lead  
\- Show last contact date

* \- Auto-update Supabase on stage change  
* typescript const STAGES \= \['new', 'contacted', 'qualified', 'demo', 'won', 'lost'\]

\#\#\# 2\. Restaurant Owner Invite Flow

* Files: app/admin/invite/page.tsx, app/invite/\[code\]/page.tsx, app/api/invite/\*.ts

Owner flow:  
1\. Admin creates invite (enters email)  
2\. System generates unique invite code  
3\. Email sent to owner with link  
4\. Owner clicks link → signup/login  
5\. After auth: restaurant auto-linked to owner

* Tables:  
* sql CREATE TABLE invites ( id UUID PRIMARY KEY, restaurant\_id UUID, owner\_email TEXT, invite\_code TEXT UNIQUE, status TEXT DEFAULT 'pending',  
* expires\_at TIMESTAMP, created\_at TIMESTAMP );

\#\#\# 3\. Stripe Subscription Checkout  
Files: app/api/stripe/subscribe/route.ts, app/api/stripe/webhook/route.ts

Full subscription flow:  
\- Create Stripe checkout session (subscription mode)  
\- Handle: checkout.session.completed, invoice.paid, invoice.payment\_failed  
\- Update restaurant subscription\_status in Supabase

* \- Store Stripe customer\_id  
* typescript const session \= await stripe.checkout.sessions.create({ mode: 'subscription',  
* line\_items: \[{ price\_data: { currency: 'eur', product\_data: { name: 'Gustia Pro' }, unit\_amount: 4900, // €49/month recurring: { interval: 'month' } }, quantity: 1 }\], success\_url: ${base}/admin/billing?success, cancel\_url: ${base}/admin/billing?canceled })

\#\#\# 4\. Customer Portal

* Files: app/api/stripe/portal/route.ts

\`\`\`typescript  
// Allow users to manage subscription  
const portal \= await stripe.billingPortal.sessions.create({  
  customer: stripeCustomerId,  
  return\_url: \`${base}/admin/billing\`

* })  
* \---  
   **Verification**  
  * npm run build passes  
  * All flows work  
  * No console errors  
* **PROMPT 30 — Final Feature Completion**

Read first: docs/DOCUMENTATION\_AUDIT.md, docs/SPEC.md

\<output\_contract\>  
Final push to complete all features documented but not built. Report what you did in plain language for Bidi to paste back to Ember.  
\</output\_contract\>

\---

\#\# ALREADY STARTED (ensure complete)  
\- QR Code Generator  
\- Usage Cap  
\- Email Notifications

* \- Language Switching

\- Referral System  
\- Analytics

\#\# STILL NEEDED

\#\#\# 1\. Trial/Refund Mechanism  
Files: app/api/stripe/refund/route.ts

\- Check if signup within 14 days  
\- Trigger Stripe refund if valid  
\- Email confirmation to owner

\#\#\# 2\. Voice Mode Toggle UI

* Files: components/chat/VoiceModeToggle.tsx

\- Auto-play vs Push-to-talk toggle  
\- Persist in sessionStorage  
\- Visual indicator of current mode

\#\#\# 3\. Invite/Owner Flow (UI)  
Files: app/admin/invite/page.tsx, app/invite/\[code\]/page.tsx

\- Admin creates invite → email sent  
\- Owner clicks link → signs up → linked to restaurant

\---

\#\# VERIFICATION CHECKLIST

* Create: docs/FEATURE\_COMPLETION.md

* markdown  
   **Feature Completion Status**  
  | Feature | Status | |---------|--------| | QR Code PDF | ✅/❌ | | Usage Cap | ✅/❌ | | Email Notifications | ✅/❌ | | Language Switching | ✅/❌ | | Referral System | ✅/❌ | | Analytics Dashboard | ✅/❌ | | Voice Mode Toggle | ✅/❌ | | Refund Mechanism | ✅/❌ | | Invite Flow | ✅/❌ |

\---

\#\# FINAL VERIFICATION

After all done:  
1\. npm run build passes  
2\. All pages load without errors  
3\. No console errors  
4\. All features match documentation

* 5\. Ready for launch

