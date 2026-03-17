# Avenue Z — Brand & Design System

## Philosophy

Dark-first, high-contrast, premium tech aesthetic. Every surface should feel
intentional. **Default to dark mode — do not build a light mode toggle.**

---

## Color Tokens

```css
/* Backgrounds */
--bg-primary:   #000000   /* page root */
--bg-surface:   #272727   /* cards, inputs, panels */
--bg-subtle:    #1a1a1a   /* section dividers */

/* Text */
--text-primary: #FFFFFF
--text-muted:   #8A8A8A

/* Accent colors */
--yellow:  #FFFC60
--green:   #60FF80
--cyan:    #60FDFF
--blue:    #39A0FF
--purple:  #6034FF
```

## Tailwind Config Extension

Add to `tailwind.config.ts` under `theme.extend`:

```typescript
colors: {
  'brand-yellow':  '#FFFC60',
  'brand-green':   '#60FF80',
  'brand-cyan':    '#60FDFF',
  'brand-blue':    '#39A0FF',
  'brand-purple':  '#6034FF',
  'bg-surface':    '#272727',
  'bg-subtle':     '#1a1a1a',
  'text-muted':    '#8A8A8A',
},
fontFamily: {
  sans: ['Nunito Sans', 'sans-serif'],
},
borderRadius: {
  pill: '9999px',
},
```

## Gradients (inline CSS only — not Tailwind classes)

```css
/* Full brand gradient */
linear-gradient(135deg, #FFFC60, #60FF80, #60FDFF, #39A0FF, #6034FF)

/* Revenue (warm) */
linear-gradient(135deg, #FFFC60, #60FF80, #60FDFF)

/* Reputation (cool) */
linear-gradient(135deg, #60FDFF, #39A0FF, #6034FF)
```

### Where to apply gradients:
- CTA button backgrounds
- Gradient text on bold display headings (`background-clip: text`)
- Section divider lines (1px height)
- Top-edge accent on KPI/score cards (2px `::before` pseudo-element)

## Typography

Import in `app/layout.tsx`:

```typescript
import { Nunito_Sans } from 'next/font/google'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800', '900'],
  variable: '--font-nunito',
})
```

Apply `className={nunitoSans.variable}` to `<html>` tag. Set
`font-family: var(--font-nunito), sans-serif` on `body` via Tailwind
(`font-sans` after config update).

## Component Patterns

### Cards

```css
background: #272727;
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.06);
padding: 24px;
```

### CTA Button (gradient fill)

```css
background: linear-gradient(135deg, #FFFC60, #60FF80, #60FDFF);
color: #000000;
border: none;
border-radius: 9999px;
padding: 14px 32px;
font-weight: 800;
font-size: 14px;
letter-spacing: 0.06em;
text-transform: uppercase;
cursor: pointer;
```

### Secondary Button (dark pill)

```css
background: #3a3a3a;
color: #FFFFFF;
border: none;
border-radius: 9999px;
padding: 12px 24px;
font-weight: 700;
```

### Text Input

```css
background: #272727;
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
padding: 14px 18px;
color: #FFFFFF;
font-size: 16px;
```

On focus: `border-color: #60FDFF; box-shadow: 0 0 0 2px rgba(96,253,255,0.15)`

### Gradient Divider Line

```html
<div style="height:1px; background: linear-gradient(135deg, #FFFC60, #60FF80, #60FDFF, #39A0FF, #6034FF)" />
```

### Gradient Text Heading

```css
background: linear-gradient(135deg, #FFFC60, #60FF80, #60FDFF, #39A0FF, #6034FF);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
font-weight: 800;
```
