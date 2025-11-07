# Tailwind CSS Reference Guide

Quick reference for all Tailwind utility values used in the project.

---

## Typography

### Font Sizes

| Class | Size (px) | Size (rem) | Line Height |
|-------|-----------|------------|-------------|
| `text-xs` | 12px | 0.75rem | 16px (1rem) |
| `text-sm` | 14px | 0.875rem | 20px (1.25rem) |
| `text-base` | 16px | 1rem | 24px (1.5rem) |
| `text-lg` | 18px | 1.125rem | 28px (1.75rem) |
| `text-xl` | 20px | 1.25rem | 28px (1.75rem) |
| `text-2xl` | 24px | 1.5rem | 32px (2rem) |
| `text-3xl` | 30px | 1.875rem | 36px (2.25rem) |
| `text-4xl` | 36px | 2.25rem | 40px (2.5rem) |
| `text-5xl` | 48px | 3rem | 48px (1) |
| `text-6xl` | 60px | 3.75rem | 60px (1) |
| `text-7xl` | 72px | 4.5rem | 72px (1) |
| `text-8xl` | 96px | 6rem | 96px (1) |
| `text-9xl` | 128px | 8rem | 128px (1) |

**Custom Sizes:**
- `text-15` → 15px / 0.9375rem (used for body text)
- `text-13` → 13px / 0.8125rem (if defined)

### Font Weights

| Class | Weight | Numeric Value |
|-------|--------|---------------|
| `font-thin` | Thin | 100 |
| `font-extralight` | Extra Light | 200 |
| `font-light` | Light | 300 |
| `font-normal` | Normal | 400 |
| `font-medium` | Medium | 500 |
| `font-semibold` | Semibold | 600 |
| `font-bold` | Bold | 700 |
| `font-extrabold` | Extra Bold | 800 |
| `font-black` | Black | 900 |

### Line Heights

| Class | Value | Multiplier |
|-------|-------|------------|
| `leading-none` | 1 | line-height: 1 |
| `leading-tight` | 1.25 | line-height: 1.25 |
| `leading-snug` | 1.375 | line-height: 1.375 |
| `leading-normal` | 1.5 | line-height: 1.5 |
| `leading-relaxed` | 1.625 | line-height: 1.625 |
| `leading-loose` | 2 | line-height: 2 |

### Letter Spacing (Tracking)

| Class | Value | Description |
|-------|-------|-------------|
| `tracking-tighter` | -0.05em | Very tight spacing |
| `tracking-tight` | -0.025em | Tight spacing |
| `tracking-normal` | 0em | Normal spacing (default) |
| `tracking-wide` | 0.025em | Wide spacing |
| `tracking-wider` | 0.05em | Wider spacing |
| `tracking-widest` | 0.1em | Widest spacing |

**Note**: `em` is relative to the font size, so `0.05em` on a 16px font = 0.8px spacing.

---

## Spacing Scale

Tailwind uses a consistent spacing scale where each unit = 0.25rem = 4px.

### Padding & Margin Values

| Class | Size (px) | Size (rem) | Example |
|-------|-----------|------------|---------|
| `p-0`, `m-0` | 0px | 0rem | No spacing |
| `p-px`, `m-px` | 1px | - | 1px border |
| `p-0.5`, `m-0.5` | 2px | 0.125rem | Very tiny |
| `p-1`, `m-1` | 4px | 0.25rem | |
| `p-1.5`, `m-1.5` | 6px | 0.375rem | |
| `p-2`, `m-2` | 8px | 0.5rem | |
| `p-2.5`, `m-2.5` | 10px | 0.625rem | |
| `p-3`, `m-3` | 12px | 0.75rem | |
| `p-3.5`, `m-3.5` | 14px | 0.875rem | |
| `p-4`, `m-4` | 16px | 1rem | |
| `p-5`, `m-5` | 20px | 1.25rem | |
| `p-6`, `m-6` | 24px | 1.5rem | |
| `p-7`, `m-7` | 28px | 1.75rem | |
| `p-8`, `m-8` | 32px | 2rem | |
| `p-9`, `m-9` | 36px | 2.25rem | |
| `p-10`, `m-10` | 40px | 2.5rem | |
| `p-11`, `m-11` | 44px | 2.75rem | |
| `p-12`, `m-12` | 48px | 3rem | |
| `p-14`, `m-14` | 56px | 3.5rem | |
| `p-16`, `m-16` | 64px | 4rem | |
| `p-20`, `m-20` | 80px | 5rem | |
| `p-24`, `m-24` | 96px | 6rem | |
| `p-28`, `m-28` | 112px | 7rem | |
| `p-32`, `m-32` | 128px | 8rem | |
| `p-36`, `m-36` | 144px | 9rem | |
| `p-40`, `m-40` | 160px | 10rem | |
| `p-44`, `m-44` | 176px | 11rem | |
| `p-48`, `m-48` | 192px | 12rem | |
| `p-52`, `m-52` | 208px | 13rem | |
| `p-56`, `m-56` | 224px | 14rem | |
| `p-60`, `m-60` | 240px | 15rem | |
| `p-64`, `m-64` | 256px | 16rem | |
| `p-72`, `m-72` | 288px | 18rem | |
| `p-80`, `m-80` | 320px | 20rem | |
| `p-96`, `m-96` | 384px | 24rem | |

