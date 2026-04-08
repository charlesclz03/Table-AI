# Gustia UX Flow

Last updated: 2026-04-05

## Guest Journey

### 1. QR Scan

- guest scans a table QR code
- QR opens `/chat/[restaurantId]?table=Tn`

### 2. Language Selection

- route: `/chat/[restaurantId]/onboarding/language`
- languages:
  - English
  - French
  - Spanish
  - Portuguese
  - Italian
  - Russian
- selected language is stored in `sessionStorage`

### 3. Theme Selection

- route: `/chat/[restaurantId]/onboarding/theme`
- current guest-selectable themes:
  - Red Wine
  - White Wine
  - Rose
  - Green Wine
- the selector is orbital and swipeable
- each theme can preview localized greeting copy and voice
- selected theme is stored in `sessionStorage`

### 4. Chat Interface

- route: `/chat/[restaurantId]`
- top bar shows:
  - restaurant name
  - table number
  - language/theme change shortcuts
- guest can:
  - type
  - press and hold to talk
- concierge replies use:
  - OpenAI TTS first
  - browser fallback if needed
- subtitles are always visible
- after three guest messages, the demo CTA appears

## Owner Journey

### 1. Pricing Entry

- owner starts on `/`
- chooses monthly or annual

### 2. Owner Auth

- route: `/auth/login`
- owner can:
  - create account
  - sign in with email/password
  - continue with Google when configured

### 3. Authenticated Checkout

- route: `/auth/checkout`
- Stripe checkout is launched from the signed-in owner session

### 4. Owner Admin

Main owner routes:

- `/admin`
- `/admin/onboarding`
- `/admin/menu`
- `/admin/quiz`
- `/admin/qr`
- `/admin/billing`
- `/admin/analytics`
- `/admin/invite`
- `/admin/changelog`

