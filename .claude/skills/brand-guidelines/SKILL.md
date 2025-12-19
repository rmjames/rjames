---
name: Brand Guidelines
description: Enforces project brand guidelines including colors, spacing, and typography from the design system. Use when creating or modifying styles, components, or design elements.
allowed-tools: Read, Edit, Write, Grep
---

# Brand Guidelines Skill

This skill ensures all design work adheres to the project's established design system defined in `styles/main.css`.

## Design Tokens Reference

### Spacing Scale
Use these spacing tokens for consistent layouts:

- `--xxs`: 0.125rem (2px)
- `--xs`: 0.25rem (4px)
- `--s`: 0.5rem (8px)
- `--m`: 1rem (16px) — base unit
- `--l`: 1.25rem (20px)
- `--xl`: 1.5rem (24px)
- `--xxl`: 2rem (32px)
- `--xxxl`: 3rem (48px)

**Usage:** Prefer CSS custom properties over hardcoded values.
```css
padding: var(--m);
margin-block-end: var(--xxl);
gap: var(--s);
```

### Color Palette

#### Neutrals (Light Mode)
- `--white-1`: hsl(200, 8%, 88%) — primary white
- `--white-2`: hsl(0, 0%, 88%) — secondary white
- `--black-1`: hsl(360 0% 0%) — pure black
- `--black-2`: hsl(46 94% 119%) — accent black
- `--black-3`: hsl(200 0% 16%) — primary dark
- `--black-4`: hsl(0 0% 20%) — secondary dark
- `--black-5`: hsl(0 0% 47%) — mid gray

#### Grays
- `--gray-1`: hsl(200, 8%, 45%) — primary gray
- `--gray-2`: #6d7f88 — secondary gray

#### Blues (Primary Brand)
- `--blue-1`: hsl(200 100% 32.9%) — dark blue
- `--blue-2`: hsl(201 44% 43%) — brand blue (links)
- `--blue-3`: hsl(204 100% 51%) — bright blue
- `--blue-4`: hsl(203 89.2% 52.9%) — accent blue

#### Oranges (Accent)
- `--orange-1`: hsla(30 60.7% 58% / 0.66) — text shadow
- `--orange-2`: hsl(38.8 100% 50%) — bright orange
- `--orange-3`: hsl(13.9 95.2% 67.1%) — coral
- `--orange-4`: #777 — muted orange

#### Semantic Colors
- `--color-brand`: hsl(200 11% 48%) — brand color
- `--text-color`: hsl(200 8% 16%) — body text
- `--link-color`: var(--blue-2) — link color
- `--selection-color`: var(--gray-1) — text selection
- `--text-shadow`: var(--orange-1) — text shadow

**Important:** Colors use OKLCH color space when supported via `@supports (color: rgb(from white r g b))` for better perceptual uniformity.

### Typography

#### Font Family
```css
--font-stack:
    "Recursive", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Open-sans, "Droid Sans", "Helvetica Neue", Helvetica, Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
```

Primary font: **Recursive** (variable font)

#### Font Sizes
- `--f-base`: 14px — minimum font size
- `--font-base`: clamp(var(--f-base), calc(var(--f-base) + 1.92vmin), 1.5rem) — responsive base

#### Recursive Variable Font Settings
Control the Recursive font's variable axes:

- `--recursive-wght`: 400 (default weight, range: 300-1000)
- `--recursive-CASL`: 0 (casual axis, 0 = linear, 1 = casual)
- `--recursive-MONO`: 0 (monospace axis, 0 = sans, 1 = mono)
- `--recursive-slnt`: 0 (slant, 0 = upright, -15 = italic)
- `--recursive-CRSV`: 0.5 (cursive, 0 = Roman, 1 = cursive)

**Example usage:**
```css
h1 {
    --recursive-wght: 700;
    --recursive-CASL: 0.64;
}
```

### Other Tokens

#### Border Radius
- `--border-radius`: var(--s) (8px)

#### Animation
- `--link-ease`: cubic-bezier(0.2, 0.8, 0.2, 1)
- `--link-timing`: 444ms

## Guidelines for Implementation

### DO:
✓ Always use CSS custom properties from the design system
✓ Maintain spacing scale consistency (multiply base units)
✓ Use semantic color tokens (--text-color, --link-color) over raw colors
✓ Leverage OKLCH colors for modern browser support
✓ Use Recursive font variable axes for expressive typography
✓ Follow the established animation timing and easing

### DON'T:
✗ Hardcode colors, spacing, or font values
✗ Create new spacing values outside the scale
✗ Use arbitrary color values not in the palette
✗ Override the font stack without justification
✗ Add new custom properties without updating this guide

## Workflow

When implementing design changes:

1. **Read** `styles/main.css:102-167` to verify current tokens
2. **Reference** this skill for correct token usage
3. **Use** existing tokens; propose new ones if necessary
4. **Test** in both light and dark modes (OKLCH support check)
5. **Document** any new tokens added to the system

## Dark Mode

The design system includes dark mode support. Key overrides:
```css
@media (prefers-color-scheme: dark) {
    --text-color: var(--white-1);
    --text-shadow: var(--white-2);
    --bkgnd: var(--black-3);
}
```

Ensure any new color usage respects the existing dark mode pattern.

## Questions?

If a design requires a token not in the system, consult with the team before adding it to maintain consistency.
