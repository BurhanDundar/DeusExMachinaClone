# Inferred design system

## Visual language

The reference uses an almost borderless, editorial canvas: near-black type, warm white surfaces, very large photography, narrow condensed headings and restrained interaction. This implementation keeps that rhythm while using an original brand, copy and imagery.

## Layout

- Page width: fluid, full-bleed at desktop with 12–16px gutters; mobile uses 12px gutters.
- Header: 96px desktop, 92px mobile; sticky white surface after the transparent hero state.
- Breakpoints: compact below 768px, tablet 768–1023px, desktop from 1024px.
- Product rail: 2 columns on compact screens and 4 columns on desktop. Desktop cards are airy; image area is approximately 4:5.
- Campaign media: 16:9 to 2:1 desktop; 4:5 and 3:4 mobile with `object-fit: cover`.
- Section rhythm: 80–140px desktop, 56–80px mobile. Media-grid gutters are 8–12px.

## Typography

- UI/body: Arial/Helvetica system sans for robust rendering.
- Display: condensed system stack; uppercase, tight tracking, bold.
- Scale: 14px metadata, 18–24px labels, 32–64px campaign headings.

## Interaction

- Product imagery gently scales and swaps on pointer hover.
- Quick-add reveals size choices in place; choosing a size adds to the persistent Zustand cart.
- Desktop navigation opens a quiet mega panel; mobile uses a full-height drawer.
- Cart and search use right-side drawers with a dimmed backdrop.
- Motion duration is 180–260ms and respects reduced motion.

## Footer

Desktop uses four equal information zones on a light grey field. Mobile turns link groups into compact stacked disclosures while the newsletter remains expanded.

## Accessibility

Semantic landmarks, visible focus rings, labeled controls, Escape-to-close patterns, minimum 44px touch targets, reduced-motion support and no hover-only mobile behavior.
