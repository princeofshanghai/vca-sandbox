# CLAUDE.md

Technical quick reference for AI coding tools in this repo.
Behavior/collaboration rules live in `AGENTS.md`.

## Project Snapshot
VCA Sandbox is an internal LinkedIn tool for designing and previewing VCA conversation flows using reusable chat components and a visual flow builder.

## Commands
```bash
npm run dev           # Start dev server
npm run build         # TypeScript check + production build
npm run build:tokens  # Rebuild design tokens from design-tokens.js
npm run lint          # ESLint (max 2 warnings)
npm run preview       # Preview production build
```

## Requirements
- Node.js 20.19+ or 22.12+
- `.env` values:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Core Architecture
- Routing: `src/App.tsx`
  - Public: `/login`, `/share/:id`
  - Protected: `/`, `/foundations/*`, `/components/*`, `/patterns/*`, `/studio/:id`
- State: React Context only (`AppContext`, `AuthContext`)
- Flow engine: `src/hooks/useSmartFlowEngine.ts`
- Tokens source: `src/design-tokens.js` (wired through `tailwind.config.js`)

## Key Directories
- `src/components/vca-components/` — production chat components
- `src/components/shell/` — app shell design-system wrappers
- `src/views/` — route-level UI
- `src/views/studio/`, `src/views/studio-canvas/` — flow builder
- `src/utils/` — flow creation/storage/simulation helpers
- `src/config/componentNavigation.ts` — component library nav

## Code Conventions
- Use Tailwind classes (avoid inline styles/CSS files where possible)
- Use `cn()` from `src/utils/cn.ts` for conditional classes
- Prefer `const` arrow functions and early returns
- Define TypeScript types; avoid `any`
- Include accessible labels/tab behavior for interactive controls

## Shell UI Guardrails
- In shell/dashboard/auth/share/layout views, avoid raw `<button>`, `<input>`, `<select>`, `<textarea>` when wrappers exist; prefer `src/components/shell/` then `src/components/ui/`.
- Keep `Login` and `Share` as cinematic dark surfaces unless explicitly changed.
