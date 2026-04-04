# Gustia â€” UX/UX Flow
**Date:** 2026-04-03
**Status:** DOCUMENTED

---

## Customer Journey â€” From QR to Conversation

### Step 1: QR Code Scan
- Customer scans QR code on table
- Opens: `/chat/[restaurantId]?table=T2`
- URL includes restaurant ID + table number

### Step 2: Language Selection
**Screen:** Full-page language picker

Available languages:
| Code | Language | Flag |
|------|----------|------|
| US | English ðŸ‡ºðŸ‡¸ | US flag |
| FR | French ðŸ‡«ðŸ‡· | FR flag |
| ES | Spanish ðŸ‡ªðŸ‡¸ | ES flag |
| IT | Italian ðŸ‡®ðŸ‡¹ | IT flag |
| PT | Portuguese ðŸ‡µðŸ‡¹ | PT flag |
| RU | Russian ðŸ‡·ðŸ‡º | RU flag |

**Design:** Clean grid of language options, flags visible, tap to select.

**Behavior:** Selected language persists for entire session.

---

### Step 3: Wine Theme Selection
**Screen:** Theme picker (4 options)

Theme options:
| Theme | Visual | Voice Character |
|-------|--------|----------------|
| Red Wine | Deep burgundy sphere | Warm, full-bodied |
| White Wine | Pale gold sphere | Light, crisp |
| RosÃ© | Pink sphere | Fresh, fruity |
| Champagne | Gold sparkle sphere | Bright, effervescent |
| Green Wine ðŸ‡µðŸ‡¹ | Pale green sphere | Fresh, youthful, Portuguese specialty |

**Design:** 4 sphere previews, tap to select, animated preview.

**Behavior:** Selected theme persists for entire session.

---

### Step 4: Chat Interface
**Screen:** Full chat experience

Layout:
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [Restaurant Name]       â”‚
â”‚  Table 2     [Lang] [ðŸŒ™] â”‚  â† Top bar
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                         â”‚
â”‚                         â”‚
â”‚      â”Œâ”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚      â”‚ â—¯â—¯â—¯â—¯  â”‚         â”‚  â† Glassy wine sphere
â”‚      â”‚ ~~â”‚~~ â”‚         â”‚     (animated)
â”‚      â””â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚                         â”‚
â”‚   "What can I help      â”‚  â† Subtitles
â”‚    you with?"           â”‚
â”‚                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Type a message...]    â”‚  â† Input
â”‚           [ðŸŽ¤] [Send]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Theme-Specific Voice

### Red Wine Theme
- **Voice:** Warm, deep, authoritative
- **Character:** Sophisticated waiter
- **Example:** "Good evening. I am your concierge this evening."
- **Tone:** Full-bodied, like a bold red

### White Wine Theme
- **Voice:** Light, crisp, refreshing
- **Character:** Friendly sommelier
- **Example:** "Hello! Let me help you explore our menu."
- **Tone:** Clean, like a chilled white

### RosÃ© Theme
- **Voice:** Fresh, friendly, approachable
- **Character:** Young, energetic host
- **Example:** "Hey! Looking for recommendations?"
- **Tone:** Fruity and fun

### Champagne Theme
- **Voice:** Bright, celebratory, premium
- **Character:** Elegant maitre d'
- **Example:** "Good evening! What brings you in tonight?"
- **Tone:** Sparkling, festive

---

## Technical Notes

### Language Persistence
- Store selected language in sessionStorage
- Pass language in API calls to GPT-4o mini
- System prompt uses selected language

### Theme Persistence
- Store selected theme in sessionStorage
- Sphere color/animation reflects theme
- Voice selection tied to theme

### QR Code Data
```
/chat/[restaurantId]?table=[TABLE_NUMBER]&lang=[DEFAULT]
```
- Default language: EN
- Customer can change on arrival

---

## Splash Screen (Optional)

While loading:
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         â”‚
â”‚        â—¯â—¯â—¯â—¯            â”‚  â† Animated sphere
â”‚        ~~â”‚~~            â”‚
â”‚                         â”‚
â”‚    [Restaurant Name]     â”‚
â”‚                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Back Navigation

- Language/theme can be changed via icons in top bar
- Tapping icon returns to that selection screen
- Session state preserved when switching
