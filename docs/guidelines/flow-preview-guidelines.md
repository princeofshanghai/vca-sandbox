# VCA UI standards: Flow Preview Fidelity & Layout

This document outlines the design and engineering principles for maintaining a pixel-perfect chat interface within the VCA (Visual Conversational AI) system, particularly regarding the Studio `FlowPreview`.

For the relationship between `Flow Preview`, `Simple Component Card`, and the `Editor`, see [markdown-surface-roles.md](./markdown-surface-roles.md).

## Core Philosophy: Pixel-Perfect Preview
The `FlowPreview` (found in `src/views/studio/FlowPreview.tsx`) is designed to be a direct, 1:1 reflection of the final user experience. 

*   **Real Components**: Always use the actual production components (found in `src/components/vca-components/`) rather than mocks.
*   **Production Layout**: The preview should inherit the exact layout constraints of the production environment to ensure that what a designer see matches what a user sees.

In plain English: if someone needs to know what the user will actually experience, `FlowPreview` is the source of truth.

## Typography Boundary

The preview shell and the VCA internals have different design systems.

*   **Shell chrome owns only the frame**: drawer, panel, toolbar, pills, and surrounding shell surfaces.
*   **VCA internals own their own text styling**: message text, markdown, links, lists, bold text, and other in-preview content must keep VCA typography and VCA color tokens.
*   **Do not fix VCA text bugs in the shell container**: if preview text becomes unreadable in dark mode, fix the VCA component or renderer that owns the text.
*   **Markdown needs explicit inner classes**: wrapper classes are not enough when shell global element styles exist. Inner `p`, `strong`, `li`, and link elements should explicitly reassert VCA typography/color classes.

This boundary matters because `FlowPreview` is wrapped in shell UI, but the actual conversation area must still look and behave like VCA, not like generic shell content.

## Padding & Layout Standards

### 1. Centralized Constraints
To avoid "layout drift" and double-padding bugs, layout constraints (like horizontal and vertical padding) are centralized in the container components rather than the content components.

*   **The Container is the Source of Truth**: The `Container.tsx` component handles the padding for the conversational area.
*   **Children are "Clean"**: Components like `Message`, `InfoMessage`, and `PromptGroup` should not apply their own outer horizontal margins or padding. They should assume they are being rendered within a constrained container.

### 2. Standardized Spacing Tokens
We use the following specific standards for the main chat interface:

| Dimension | Token | Value | Applied In |
| :--- | :--- | :--- | :--- |
| **Horizontal Padding** | `vca-xxl` | **24px** | `Header`, `Composer`, `Container` (content) |
| **Vertical Padding** | `vca-lg` | **16px** | `Container` (top/bottom of scroll area) |
| **Internal Gap** | `vca-lg` | **16px** | Vertical gap between messages/components |

### 3. Avoiding Common Technical Debt
*   **No Double-Padding**: If `Container.tsx` already has `py-vca-lg` (16px), don't add `pt-4` (16px) to the top of the internal list. This would result in a 32px gap, which breaks the visual balance.
*   **No Fixed Widths on Content**: Avoid `w-[320px]` or similar on message bubbles if possible. Let the parent container's `px-vca-xl` provide the visual boundary.
*   **Optical vs. Mathematical Symmetry**: When icons (like the "X" or "Send" button) have large circular hitboxes, mathematical symmetry (identical padding) is the baseline. Optical correction (minor offsets to make them *look* centered) should be applied sparingly and explicitly.
*   **No Shell Typography Leakage**: Test dark-mode shell previews carefully to confirm that VCA content inside white/light VCA surfaces does not inherit shell paragraph or strong-text colors.

## Review Question

Before changing preview styling, ask:

"Am I making the preview more faithful to the real experience, or am I compensating for a bug that actually belongs inside the VCA component or markdown renderer?"
