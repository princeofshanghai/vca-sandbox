# Implementation Plan: Studio Refactor (Split-Screen Scriptwriter)

## 1. Data Structure (`src/views/studio/types.ts`)

We need a linear-first data structure that supports branching but feels like a document.

```typescript
export type BlockType = 'message' | 'user-input' | 'action' | 'handoff';

export interface Block {
  id: string; // unique ID
  type: BlockType;
  content: string; // The main text (e.g., AI message)
  metadata?: Record<string, any>; // For extra config (e.g. action type)
}

export interface Flow {
  id: string;
  title: string;
  blocks: Block[]; // The linear script
}
```

*Note: For the PoC, we will simplify "Branching" by just having a linear list first. Branching can be added later as a special block type that links to other sub-flows.*

## 2. Components Structure

### `src/views/studio/StudioLayout.tsx`
The main container.
- Layout: Grid or Flex row.
- State: Holds the `Flow` object.

### `src/views/studio/ScriptEditor.tsx`
The left pane.
- Renders a list of `BlockEditor` components.
- Has a toolbar or `+` button to add new blocks.

### `src/views/studio/FlowPreview.tsx`
The right pane.
- Uses `Container` from the existing components.
- Maps `blocks` to `Message` components.
- "Replays" the chat or shows it statically.

## 3. Step-by-Step Implementation

1.  **Scaffold Files**: Create the directory `src/views/studio-script` (new name to avoid conflict with studio-v2).
2.  **Define Types**: Create `types.ts`.
3.  **Build Layout**: Create `StudioPage.tsx` with the split panes.
4.  **Build Editor**: Create a simple input list for the blocks.
5.  **Build Preview**: Map the blocks to the actual VCA `Message` components.
