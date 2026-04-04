# Gustia â€” UI/UX Design Language
**Date:** 2026-04-03
**Status:** LOCKED

---

## AI Entity Design â€” The Glassy Wine Sphere

### Core Visual Concept
A **glassy sphere** at the center of the screen, **half-filled with wine**. The wine inside moves like a wave while the AI is talking. Like a crystal ball with liquid inside.

### Visual Effects
- **Glassy/translucent sphere** â€” glassmorphism, frosted glass aesthetic, like a crystal orb
- **Wine level** â€” exactly half-filled, wine at the bottom half
- **Wave animation** â€” wine moves like a gentle wave inside the sphere while talking (sloshing effect)
- **Pulsating animation** â€” slow, rhythmic pulse when idle
- **Centered on screen** â€” the AI entity is the focal point
- **Subtle glow** â€” warm amber glow around the sphere

### Animation Specs
```
- Sphere pulse (idle): scale 1 â†’ 1.05 â†’ 1, 3s ease-in-out infinite
- Wine wave (while talking): gentle sloshing motion inside sphere, CSS keyframes
- Wine level: always bottom half of sphere
- Glow pulse: 0.2 â†’ 0.4 â†’ 0.2 opacity, 3s infinite
- Glass shimmer: subtle light refraction across sphere surface
```

### Color Palette
- Primary glass: rgba(255, 255, 255, 0.1) with blur
- Wine accent: deep burgundy #722F37 to purple #4A0E0E
- Glow: warm amber #F59E0B at 20% opacity
- Background: dark gradient (night/restaurant ambiance)

### Typography
- Clean, modern sans-serif
- White/light text on dark
- Subtle text shadows for readability

### Spatial System
- Full-screen mobile layout
- Avatar centered vertically and horizontally
- Subtitles below avatar
- Input controls at bottom
- Minimal UI chrome â€” the glass entity is the hero

---

## Wine Theme Color Variants

The sphere adapts to the restaurant's wine selection (5 themes):

### White Wine Theme
- Wine color: #F7E7CE (pale gold)
- Glow: #F7E7CE at 30% opacity
- Ambient: warm golden light

### RosÃ© Theme
- Wine color: #FFB6C1 to #F08080 (pink gradient)
- Glow: #FFB6C1 at 30% opacity
- Ambient: soft pink light

### Red Wine Theme
- Wine color: #722F37 (burgundy)
- Glow: #722F37 at 30% opacity
- Ambient: deep warm red light

### Champagne Theme
- Wine color: #F5E6C8 (pale champagne gold)
- Glow: #F5E6C8 at 40% opacity (brighter)
- Ambient: effervescent sparkle

### Green Wine Theme (Vinho Verde â€” Portugal)
- Wine color: #C9E4CA (pale green)
- Glow: #90EE90 at 35% opacity
- Ambient: fresh, youthful, slightly sparkling energy
- **Portuguese specialty â€” perfect for Lisbon restaurants**

### Default (Restaurant Chooses)
- Red Wine theme as default
- Restaurant selects their theme during onboarding quiz

---

## Theme-Specific Voice Personality

Each wine theme has a distinct voice character:

| Theme | Voice Character | Example |
|-------|----------------|---------|
| Red Wine | Warm, deep, sophisticated waiter | "Good evening. I am your concierge." |
| White Wine | Light, crisp, friendly sommelier | "Hello! Let me help you explore." |
| RosÃ© | Fresh, fruity, approachable host | "Hey! Looking for recommendations?" |
| Champagne | Bright, celebratory, premium maitre d' | "Good evening! What brings you in?" |
| Green Wine ðŸ‡µðŸ‡¹ | Fresh, youthful, slightly sparkling | "Hey! New to the menu? Let me show you around." |

## Splash Screen

Brief loading state while app initializes:
- Restaurant name displayed
- Animated sphere plays
- Smooth transition to language selection

## Splash Screen

Brief loading state while app initializes:
- Restaurant name displayed
- Animated sphere plays
- Smooth transition to language selection
