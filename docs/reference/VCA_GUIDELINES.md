# VCA Component Guidelines

This document establishes the mandatory standards for implementing VCA (Virtual Client Agent) UI patterns in this project. All future development and documentation must adhere to these rules.

## 1. Real VCA Components Only (No Mockups)
**Rule:** Never mock VCA components using raw HTML/CSS (e.g., `div`s with Tailwind classes that look like messages). Always import and use the actual React components from the `src/components/vca-components/` directory.

**Why:** Ensures documentation stays in sync with the actual component library and reflects the current state of the design system.

**Required Imports:**
- `Container`: `@/components/vca-components/container`
- `Message`: `@/components/vca-components/messages`
- `PromptGroup`: `@/components/vca-components/prompt-group`
- `Header`: `@/components/vca-components/header`
- `Composer`: `@/components/vca-components/composer`

---

## 2. "Baked-in Spacing" Principle
**Rule:** Do not manually add margins or padding to individual VCA components (e.g.,avoid `mb-4` on a `<Message />`). Instead, rely on the parent container's layout utility classes to enforce consistent vertical rhythm.

**Implementation:**
- Wrap lists of messages and prompts in a parent `div`.
- Apply the standard spacing utility class: `space-y-vca-lg`.
- This ensures uniform spacing (likely `16px` or `1.6rem` depending on the token) between all child elements automatically.

**Example:**
```tsx
// ✅ CORRECT
<div className="space-y-vca-lg px-4">
  <Message type="disclaimer" />
  <Message type="ai" defaultText="Hello..." />
  <PromptGroup prompts={[...]} />
</div>

// ❌ INCORRECT
<div>
  <Message type="disclaimer" className="mb-4" /> {/* Don't do this */}
  <Message type="ai" defaultText="Hello..." className="mb-4" />
</div>
```

## 3. Container Usage for Examples
**Rule:** When showing a full pattern example, wrap the content in the `Container` component to provide the realistic "shell" (header, composer, etc.).
- Override height for documentation legibility if needed (e.g., `className="h-[500px]"`).
- Set explicit `headerTitle` to match the context (e.g., "Help" or "Recruiter Help Center").
