# UI/UX Shared Context

This file is intentionally brief.
Its job is to explain the product layers and point shell UI work to the right source of truth.

For shell UI requests, always point Codex to:
`@docs/guidelines/shell-design-system.md`

## Project in One Sentence
VCA Sandbox is a design tool where shell UI helps create flows, and VCA components render the realistic end-user experience being designed.

## Two UI Layers
- Shell UI = the tool interface: navigation, drawers, dialogs, canvas controls, dashboard, Share/Login chrome, and editor surfaces.
- VCA UI = the experience being designed: messages, prompt groups, info states, and other chat/product components in `src/components/vca-components`.

## Core Rule
- Keep shell UI and VCA UI visually separate.
- When both appear on the same screen, shell chrome follows the shell design system and VCA internals keep VCA tokens, typography, and behavior.

## If You Are Prompting Codex
- For shell UI quality, consistency, and dark-theme behavior, use `docs/guidelines/shell-design-system.md`.
- For project goals and product context, use `docs/context/project-overview.md`.
- For VCA typography merge issues, use `docs/guidelines/tailwind-typography-fix.md`.
