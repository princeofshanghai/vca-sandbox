# Tailwind Merge Typography Fix

## Problem

The `cn()` utility uses **tailwind-merge**, which automatically removes "conflicting" classes. When using VCA typography tokens with color tokens, tailwind-merge incorrectly treats them as conflicting because both start with `text-`:

```tsx
// ❌ This doesn't work
cn(
  'text-vca-small-bold',  // Typography token (14px, 1.25, 600)
  'text-vca-link'         // Color token (#0a66c2)
)
// Result: tailwind-merge removes 'text-vca-small-bold' ❌
```

## Solution

**Bypass `cn()` for text classes** and use direct string concatenation:

```tsx
// ✅ This works
const baseTextClasses = 'font-vca-text text-vca-small-bold';
const colorClasses = 'text-vca-link hover:text-vca-link-hover';

<span className={`${baseTextClasses} ${colorClasses}`}>
  {children}
</span>
```

## Implementation Example

See: `src/components/vca-components/buttons/ButtonLink.tsx`

```tsx
// Split typography and color to avoid cn() conflicts
const baseTextClasses = 'font-vca-text text-vca-small-bold';
const colorClasses = !disabled 
  ? 'text-vca-link hover:text-vca-link-hover active:text-vca-link-active'
  : 'text-vca-link-disabled';

<span className={`${baseTextClasses} ${colorClasses}`}>{children}</span>
```

## When to Use This Pattern

Apply this pattern when:
- ✅ Combining VCA typography tokens (`text-vca-*`) with color tokens (`text-vca-link`)
- ✅ Typography token is being removed by tailwind-merge
- ✅ Inspecting element shows missing typography classes

## Still Best Practice?

**Yes!** This solution:
- ✅ Uses all VCA design tokens from `tailwind.config.js`
- ✅ Matches Figma specs exactly
- ✅ Uses Tailwind utilities (no custom CSS)
- ✅ Maintainable and consistent
- ✅ Common workaround for tailwind-merge with custom tokens

## Key Pattern

**Always include both:**
1. **Font family**: `font-vca-text` or `font-vca-display`
2. **Typography token**: `text-vca-small-bold`, `text-vca-heading-large`, etc.

Without the font family class, text will inherit the app's default font (Geist) instead of SF Pro Text/Display.

## Related Issues

- Line-heights converted to unitless values (1.25, 1.5) in `tailwind.config.js`
- Typography tokens must be used with explicit font-family classes
- Cached CSS requires `rm -rf dist/` when changing Tailwind config

