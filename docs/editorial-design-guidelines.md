# Editorial Redesign Guidelines (Broadsheet First)

This document defines the design direction for the website redesign based on the first editorial meme card style (`broadsheet`).

## Design Intent

- Feel like a modern internet newspaper, not a soft social feed.
- Prioritize hierarchy: headline first, image second, metadata third.
- Keep personality high while preserving readability and speed.

## Core Visual Rules

- **Card shell**: hard corners (`rounded-none`), 2px black border, strong offset shadow.
- **Surface palette**: warm paper background (`#f7f4ee`), white content blocks, black text.
- **Typography**:
  - Headlines: uppercase, heavy weight (`font-black`), tight tracking.
  - Body/meta: neutral sans, regular to medium.
  - Labels: uppercase micro text with wider tracking.
- **Spacing rhythm**: 8px base; prefer 8/12/16/24 spacing increments.
- **Icons/chips**: minimal use, never decorative-only.

## Component Blueprint

### 1) Page Shell
- Background: warm neutral paper tone.
- Main sections: bordered blocks with offset shadow.
- Avoid soft glows and soft shadows.

### 2) Meme Card (Broadsheet)
- Top: optional kicker strip for context ("Breaking Meme", "Opinion", etc.).
- Image: full width, hard edges, no rounded corners.
- Headline: 1-2 lines max, uppercase heavy.
- Footer row: category chip (left), render style/time (right).

### 3) Buttons and Controls
- Prefer outline/default with strong contrast.
- Avoid overly rounded pills unless used intentionally as badges.
- Keep control labels short and explicit.

## Do / Don’t

- **Do** use contrast and borders to define structure.
- **Do** keep cards dense and punchy.
- **Do** use uppercase strategically for hierarchy.
- **Don’t** mix soft glassmorphism in core editorial pages.
- **Don’t** over-stack decorative layers.
- **Don’t** rely only on color to communicate state.

## Prompt Template For Future UI Tasks

Use this in future prompts to keep design consistent:

```text
Use the "Broadsheet Editorial" design system for this UI work.

Style requirements:
- Hard-edge cards (no rounded corners), 2px black border, strong offset shadow
- Warm paper page background (#f7f4ee), white content surfaces
- Uppercase bold headlines with tight tracking
- Minimal, high-contrast controls and chips
- No glassmorphism, no soft neumorphism, no decorative blur-heavy UI

Layout requirements:
- Clear hierarchy: headline -> image/content -> metadata/actions
- 8px spacing rhythm (8/12/16/24)
- Keep components dense but readable

Deliver:
- Reusable component styles/tokens
- Updated sections matching this system
- Keep dark mode parity with equivalent contrast
```

## Rollout Plan

1. Apply shell and typography system to homepage sections.
2. Update `/memes` listing cards to broadsheet variant.
3. Align sidebar/filter controls to the same contrast language.
4. Audit detail page and upload/editor screens for consistency.
