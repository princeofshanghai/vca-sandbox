# Shell Design System Contract

## Goal
Keep app shell UI consistent and prevent AI drift into one-off custom controls.

This contract applies to:
- Dashboard
- Auth/Login
- Share shell chrome
- Layout/navigation surfaces
- Component library shell pages

This does **not** apply to VCA chat components, which are a separate system in:
- `src/components/vca-components`

## Source of truth for shell UI
- `src/components/shell` (preferred)
- `src/components/ui` (base primitives)

Use shell components first. If missing, extend `src/components/shell` before building custom controls in views.

## Current shell layer
- `src/components/shell/ShellButton.tsx`
- `src/components/shell/ShellInput.tsx`
- `src/components/shell/ShellIconButton.tsx`
- `src/components/shell/index.ts`

## Shell semantic tokens (v1)
Defined in:
- `tailwind.config.js` (token class mapping)
- `src/index.css` (`:root` for light values, `.dark` for dark values)

Primary token families:
- Colors: `shell-bg`, `shell-surface`, `shell-surface-subtle`, `shell-text`, `shell-muted`, `shell-border`, `shell-border-subtle`, `shell-accent`, `shell-accent-hover`, `shell-accent-soft`, `shell-accent-border`, `shell-accent-text`
- Dark colors: `shell-dark-bg`, `shell-dark-panel`, `shell-dark-panel-alt`, `shell-dark-card`, `shell-dark-text`, `shell-dark-muted`, `shell-dark-border`, `shell-dark-border-strong`, `shell-dark-accent`, `shell-dark-accent-hover`, `shell-dark-danger`, `shell-dark-success`
- Spacing: `shell-0` to `shell-6`
- Radius: `shell-sm`, `shell-md`, `shell-lg`, `shell-xl`
- Shadows: `shadow-shell-sm`, `shadow-shell-lg`

## How global changes work
1. Update token values in `src/index.css` (`:root` and/or `.dark`).
2. Keep token class mapping in `tailwind.config.js` aligned.
3. Components in `src/components/shell` pick up the new value.
4. Screens using shell wrappers inherit the change automatically.

## Current migration coverage
- Tokenized shell styling is now applied across dashboard/layout/component-library shell surfaces.
- Cinematic dark contexts (login/share) now use `shell-dark-*` semantic tokens.

## Theme model
- `shell-*` tokens are the default app-shell tokens and are theme-adaptive (light + dark).
- `shell-dark-*` tokens are for intentionally always-dark cinematic contexts.
- Current cinematic always-dark contexts:
  - Login view
  - Share view

## Dark aesthetic direction (current)
- Neutral graphite surfaces (very dark, low tint).
- Restrained blue accents for brand/action emphasis.
- Softer, less-bright borders in dark mode to reduce visual noise.

## Rules
1. In shell surfaces, do not use raw `<button>`, `<input>`, `<select>`, or `<textarea>`.
2. Prefer existing shell/ui components before creating custom controls.
3. Keep shell visuals aligned to existing shell style (gray neutrals + blue action, compact typography).
4. Keep VCA visual language separate from shell visual language.
5. Do not use hardcoded light palette utility classes (`bg-white`, `text-gray-*`, `border-gray-*`) in shell surfaces.
6. For shell/UI documentation pages, use shell tokens for page chrome and text.

## Enforcement
- ESLint rule in `eslint.config.cjs` blocks raw button/form controls in shell files.

## When a new control is needed
1. Add or extend a reusable component in `src/components/shell`.
2. Reuse that component in the target view.
3. Keep customization via `className` minimal and consistent.

## Dark theme QA checklist
Before finalizing shell UI changes:
1. Verify both light and dark themes.
2. Check CTA readability (especially primary buttons).
3. Check border/subtle divider intensity in dark mode.
4. Check muted/supporting text legibility.
