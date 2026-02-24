# UI/UX Shared Context (Designer + Codex)

## Why this exists
Use this doc as our shared reference for UI/UX work in VCA Sandbox.
When you want to activate this context, mention:
`@docs/context/ui-ux-shared-context.md`

## Project in one sentence
VCA Sandbox is a design tool where the app shell helps you build flows, and VCA components render the realistic chat experience being designed.

## Tech stack (plain language)
- Frontend app: React + TypeScript + Vite
- Routing/auth flow: React Router + protected routes
- Styling system: Tailwind + Radix/shadcn-style primitives
- Design system tokens: generated VCA tokens wired into Tailwind
- Flow builder: XYFlow/React Flow canvas
- Backend/auth: Supabase

## Two UI layers to keep separate

### 1) Project Shell UI (tool interface)
What this is:
- The app framework around the product preview: navigation, sidebars, dashboard, dialogs, canvas controls, editor UI.

Where it mostly lives:
- `src/components/layout`
- `src/components/ui`
- `src/views/dashboard`
- `src/views/studio-canvas`

### 2) VCA Components (chat product interface)
What this is:
- The actual chat building blocks (Message, PromptGroup, InfoMessage, Container, etc.) that represent the experience end users would see.

Where it mostly lives:
- `src/components/vca-components`

## How they connect
1. Shell UI lets you create/edit flow structure and behavior.
2. Flow data is passed into preview.
3. Preview renders with VCA components.
4. Component Library pages also demonstrate those same VCA components.

## Design system rules we should always enforce
- Prefer reusable, componentized solutions over one-off custom code.
- Keep shell patterns consistent with existing shell UI.
- Keep VCA component visuals aligned with design tokens and existing component behavior.
- When proposing UX/UI changes, provide 2-3 options, explain tradeoffs, and recommend one.
- For shell controls, prefer `src/components/shell` first, then `src/components/ui`.
- Reference: `docs/guidelines/shell-design-system.md`
- In shell surfaces, avoid raw HTML controls (`button`, `input`, `select`, `textarea`).
- For shell styling, prefer `shell-*` semantic tokens over raw palette classes when possible.
- For cinematic dark shell contexts, prefer `shell-dark-*` semantic tokens over raw dark palette values.
- For shell/page chrome and docs surfaces, avoid hardcoded light classes like `bg-white`, `text-gray-*`, and `border-gray-*`.

## Dark theme intent (current)
- Overall look: neutral graphite (very dark, low blue tint in surfaces).
- Brand/action color: restrained blue (used mostly for primary actions and active states).
- Borders in dark: intentionally subtle (not bright) to keep the UI calm.
- Always-cinematic dark contexts:
  - Login
  - Share

## Important implementation gotcha (Tailwind typography)
- `cn()` uses `tailwind-merge`, which can drop one of two `text-*` classes.
- VCA typography tokens and VCA color tokens can conflict if both are passed through `cn()`.
- Safe pattern: split typography + color classes with direct string concatenation.
- Always include explicit VCA font family (`font-vca-text` or `font-vca-display`) with typography tokens.
- Reference: `docs/guidelines/tailwind-typography-fix.md`

## Collaboration mode for non-trivial UI/UX requests
Before coding, we do this:
1. Analyze request and inspect relevant files.
2. Restate understanding in plain English.
3. Propose approach, alternatives, and tradeoffs.
4. Wait for your explicit confirmation.
5. Then implement.

Non-trivial usually means:
- Multi-file changes
- Structural/risky refactors
- Changes with meaningful UX behavior impact
- Unclear or ambiguous requirements

## Prompt anti-drift reminders
- For shell UI requests, default to shell components + shell tokens.
- If existing pages use mixed hardcoded colors and shell tokens, normalize to shell tokens first.
- Keep VCA component visual language separate from shell visual language.

## UI QA checklist (for changes)
1. Check light and dark theme.
2. Check default, hover, active, focus, disabled states.
3. Check CTA readability and muted text contrast.
4. Check border/subtle surface intensity in dark mode.

## Quick request template (optional)
Use this when you want fast, high-quality collaboration:
- Goal:
- Screen/view:
- What should change visually:
- Behavior/interaction states:
- Must keep:
- Nice to have:
