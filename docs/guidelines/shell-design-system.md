# Shell UI Design System

This is the canonical source of truth for shell UI.
When you want Codex to build or polish shell UI, point to:
`@docs/guidelines/shell-design-system.md`

## Scope
This governs the tool interface only:
- Dashboard
- Share shell chrome
- Login/auth shell chrome
- Sidebars
- Drawers
- Dialogs
- Canvas controls
- Component library shell surfaces

This does not govern VCA component UI.
VCA component UI is the end-user chat/product experience in:
- `src/components/vca-components`

## Shell UI vs VCA UI
- Shell UI = the product-building interface around the experience.
- VCA UI = the experience being designed.
- Do not mix their visual languages.
- If a shell screen renders VCA components, the shell chrome follows this doc and the VCA internals keep VCA tokens, typography, and behavior.
- Shell base element styles must not override VCA text, links, paragraphs, lists, or emphasis styles inside previews.

## Build Order
1. Use `src/components/shell` first.
2. If needed, use shared primitives from `src/components/ui`.
3. If a shell control is missing, extend `src/components/shell` before styling a one-off version in a view.
4. Prefer semantic shell tokens over hardcoded palette classes.

## Aesthetic
- Compact, calm, and precise.
- Neutral graphite surfaces.
- Restrained blue accents.
- Soft borders and dividers.
- Color is for action, focus, selection, and status, not decoration.

## Tokens
Use semantic shell tokens from `tailwind.config.js` and `src/index.css`.

Default shell:
- `shell-bg`
- `shell-surface`
- `shell-surface-subtle`
- `shell-text`
- `shell-muted`
- `shell-border`
- `shell-accent`

Cinematic dark shell:
- `shell-dark-bg`
- `shell-dark-panel`
- `shell-dark-surface`
- `shell-dark-text`
- `shell-dark-muted`
- `shell-dark-border`
- `shell-dark-accent`

Share and Login are always-cinematic dark contexts unless explicitly changed.

## Cinematic Dark Recipe
Use this pattern for dark shell controls:
- Backdrop or stage uses `shell-dark-bg`.
- Anchored containers use `shell-dark-panel`.
- Interactive controls sitting on those containers use `shell-dark-surface`.
- Selected/current text uses `shell-dark-text`.
- Supporting text uses `shell-dark-muted`.
- Default edges use `shell-dark-border`.
- Blue is mostly reserved for focus, active, selected, and primary CTA states.

Why this works:
- The control reads as interactive because it is one step lighter than its parent panel.
- Separation comes from surface contrast first, not loud borders.
- The dark UI stays calm because blue is not constantly “on.”

## Non-Negotiables
1. In shell surfaces, do not use raw `<button>`, `<input>`, `<select>`, or `<textarea>`.
2. Do not use hardcoded light palette classes like `bg-white`, `text-gray-*`, or `border-gray-*` in shell surfaces.
3. Do not copy long one-off class stacks across views when the pattern should live in a reusable shell or shared UI component.
4. Do not use accent blue as the resting fill for secondary controls.
5. Do not place an interactive dark control on the exact same fill as its parent panel when hierarchy matters.
6. Use pill shapes only when the component is semantically a chip, badge, or toolbar pill.
7. When shell screens render VCA components, fix styling leaks in the VCA layer, not by restyling the shell preview container.

## QA Checklist
1. Verify light and dark themes when applicable.
2. Check default, hover, focus, active, open, selected, and disabled states.
3. Check CTA readability.
4. Check muted/supporting text legibility.
5. Check that dark borders and dividers are subtle, not bright.
6. Check that controls are visibly one step above their parent panel.
7. If a shell surface contains VCA components, verify shell typography does not leak into VCA internals.
8. In previews, verify VCA text still reads correctly inside light VCA surfaces while the surrounding shell is in dark mode.

## Useful References
- `src/components/shell`
- `src/components/ui`
- `src/index.css`
- `tailwind.config.js`
- `docs/guidelines/tailwind-typography-fix.md`
