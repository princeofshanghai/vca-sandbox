# Studio Refactor Proposal

## Goal
Build an easy way for designers to build conversational AI experiences, leveraging existing VCA components and patterns.

## Problem with Current State
The current "Studio V2" and "Lab" approaches (likely) feel too abstract or disconnected from the final output. Designers are "building a graph" rather than "designing a conversation."

## Core Philosophy: "Design via Conversation"
Instead of dragging generic nodes, designers should feel like they are writing the script of the conversation. The tool should focus on **The Flow** (the content) and **The Preview** (the experience).

---

## Concept 1: The "Split-Screen Scriptwriter" (Recommended)
**Metaphor:** Screenplay / Messenger Editor.

*   **Layout:** Two vertical panes.
    *   **Left: The Script (Builder).** A linear, document-style editor. You don't drag nodes; you "add steps" like writing a doc.
    *   **Right: The Stage (Preview).** A live, interactive `Container` component that renders the script instantly.

*   **Key Features:**
    *   **Block-Based Editing:** Click `+` or use `/` commands to add blocks: "AI Message", "User Reply", "System Action", "Agent Handoff".
    *   **Inline Pattern Insertion:** "Insert 'Intention Check' Pattern" adds a pre-configured set of blocks (Message + Confirmation Buttons).
    *   **Real-time Sync:** Typing in the script updates the chat bubble on the right immediately.
    *   **Branching:** Handled via "nested groups" or "linked sub-flows" to keep the main view clean.

## Concept 2: The "Pattern Assembler"
**Metaphor:** Wizard / Form-based config.

*   **Layout:** A stepping-stone interface based on the *Conversation Lifecycle*.
    *   Tabs for: `1. Welcome` -> `2. Intent` -> `3. Info Gathering` -> `4. Action`.
*   **Workflow:**
    *   User starts at "Welcome". Selects a template (e.g., "Contextual Greeting"). Fills in the text.
    *   Moves to "Intent". Defines what users can say.
    *   Moves to "Action".
*   **Pros:** Enforces the "Good Design" rules defined in `ConversationFlowPatternView`.
*   **Cons:** Might feel too rigid for creative/non-standard flows.

## Concept 3: The "Visual Map" (Enhanced)
**Metaphor:** Miro / FigJam but for Logic.

*   **Layout:** Infinite canvas.
*   **Difference from current:**
    *   Nodes are **ACTUAL UI Components**. The node typically looks like the `Message` component.
    *   You wire them together physically.
*   **Pros:** Good for visualizing complex branching.
*   **Cons:** Can get messy ("spaghetti") quickly. Hard to see the "linear experience" the user will feel.

---

## Recommendation: The "Split-Screen Scriptwriter"
This aligns best with "easy way for designers". It bridges the gap between *writing copy* and *seeing the UI*.

### Proposed Tech Specs
*   **State:** A JSON object representing the `ConversationFlow`.
*   **Preview Engine:** A simplified `FlowPlayer` component that takes the JSON and renders `Container` + `Message` list.
*   **Editor:** A list of "Block Components" that manipulate the JSON.

### Next Steps for Ideation
1.  Define the **Data Structure** for a "Flow".
2.  Mock up the **Editor Interface** (just code/component structure).
3.  Build a **Proof of Concept (PoC)** with just "AI Message" and "User Options".