### Directional Spacing

You can apply spacing to specific sides:
- **t** = top (e.g., `pt-4`, `mt-4`)
- **r** = right (e.g., `pr-4`, `mr-4`)
- **b** = bottom (e.g., `pb-4`, `mb-4`)
- **l** = left (e.g., `pl-4`, `ml-4`)
- **x** = horizontal (left & right) (e.g., `px-4`, `mx-4`)
- **y** = vertical (top & bottom) (e.g., `py-4`, `my-4`)

---

## Border Radius

| Class | Size (px) | Size (rem) | Description |
|-------|-----------|------------|-------------|
| `rounded-none` | 0px | 0rem | No rounding |
| `rounded-sm` | 2px | 0.125rem | Small |
| `rounded` | 4px | 0.25rem | Default |
| `rounded-md` | 6px | 0.375rem | Medium |
| `rounded-lg` | 8px | 0.5rem | Large |
| `rounded-xl` | 12px | 0.75rem | Extra Large |
| `rounded-2xl` | 16px | 1rem | 2X Large |
| `rounded-3xl` | 24px | 1.5rem | 3X Large |
| `rounded-full` | 9999px | 9999px | Fully rounded (circle/pill) |

### Directional Radius

Apply radius to specific corners:
- **t** = top (both corners) (e.g., `rounded-t-lg`)
- **r** = right (both corners) (e.g., `rounded-r-lg`)
- **b** = bottom (both corners) (e.g., `rounded-b-lg`)
- **l** = left (both corners) (e.g., `rounded-l-lg`)
- **tl** = top-left (e.g., `rounded-tl-lg`)
- **tr** = top-right (e.g., `rounded-tr-lg`)
- **br** = bottom-right (e.g., `rounded-br-lg`)
- **bl** = bottom-left (e.g., `rounded-bl-lg`)

---

## Width & Height

### Fixed Sizes

| Class | Size (px) | Size (rem) |
|-------|-----------|------------|
| `w-0`, `h-0` | 0px | 0rem |
| `w-px`, `h-px` | 1px | - |
| `w-0.5`, `h-0.5` | 2px | 0.125rem |
| `w-1`, `h-1` | 4px | 0.25rem |
| `w-2`, `h-2` | 8px | 0.5rem |
| `w-3`, `h-3` | 12px | 0.75rem |
| `w-4`, `h-4` | 16px | 1rem |
| `w-5`, `h-5` | 20px | 1.25rem |
| `w-6`, `h-6` | 24px | 1.5rem |
| `w-8`, `h-8` | 32px | 2rem |
| `w-10`, `h-10` | 40px | 2.5rem |
| `w-12`, `h-12` | 48px | 3rem |
| `w-16`, `h-16` | 64px | 4rem |
| `w-20`, `h-20` | 80px | 5rem |
| `w-24`, `h-24` | 96px | 6rem |
| `w-32`, `h-32` | 128px | 8rem |

### Fractional & Percentage Sizes

| Class | Value | Description |
|-------|-------|-------------|
| `w-full`, `h-full` | 100% | Full width/height |
| `w-screen`, `h-screen` | 100vw/100vh | Full viewport |
| `w-min`, `h-min` | min-content | Minimum content size |
| `w-max`, `h-max` | max-content | Maximum content size |
| `w-fit`, `h-fit` | fit-content | Fit to content |
| `w-1/2` | 50% | Half width |
| `w-1/3` | 33.333% | One third |
| `w-2/3` | 66.666% | Two thirds |
| `w-1/4` | 25% | Quarter |
| `w-3/4` | 75% | Three quarters |

