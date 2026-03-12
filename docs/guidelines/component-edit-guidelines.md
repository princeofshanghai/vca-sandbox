# Component Edit Guidelines

Use this doc when discussing or refining component editor popovers in Studio Canvas.

## Core Philosophy

Component editor popovers should edit the real component, not invent a parallel design tool.

- The popover is shell UI for editing.
- The actual component is the source of truth.
- Editor controls should map to real component variants, states, and props.
- The editor should simplify or clarify existing component behavior, not introduce editor-only concepts.

## What Good Looks Like

- A control exposes a real option the component already supports.
- Labels and layout make the component's real API easier to understand.
- The editor helps people configure existing states more clearly or more quickly.
- Shell-level improvements can improve spacing, hierarchy, affordance, and clarity without changing component meaning.

## What To Avoid

- Editor-only options that do not exist in the real component.
- Fake realism that implies capabilities the component does not actually support.
- Controls that create a different mental model from the rendered component.
- Adding complexity to the editor when the component itself is intentionally simple.

## Shell Vs Component

- `ComponentEditorPopover.tsx` is shell chrome.
- The editor UI can improve spacing, grouping, and usability.
- But the values being edited should still correspond to the real component's supported behavior.

## Practical Test

Before adding an editor control, ask:

1. Is this editing a real prop, state, or variant of the component?
2. Would the rendered component behave the same way the editor suggests?
3. Are we clarifying the component, or inventing a new layer just for the editor?

If the answer to #3 is yes, the control is probably wrong.

## Example

Leading visual controls are acceptable when they map to real supported component states like:

- `none`
- `avatar`
- supported icon presets

They should not become a separate asset-management system if the real component does not support that model.

## Shortcut

If you want Codex to apply this philosophy in future conversations, reference:

- `docs/guidelines/component-edit-guidelines.md`
- or say: "use the component edit guidelines"
