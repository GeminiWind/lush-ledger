# Design Tokens

## Colors

### Primary
- --color-primary: #006f1d
- --color-primary-dim: #006118
- --color-on-primary: #ffffff

### Secondary
- --color-secondary-container: #e7f6ff
- --color-on-secondary-container: #1b3641

### Surface
- --color-surface: #f4faff
- --color-surface-container-low: #e7f6ff
- --color-surface-container-lowest: #ffffff
- --color-surface-container-highest: #cbe7f6

### Text
- --color-on-surface: #1b3641
- --color-on-surface-variant: #6b8a99

### Outline / Border
- --color-outline-variant: #9bb6c4

### Semantic
- --color-success: var(--color-primary)
- --color-error: #ef4444

---

## Opacity

- --opacity-glass: 0.8
- --opacity-shadow: 0.06
- --opacity-ghost-border: 0.15
- --opacity-focus-border: 0.4

---

## Spacing

- --spacing-1: 4px
- --spacing-2: 8px
- --spacing-3: 12px
- --spacing-4: 16px
- --spacing-6: 24px
- --spacing-8: 32px
- --spacing-10: 40px

---

## Border Radius

- --radius-md: 6px   /* 0.375rem */
- --radius-lg: 8px   /* optional */
- --radius-xl: 12px  /* 0.75rem */

---

## Typography

### Font Family
- --font-display: "Manrope", sans-serif
- --font-body: "Inter", sans-serif

### Font Sizes

#### Display
- --font-display-lg: 40px
- --font-headline-md: 28px

#### Body
- --font-body-md: 16px

#### Label
- --font-label-md: 14px
- --font-label-sm: 12px

---

## Elevation / Shadow

- --shadow-ambient: 0px 8px 32px rgba(27, 54, 65, 0.06)

---

## Blur

- --blur-glass: 20px

---

## Gradient

- --gradient-primary: linear-gradient(135deg, #006f1d, #006118)

---

## Motion

- --easing-standard: cubic-bezier(0.2, 0, 0, 1)

---

## Component Tokens

### Button

- --btn-radius: var(--radius-xl)
- --btn-padding-x: var(--spacing-4)
- --btn-padding-y: var(--spacing-2)

### Card

- --card-radius: var(--radius-xl)
- --card-bg: var(--color-surface-container-lowest)

### Input

- --input-bg: var(--color-surface-container-low)
- --input-radius: var(--radius-md)
- --input-focus-border: 2px solid rgba(0, 111, 29, var(--opacity-focus-border))

---

## Special Effects

### Glass
- background: rgba(255, 255, 255, var(--opacity-glass))
- backdrop-blur: var(--blur-glass)

### Ghost Border
- border: 1px solid rgba(155, 182, 196, var(--opacity-ghost-border))

---

## Rules

### No-Line Rule
- Do NOT use 1px solid borders for layout
- Use spacing or surface layering instead

### Layering

1. surface
2. surface-container-low
3. surface-container-lowest
4. surface-container-highest

---

## Usage Rules

- Always use tokens, never hardcode values
- Use spacing instead of dividers
- Use tonal layering instead of borders
- Use gradients for primary CTA only