---

## Gap (for Flexbox & Grid)

| Class | Size (px) | Size (rem) |
|-------|-----------|------------|
| `gap-0` | 0px | 0rem |
| `gap-1` | 4px | 0.25rem |
| `gap-2` | 8px | 0.5rem |
| `gap-3` | 12px | 0.75rem |
| `gap-4` | 16px | 1rem |
| `gap-5` | 20px | 1.25rem |
| `gap-6` | 24px | 1.5rem |
| `gap-8` | 32px | 2rem |
| `gap-10` | 40px | 2.5rem |
| `gap-12` | 48px | 3rem |
| `gap-16` | 64px | 4rem |

Use `gap-x-*` for horizontal gap, `gap-y-*` for vertical gap.

---

## Opacity

| Class | Value | Percentage |
|-------|-------|------------|
| `opacity-0` | 0 | 0% |
| `opacity-5` | 0.05 | 5% |
| `opacity-10` | 0.1 | 10% |
| `opacity-20` | 0.2 | 20% |
| `opacity-25` | 0.25 | 25% |
| `opacity-30` | 0.3 | 30% |
| `opacity-40` | 0.4 | 40% |
| `opacity-50` | 0.5 | 50% |
| `opacity-60` | 0.6 | 60% |
| `opacity-70` | 0.7 | 70% |
| `opacity-75` | 0.75 | 75% |
| `opacity-80` | 0.8 | 80% |
| `opacity-90` | 0.9 | 90% |
| `opacity-95` | 0.95 | 95% |
| `opacity-100` | 1 | 100% |

---

## Border Width

| Class | Size (px) | Description |
|-------|-----------|-------------|
| `border-0` | 0px | No border |
| `border` | 1px | Default border |
| `border-2` | 2px | 2px border |
| `border-4` | 4px | 4px border |
| `border-8` | 8px | 8px border |

Use `border-t-*`, `border-r-*`, `border-b-*`, `border-l-*` for specific sides.

---

## Z-Index

| Class | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Base layer |
| `z-10` | 10 | Above base |
| `z-20` | 20 | Above z-10 |
| `z-30` | 30 | Above z-20 |
| `z-40` | 40 | Above z-30 |
| `z-50` | 50 | Modal/overlay |
| `z-auto` | auto | Browser default |

---

## Common Color Values

### Gray Scale

| Color | Hex Code | Usage |
|-------|----------|-------|
| `gray-50` | #F9FAFB | Very light backgrounds |
| `gray-100` | #F3F4F6 | Light backgrounds |
| `gray-200` | #E5E7EB | Borders, dividers |
| `gray-300` | #D1D5DB | Disabled states |
| `gray-400` | #9CA3AF | Muted text |
| `gray-500` | #6B7280 | Secondary text |
| `gray-600` | #4B5563 | Body text |
| `gray-700` | #374151 | Headings |
| `gray-800` | #1F2937 | Dark text |
| `gray-900` | #111827 | Primary text |

### Blue (Primary)

| Color | Hex Code | Usage |
|-------|----------|-------|
| `blue-50` | #EFF6FF | Light backgrounds |
| `blue-100` | #DBEAFE | Subtle backgrounds |
| `blue-200` | #BFDBFE | Light accents |
| `blue-300` | #93C5FD | Medium accents |
| `blue-400` | #60A5FA | Interactive elements |
| `blue-500` | #3B82F6 | Primary buttons |
| `blue-600` | #2563EB | Primary (hover) |
| `blue-700` | #1D4ED8 | Primary (active) |
| `blue-800` | #1E40AF | Dark primary |
| `blue-900` | #1E3A8A | Very dark primary |

---

## Quick Tips

1. **Spacing Scale**: Remember, each number = 4px (e.g., `p-4` = 16px, `p-8` = 32px)
2. **Responsive**: Add breakpoint prefixes like `md:`, `lg:` (e.g., `md:text-2xl`)
3. **Hover States**: Use `hover:` prefix (e.g., `hover:bg-blue-600`)
4. **Focus States**: Use `focus:` prefix (e.g., `focus:ring-2`)
5. **Disabled States**: Use `disabled:` prefix (e.g., `disabled:opacity-50`)

---

## Need Help?

- **Full Tailwind Docs**: https://tailwindcss.com/docs
- **VS Code Extension**: Install "Tailwind CSS IntelliSense" for autocomplete
- **Custom Values**: Use square brackets for arbitrary values (e.g., `w-[147px]`)

