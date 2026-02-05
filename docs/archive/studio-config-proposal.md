# Proposal: Advanced Block Configuration

To support the rich patterns found in `ConversationFlowPatternView`, we need to evolve the "AI Message" block from a simple text box into a configurable "AI Turn".

## The Concept: "One Turn, Many Forms"

Instead of having 10 different block types (MessageBlock, InfoBlock, StatusBlock...), we define high-level **Block Categories** that have **Variants**.

### 1. Structure

**Category: AI Response** (The broad category)
*   User selects "AI Response".
*   User chooses a **Variant** (The specific shape).
*   User enables **Add-ons** (Optional extras like Prompts).

### 2. Proposed Variants (Mapped to Components)

| Variant | Component | Purpose | Fields |
| :--- | :--- | :--- | :--- |
| **Standard** | `Message` | conversational text | `text` |
| **Info Card** | `InfoMessage` | Structured guidance, steps | `title`, `body` (rich text), `sources`, `rating` |
| **Status** | `ActionStatus` | System processing state | `status` (progress/success), `title`, `description` |
| **Disclaimer** | `Message (disclaimer)` | Legal/Privacy notices | `text` (optional) |
| **Thinking** | `ThinkingIndicator` | Temporary state | *None* |

### 3. "Prompts" as a Universal Add-on

In the VCA patterns, `PromptGroup` almost always follows an AI message to guide the user.
*   **Proposal:** "Prompts" should be an optional section inside the "AI Response" block settings.
*   **UI:** A toggle "Add Suggested Prompts". When checked, a list builder appears *below* the message configuration.

---

## UI/UX Options

### Option A: The "Inline" Switcher (Recommended)
*   **Layout:** The Block Card in the editor has a "Header" with a dropdown for Variant.
*   **Behavior:** Changing the dropdown instantly changes the input fields below it.
*   **Pros:** Fast, keeps context, feels like editing a single unit.
    *   *Example:* I type "Hello", then realize I want it to be a "Status". I switch dropdown -> text is preserved where possible.

### Option B: The "Properties Panel"
*   **Layout:** Clicking a block opens a side panel (like Figma/Webflow) with all options.
*   **Pros:** Clean editor view, room for complex controls.
*   **Cons:** Disconnects the "writing" from the "configuring". Feels heavier.

---

## Data Model Updates

We need to update `Block` to support this polymorphism.

```typescript
// New Data Shape
export interface AIBlock extends Block {
  type: 'ai-response';
  variant: 'standard' | 'info' | 'status' | 'disclaimer';
  
  // Content (Union type or loose bag of props)
  content: {
    text?: string;        // For Standard
    title?: string;       // For Info/Status
    body?: string;        // For Info (ReactNode/HTML)
    sources?: Source[];   // For Info
    statusType?: 'in-progress' | 'success'; // For Status
  };

  // Add-ons
  prompts?: string[]; // List of suggested replies
}
```

## User Input Configuration
The "User Input" block also needs a similar treatment.
*   **Variant:** "Free Text" (Simulated typing) vs "Select Prompt" (Simulated click).

---

## Summary of Changes
1.  **Refactor `Block` type:** Split into `AIBlock` and `UserBlock` with `content` objects.
2.  **Update `BlockEditor`:** Add a "Variant Select" dropdown in the header.
3.  **Dynamic Form:** Render different input fields based on the selected variant.
4.  **Update `FlowPreview`:** Map the new data shape to the correct VCA components.
