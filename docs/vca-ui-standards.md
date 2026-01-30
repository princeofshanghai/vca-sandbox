# VCA UI standards: Padding & Alignment

This document outlines the design and engineering principles for maintaining a pixel-perfect chat interface within the VCA (Visual Conversational AI) system, particularly regarding the Studio `FlowPreview`.

## Core Philosophy: Pixel-Perfect Preview
The `FlowPreview` (found in `src/views/studio/FlowPreview.tsx`) is designed to be a direct, 1:1 reflection of the final user experience. 

*   **Real Components**: Always use the actual production components (found in `src/components/vca-components/`) rather than mocks.
*   **Production Layout**: The preview should inherit the exact layout constraints of the production environment to ensure that what a designer see matches what a user sees.

## Padding & Layout Standards

### 1. Centralized Constraints
To avoid "layout drift" and double-padding bugs, layout constraints (like horizontal and vertical padding) are centralized in the container components rather than the content components.

*   **The Container is the Source of Truth**: The `Container.tsx` component handles the padding for the conversational area.
*   **Children are "Clean"**: Components like `Message`, `InfoMessage`, and `PromptGroup` should not apply their own outer horizontal margins or padding. They should assume they are being rendered within a constrained container.

### 2. Standardized Spacing Tokens
We use the following specific standards for the main chat interface:

| Dimension | Token | Value | Applied In |
| :--- | :--- | :--- | :--- |
| **Horizontal Padding** | `vca-xl` | **20px** | `Header`, `Composer`, `Container` (content) |
| **Vertical Padding** | `vca-lg` | **16px** | `Container` (top/bottom of scroll area) |
| **Internal Gap** | `vca-lg` | **16px** | Vertical gap between messages/components |

### 3. Avoiding Common Technical Debt
*   **No Double-Padding**: If `Container.tsx` already has `py-vca-lg` (16px), don't add `pt-4` (16px) to the top of the internal list. This would result in a 32px gap, which breaks the visual balance.
*   **No Fixed Widths on Content**: Avoid `w-[320px]` or similar on message bubbles if possible. Let the parent container's `px-vca-xl` provide the visual boundary.
*   **Optical vs. Mathematical Symmetry**: When icons (like the "X" or "Send" button) have large circular hitboxes, mathematical symmetry (identical padding) is the baseline. Optical correction (minor offsets to make them *look* centered) should be applied sparingly and explicitly.
