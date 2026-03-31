# Editorial Redesign Guidelines (Broadsheet, Cleaner Shell)

This document defines the current visual direction for the redesign: broadsheet editorial style with fewer unnecessary wrapper frames.

## Design Intent

- Feel like a modern internet newspaper, not a soft social feed.
- Prioritize hierarchy: headline first, image second, metadata/actions third.
- Keep visual punch while reducing border noise.

## Core Visual Rules

- **Shape language**: hard corners everywhere (`rounded-none`) unless a component has a functional reason not to.
- **Borders and shadows**: use 2px borders and offset shadows selectively on primary surfaces; avoid stacking multiple framed wrappers around the same section.
- **Surface palette**: warm paper background (`#f7f4ee`), white content surfaces, high-contrast text.
- **Typography**:
  - Headlines: uppercase, heavy (`font-black`), tight tracking.
  - Body/meta: neutral sans, regular/medium.
  - Labels/chips: uppercase micro text with wider tracking.
- **Spacing rhythm**: 8px base with 8/12/16/24 spacing steps.
- **Icons/chips**: purposeful only; no decorative icon clutter.

## Framing Rules (Important)

- Use one dominant frame per section, not nested frames at every level.
- Prefer framing inner functional panels (card/canvas/control panel) over framing both page shell and panel shell.
- Keep background sections simple when inner cards already carry borders/shadows.
- If a layout feels "boxed in," remove outer wrappers first.

## Component Blueprint

### 1) Page Shell
- Use warm paper background as default.
- Keep top-level wrappers light; avoid double-framing with both outer and inner heavy borders.
- Avoid soft glows, blur-heavy layers, and glass effects.

### 2) Meme Card (Broadsheet)
- Hard-edge card shell, dense structure, clear visual hierarchy.
- Headline is loud and concise (1-2 lines preferred).
- Metadata stays compact; category can sit inline with title when space allows.
- Image should be hard-edge and content-first.

### 3) Generator / Editor Surfaces
- Template, canvas, and controls should use consistent hard-edge language.
- Remove rounded corners from template tiles/thumbnails/selectors.
- Keep panel hierarchy clear without over-framing every nested container.

### 4) Buttons and Controls
- Prefer high-contrast outline/default button styles.
- Keep labels short and explicit.
- Avoid soft pill shapes except when intentionally used for compact badges.

## Do / Don’t

- **Do** use contrast and typography to establish hierarchy first.
- **Do** use borders to clarify structure, not decorate everything.
- **Do** keep components dense and readable.
- **Don’t** stack multiple heavy borders/shadows around the same content.
- **Don’t** mix soft UI aesthetics (glassmorphism/neumorphism) into editorial pages.
- **Don’t** rely on color alone to indicate state.

## Prompt Template For Future UI Tasks

Use this in future prompts to keep implementation consistent:

```text
Use the "Broadsheet Editorial (Cleaner Shell)" system for this UI work.

Style requirements:
- Hard edges (rounded-none) for cards, panels, template tiles, and thumbnails
- Warm paper page background (#f7f4ee) with white content surfaces
- 2px high-contrast borders and offset shadows on primary surfaces only
- Uppercase heavy headlines with tight tracking
- No glassmorphism, no blur-heavy decorative layers

Layout requirements:
- Clear hierarchy: headline -> content/image -> metadata/actions
- 8px spacing rhythm (8/12/16/24)
- Avoid nested wrapper framing; one dominant frame per section

Deliver:
- Updated components aligned to this system
- Reduced border noise (remove unnecessary outer wrappers)
- Dark mode parity with equivalent contrast
```

## Rollout Plan

1. Keep homepage and generator aligned to cleaner-shell framing rules.
2. Apply same border discipline to `/memes` list and sidebar/filter layout.
3. Audit detail/editor sub-panels to remove redundant nested borders.
4. Document reusable utility class patterns for framed vs unframed sections.
