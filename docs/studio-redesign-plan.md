# Studio Redesign: Node-Based Canvas Implementation Plan

**Decision Date:** January 20, 2026  
**Owner:** Charles Hu  
**Status:** Planning

---

## Executive Summary

**Decision:** Redesign Studio using a **node-based canvas** (like Typebot.io, Voiceflow) instead of the current linear list.

**Why:**
1. Most VCA flows are **non-linear** with branching logic in Information Gathering phase
2. Primary users are **Figma designers** already familiar with canvas-based tools
3. Node-based is the **industry standard** for conversation builders
4. Better **scalability** for complex flows with multiple conditions

**Core Architecture Changes:**
- **AI Turn** = AI's response (Message, Cards, Prompts)
- **User Turn** = User's action (Typing text, Clicking prompt/button)
- **Condition** = Backend logic/rules (Invisible to user)
- **Canvas** = Storyboard-style graph (React Flow)

---

## Data Model

### Core Types

```typescript
// Core building block - UI components
interface Component {
  id: string;
  type: 'message' | 'infoMessage' | 'actionCard' | 'buttons' | 'input' | 'promptGroup';
  content: MessageContent | InfoContent | ActionContent | ButtonsContent | InputContent | PromptGroupContent;
}

// Component content types
interface PromptGroupContent {
  title: string;
  prompts: string[]; // Array of prompt suggestions
}

// A turn is one speaker's complete response
interface Turn {
  id: string;
  type: 'turn';
  speaker: 'ai'; // AI Turns only
  phase?: FlowPhase; 
  label?: string; 
  components: Component[]; 
  position?: { x: number; y: number }; 
  locked?: boolean; 
}

// NEW: User actions are now explicit nodes
interface UserTurn {
  id: string;
  type: 'user-turn';
  label: string; // e.g. "User selects 'Remove User'"
  inputType: 'text' | 'prompt' | 'button'; // How they interacted
  triggerValue?: string; // The specific value (e.g., "Remove User")
  position?: { x: number; y: number };
}

// Condition creates branches in the flow
interface Condition {
  id: string;
  type: 'condition';
  label: string; // e.g., "Is User Admin?"
  description?: string; 
  branches: Branch[];
  position?: { x: number; y: number };
}

// Each branch represents one possible path
interface Branch {
  id: string;
  condition: string; // e.g., "Yes", "No"
  nextStepId?: string; 
}

// Step is Union of all node types
type Step = Turn | UserTurn | Condition;

// Connection between nodes
interface Connection {
  id: string;
  source: string; // Source node ID
  sourceHandle?: string; // For conditions with multiple outputs
  target: string; // Target node ID
}

// Global settings for the flow
interface GlobalSettings {
  showDisclaimer: boolean;
  simulateThinking: boolean;
  entryPoint: string; // REQUIRED: 'admin-center' | 'recruiter' | 'marketing' | 'custom'
  productName: string; // REQUIRED: Display name for the product
}

// Main flow structure
interface Flow {
  id: string;
  version: number; // For migrations
  title: string;
  description?: string;
  steps: Step[]; // All nodes (always starts with Welcome node)
  connections: Connection[]; // All edges
  startStepId: string; // Always points to Welcome node
  settings: GlobalSettings; // REQUIRED
  lastModified: number;
}
```

### Entry Point Configuration

```typescript
// Predefined entry points with smart defaults
export const ENTRY_POINTS = {
  'admin-center': {
    productName: 'Admin Center',
    defaultPrompts: [
      'Add or remove a user',
      'Manage licenses',
      'View billing information'
    ]
  },
  'recruiter': {
    productName: 'LinkedIn Recruiter',
    defaultPrompts: [
      'Search for candidates',
      'Manage job postings',
      'View applicant pipeline'
    ]
  },
  'marketing': {
    productName: 'LinkedIn Marketing Solutions',
    defaultPrompts: [
      'Create a campaign',
      'View analytics',
      'Manage budget'
    ]
  },
  'sales-navigator': {
    productName: 'Sales Navigator',
    defaultPrompts: [
      'Find leads',
      'Save searches',
      'Manage account lists'
    ]
  },
  'learning': {
    productName: 'LinkedIn Learning',
    defaultPrompts: [
      'Find a course',
      'Track learning progress',
      'Get recommendations'
    ]
  },
  'custom': {
    productName: 'LinkedIn', // User must customize
    defaultPrompts: [
      'Get started',
      'Learn more',
      'Contact support'
    ]
  }
} as const;

type EntryPointId = keyof typeof ENTRY_POINTS;
```

### Flow Creation with Required Entry Point

```typescript
// Helper to create new flow with Welcome node
export function createNewFlow(entryPoint: EntryPointId): Flow {
  const entryConfig = ENTRY_POINTS[entryPoint];
  const welcomeNodeId = crypto.randomUUID();
  
  const welcomeNode: Turn = {
    id: welcomeNodeId,
    type: 'turn',
    speaker: 'ai',
    phase: 'welcome',
    label: 'Standard welcome',
    locked: true, // Cannot be deleted
    position: { x: 250, y: 0 },
    components: [
      {
        id: crypto.randomUUID(),
        type: 'message',
        content: {
          text: 'Hi there. With the help of AI, I can answer questions about {{productName}} or connect you to our team.'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'promptGroup',
        content: {
          title: 'Not sure where to start? You can try:',
          prompts: [...entryConfig.defaultPrompts] // Copy array
        }
      }
    ]
  };
  
  return {
    id: crypto.randomUUID(),
    version: 2,
    title: `New ${entryConfig.productName} Conversation`,
    steps: [welcomeNode],
    connections: [],
    startStepId: welcomeNodeId,
    settings: {
      showDisclaimer: true,
      simulateThinking: false,
      entryPoint,
      productName: entryConfig.productName
    },
    lastModified: Date.now()
  };
}
```

### Migration Strategy

```typescript
// Helper to migrate old Block-based flows to new Step-based flows
function migrateFlowToSteps(oldFlow: OldFlow): Flow {
  const steps: Step[] = [];
  const connections: Connection[] = [];
  
  // Convert each block to a turn
  oldFlow.blocks.forEach((block, index) => {
    const turn: Turn = {
      id: block.id,
      type: 'turn',
      speaker: block.type,
      phase: block.phase,
      components: [
        // Convert old block content to component
        {
          id: crypto.randomUUID(),
          type: block.variant || 'message',
          content: block.content
        }
      ],
      position: { x: 0, y: index * 150 } // Vertical layout
    };
    steps.push(turn);
    
    // Create connection to next turn
    if (index < oldFlow.blocks.length - 1) {
      connections.push({
        id: crypto.randomUUID(),
        source: block.id,
        target: oldFlow.blocks[index + 1].id
      });
    }
  });
  
  return {
    ...oldFlow,
    version: 2,
    steps,
    connections,
    startStepId: steps[0]?.id || ''
  };
}
```

---

## UX Walkthrough: Building "Remove a User" Flow

**For Non-Technical Designers**

This section walks you through exactly how you would use the new Studio to build a realistic conversation flow: "Remove a user in LinkedIn Recruiter".

**The "Storyboard" Philosophy:**
We design the flow like a script or comic strip: `AI speaks` → `User responds` → `System checks logic` → `AI responds`.

### The Flow We're Building

**Business Requirements:**
- User wants to remove a team member from their Recruiter account (Intent)
- AI must check if the user has admin permissions (Logic)
- AI must ask which user to remove (Info Gathering)
- AI confirms and removes (Action)

**Flow Structure:**
```
1. AI: Welcome (Start)
2. User: Clicks "Remove a user" (Implicit or Explicit User Turn)
3. Logic: Is User Admin? (Condition)
   ├─ YES → AI: "Who do you want to remove?"
   │         ↓
   │        User: Types "John Doe" (User Turn)
   │         ↓
   │        AI: "Confirm removal?"
   │
   └─ NO → AI: "Permission Denied"
```

---

### Step 1: Create New Flow & Welcome

**What you do:**
1. Create new flow for "LinkedIn Recruiter"
2. Customize Welcome Node prompts:
   - "Remove a user"
   - "Add a user"
   - "View team members"

**Visual on canvas:**
```
┌─────────────────────────┐
│ 🤖 AI  [welcome] 🔒    │
│ Standard welcome        │
│ Prompts:                │
│ • Remove a user         │
│ • Add a user            │
└──────────┬──────────────┘
           │
           ▼
```

---

### Step 2: Define the User Trigger

**What you do:**
1. Connect from Welcome Node.
2. Select **"User Turn"** from the menu.
3. Label it: "User selects 'Remove a user'".

**Visual on canvas:**
```
           │
┌──────────▼──────────────┐
│ 👤 User Turn            │
│ "Remove a user"         │
└──────────┬──────────────┘
           │
           ▼
```

> **Why this matters:**
> This node explicitly marks *why* we are in this flow. It represents the user's intent.

---

### Step 3: Add Logic Check (Admin Permission)

**What you do:**
1. Connect from the User Turn.
2. Select **"Condition Node"**.
3. Label: "Is User Admin?"
4. Branches: "Yes", "No".

**Visual on canvas:**
```
           │
┌──────────▼──────────────┐
│ ⚙️ Condition            │
│ Is User Admin?          │
│ • Yes                   │
│ • No                    │
└─────┬──────────┬────────┘
      │          │
```

---

### Step 4: Build the Happy Path (Yes Branch)

**What you do:**
1. Connect "Yes" to a new **AI Turn**.
2. Content: "Which user do you want to remove?"
3. Connect that AI Turn to a new **User Turn**.
4. Label User Turn: "User types name/email".

**Visual on canvas:**
```
      │ (Yes)
┌─────▼───────────────────┐
│ 🤖 AI                   │
│ "Which user..."         │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│ 👤 User Turn            │
│ User types name         │
└──────────┬──────────────┘
           │
           ▼ (Continue to confirmation...)
```

---

### Step 5: Build the Exception Path (No Branch)

**What you do:**
1. Connect "No" to a new **AI Turn**.
2. Content: Permission Error (InfoMessage).

**Visual on canvas:**
```
                 │ (No)
           ┌─────▼────────────┐
           │ 🤖 AI            │
           │ Permission Error │
           │ (InfoMessage)    │
           └──────────────────┘
```

   │ ✓  User removed                     │
   │                                     │
   │    john.doe@company.com has been    │
   │    removed from Acme Corp.          │
   └─────────────────────────────────────┘
   ```

**If user doesn't have permissions:**
   ```
   🤖 AI
   ┌─────────────────────────────────────┐
   │ ⚠️  Permission required              │
   │                                     │
   │    You need admin permissions to    │
   │    remove users. Please contact     │
   │    your account administrator.      │
   └─────────────────────────────────────┘
   ```

---

### Step 11: Export for Engineering

**What you do:**
1. Click "Export" in toolbar
2. JSON file is generated

**What engineers receive:**

```json
{
  "id": "flow-123",
  "title": "Remove User - LinkedIn Recruiter",
  "version": 2,
  "settings": {
    "entryPoint": "recruiter",
    "productName": "LinkedIn Recruiter"
  },
  "steps": [
    {
      "id": "welcome-1",
      "type": "turn",
      "speaker": "ai",
      "phase": "welcome",
      "locked": true,
      "components": [...]
    },
    {
      "id": "condition-1",
      "type": "condition",
      "label": "User has admin permissions?",
      "branches": [
        { "id": "yes", "condition": "Has permissions" },
        { "id": "no", "condition": "No permissions" }
      ]
    },
    // ... rest of flow
  ],
  "connections": [
    { "source": "welcome-1", "target": "condition-1" },
    { "source": "condition-1", "sourceHandle": "yes", "target": "ask-user" },
    { "source": "condition-1", "sourceHandle": "no", "target": "error" },
    // ... rest of connections
  ]
}
```

Engineers can implement this directly based on the structure.

---

### Key UX Principles Demonstrated

✅ **Entry point sets context** — "LinkedIn Recruiter" determined Welcome message  
✅ **Welcome is always first** — Can't delete, but can customize  
✅ **User Turns are Explicit** — Designer sees exactly where user interacts  
✅ **Logic is Separate** — Condition nodes handle the rules, not the conversation  
✅ **Variables enable reuse** — {{productName}} works across flow  

This flow took ~10 minutes to build. Without the tool, it would take hours in Figma and still wouldn't be interactive for testing.

---

## Phase 1: Canvas MVP (Weeks 1-2)

### Goal
Get basic node-based editor working with Turn and Condition nodes. Every flow starts with a locked Welcome node.

### Tasks

#### 1.1: Entry Point Selection & Flow Creation (Day 1)

**Create:** `src/components/dashboard/NewFlowDialog.tsx`

```typescript
import { useState } from 'react';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import { createNewFlow } from '@/utils/flowCreation';

interface NewFlowDialogProps {
  onCreateFlow: (flow: Flow) => void;
  onClose: () => void;
}

export function NewFlowDialog({ onCreateFlow, onClose }: NewFlowDialogProps) {
  const [selectedEntryPoint, setSelectedEntryPoint] = useState<EntryPointId>('admin-center');
  
  const handleCreate = () => {
    const newFlow = createNewFlow(selectedEntryPoint);
    onCreateFlow(newFlow);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Create New Conversation Flow</h2>
        
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Select Entry Point <span className="text-red-500">*</span>
          </label>
          
          {Object.entries(ENTRY_POINTS).map(([id, config]) => (
            <label
              key={id}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedEntryPoint === id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="entryPoint"
                value={id}
                checked={selectedEntryPoint === id}
                onChange={(e) => setSelectedEntryPoint(e.target.value as EntryPointId)}
                className="mr-3"
              />
              <div>
                <div className="font-semibold">{config.productName}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Example prompts: {config.defaultPrompts.slice(0, 2).join(', ')}
                </div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Flow
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Update:** `src/views/dashboard/DashboardView.tsx`

Replace direct flow creation with dialog:

```typescript
const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);

const handleCreateFlow = (flow: Flow) => {
  flowStorage.saveFlow(flow);
  navigate(`/studio/${flow.id}`);
};

// In render:
{showNewFlowDialog && (
  <NewFlowDialog
    onCreateFlow={handleCreateFlow}
    onClose={() => setShowNewFlowDialog(false)}
  />
)}
```

**Acceptance Criteria:**
- [ ] "New Flow" button opens dialog
- [ ] Dialog shows all entry point options
- [ ] Selecting entry point shows preview of product name and prompts
- [ ] Creating flow generates Welcome node automatically
- [ ] Welcome node has correct product name and default prompts

---

#### 1.2: Install React Flow (Day 1)
```bash
npm install reactflow elkjs
```

**Files to create:**
- `src/views/studio-canvas/` (new directory)
- `src/views/studio-canvas/CanvasEditor.tsx`
- `src/views/studio-canvas/nodes/` (node components)
- `src/views/studio-canvas/types.ts` (canvas-specific types)
- `src/utils/entryPoints.ts` (entry point configs)
- `src/utils/flowCreation.ts` (flow creation helpers)

**Reference:** https://reactflow.dev/learn

---

#### 1.3: Define Node Types (Day 2)

**Create:** `src/views/studio-canvas/nodes/TurnNode.tsx`

```typescript
import { Handle, Position } from 'reactflow';

interface TurnNodeData {
  speaker: 'user' | 'ai';
  phase?: FlowPhase;
  label?: string;
  componentsCount: number;
}

export function TurnNode({ data }: { data: TurnNodeData }) {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-gray-300 bg-white shadow-sm min-w-[200px]">
      {/* Input handle (connection point from above) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3" 
      />
      
      {/* Node content */}
      <div className="flex items-center gap-2 mb-1">
        <span className={data.speaker === 'ai' ? 'text-blue-600' : 'text-gray-600'}>
          {data.speaker === 'ai' ? '🤖 AI' : '👤 User'}
        </span>
        {data.phase && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
            {data.phase}
          </span>
        )}
        {data.locked && (
          <span className="text-xs text-amber-600" title="This node cannot be deleted">
            🔒
          </span>
        )}
      </div>
      
      {data.label && (
        <div className="text-sm font-medium text-gray-900">
          {data.label}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        {data.componentsCount} component{data.componentsCount !== 1 ? 's' : ''}
      </div>
      
      {/* Output handle (connection point to below) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3" 
      />
    </div>
  );
}
```

**Create:** `src/views/studio-canvas/nodes/ConditionNode.tsx`

```typescript
import { Handle, Position } from 'reactflow';

interface ConditionNodeData {
  label: string;
  description?: string;
  branches: Array<{ id: string; condition: string }>;
}

export function ConditionNode({ data }: { data: ConditionNodeData }) {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-amber-400 bg-amber-50 shadow-sm min-w-[200px]">
      {/* Input handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3" 
      />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-700">⚙️ Condition</span>
      </div>
      
      {/* Label */}
      <div className="text-sm font-medium text-gray-900 mb-1">
        {data.label}
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-600 mb-2">
          {data.description}
        </div>
      )}
      
      {/* Branches */}
      <div className="space-y-1">
        {data.branches.map((branch, index) => (
          <div key={branch.id} className="relative">
            <div className="text-xs bg-white px-2 py-1 rounded border border-amber-200">
              {branch.condition}
            </div>
            {/* Output handle for each branch */}
            <Handle
              type="source"
              position={Position.Bottom}
              id={branch.id}
              className="w-3 h-3"
              style={{ 
                left: `${((index + 1) / (data.branches.length + 1)) * 100}%`,
                bottom: -12
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] TurnNode renders with speaker icon, phase badge, label
- [ ] TurnNode shows component count
- [ ] TurnNode shows lock icon if locked (Welcome node)
- [ ] ConditionNode renders with distinct styling (amber color)
- [ ] ConditionNode shows all branches with separate handles
- [ ] Both nodes have input/output connection points

---

#### 1.4: Create Canvas Editor Component (Day 2-3)

**Create:** `src/views/studio-canvas/CanvasEditor.tsx`

```typescript
import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { Flow } from '../studio/types';

// Define custom node types
const nodeTypes: NodeTypes = {
  turn: TurnNode,
  condition: ConditionNode,
};

interface CanvasEditorProps {
  flow: Flow;
  onUpdateFlow: (flow: Flow) => void;
}

export function CanvasEditor({ flow, onUpdateFlow }: CanvasEditorProps) {
  // Convert Flow.steps to React Flow nodes
  const initialNodes: Node[] = flow.steps.map(step => {
    if (step.type === 'turn') {
      return {
        id: step.id,
        type: 'turn',
        position: step.position || { x: 0, y: 0 },
        data: {
          speaker: step.speaker,
          phase: step.phase,
          label: step.label,
          componentsCount: step.components.length
        }
      };
    } else {
      return {
        id: step.id,
        type: 'condition',
        position: step.position || { x: 0, y: 0 },
        data: {
          label: step.label,
          description: step.description,
          branches: step.branches
        }
      };
    }
  });

  // Convert Flow.connections to React Flow edges
  const initialEdges: Edge[] = flow.connections.map(conn => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    sourceHandle: conn.sourceHandle,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click to open editor
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // TODO: Open editor panel
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Canvas renders with Welcome node + any other nodes
- [ ] Welcome node is visually distinguished (locked icon)
- [ ] Can pan and zoom canvas
- [ ] Can drag nodes to reposition (including Welcome node)
- [ ] Can create connections by dragging from handles
- [ ] Clicking a node logs to console (editor panel comes later)
- [ ] MiniMap shows overview of flow

---

#### 1.5: Integrate Canvas into StudioView (Day 3)

**Update:** `src/views/studio/StudioView.tsx`

Add view toggle and display entry point:

```typescript
export const StudioView = () => {
  // ... existing code ...
  const [editorView, setEditorView] = useState<'canvas' | 'list'>('canvas');

  return (
    <div className="flex h-full overflow-hidden flex-col bg-white">
      {/* Toolbar Header */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          {/* ... existing back button ... */}
          
          {/* Entry Point Badge */}
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
            {flow.settings.productName}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setEditorView('canvas')}
              className={`px-3 py-1 rounded text-sm ${
                editorView === 'canvas' 
                  ? 'bg-white shadow-sm font-medium' 
                  : 'text-gray-600'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setEditorView('list')}
              className={`px-3 py-1 rounded text-sm ${
                editorView === 'list' 
                  ? 'bg-white shadow-sm font-medium' 
                  : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>
        {/* ... rest of toolbar ... */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Editor */}
        <div className="w-[500px] flex-shrink-0 border-r border-gray-200 h-full bg-white z-0">
          {editorView === 'canvas' ? (
            <CanvasEditor flow={flow} onUpdateFlow={setFlow} />
          ) : (
            <ScriptEditor flow={flow} onUpdateFlow={setFlow} />
          )}
        </div>

        {/* Right Pane: Preview */}
        <div className="flex-1 bg-gray-100 h-full overflow-hidden relative">
          <FlowPreview flow={flow} isPremium={isPremium} isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Entry point badge displays product name in toolbar
- [ ] Toggle button switches between Canvas and List views
- [ ] Canvas view shows CanvasEditor with Welcome node
- [ ] List view shows existing ScriptEditor
- [ ] Both views use same `flow` state
- [ ] Preview updates when flow changes
- [ ] Welcome node always appears first

---

#### 1.6: Add Toolbar with Node Creation (Day 4)

**Create:** `src/views/studio-canvas/CanvasToolbar.tsx`

```typescript
interface CanvasToolbarProps {
  onAddTurn: (speaker: 'user' | 'ai') => void;
  onAddCondition: () => void;
  onAutoLayout: () => void;
}

export function CanvasToolbar({ onAddTurn, onAddCondition, onAutoLayout }: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
        <div className="text-xs font-semibold text-gray-500 px-2 mb-1">
          Add Node
        </div>
        
        <button
          onClick={() => onAddTurn('ai')}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
        >
          <span>🤖</span>
          <span>AI Turn</span>
        </button>
        
        <button
          onClick={() => onAddTurn('user')}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
        >
          <span>👤</span>
          <span>User Turn</span>
        </button>
        
        <button
          onClick={onAddCondition}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
        >
          <span>⚙️</span>
          <span>Condition</span>
        </button>
      </div>
      
      <button
        onClick={onAutoLayout}
        className="bg-white rounded-lg shadow-lg px-4 py-2 text-sm hover:bg-gray-50"
      >
        Auto-Layout
      </button>
    </div>
  );
}
```

**Update CanvasEditor to use toolbar:**

```typescript
const handleAddTurn = useCallback((speaker: 'user' | 'ai') => {
  const newTurn: Turn = {
    id: crypto.randomUUID(),
    type: 'turn',
    speaker,
    components: [],
    position: { x: 250, y: 100 } // Default position
  };
  
  // Add to nodes
  setNodes((nds) => [
    ...nds,
    {
      id: newTurn.id,
      type: 'turn',
      position: newTurn.position,
      data: {
        speaker: newTurn.speaker,
        componentsCount: 0
      }
    }
  ]);
  
  // Update flow
  const updatedFlow = {
    ...flow,
    steps: [...flow.steps, newTurn]
  };
  onUpdateFlow(updatedFlow);
}, [flow, onUpdateFlow, setNodes]);

const handleAddCondition = useCallback(() => {
  const newCondition: Condition = {
    id: crypto.randomUUID(),
    type: 'condition',
    label: 'New condition',
    branches: [
      { id: crypto.randomUUID(), condition: 'Yes' },
      { id: crypto.randomUUID(), condition: 'No' }
    ],
    position: { x: 250, y: 100 }
  };
  
  setNodes((nds) => [
    ...nds,
    {
      id: newCondition.id,
      type: 'condition',
      position: newCondition.position,
      data: {
        label: newCondition.label,
        branches: newCondition.branches
      }
    }
  ]);
  
  const updatedFlow = {
    ...flow,
    steps: [...flow.steps, newCondition]
  };
  onUpdateFlow(updatedFlow);
}, [flow, onUpdateFlow, setNodes]);
```

**Acceptance Criteria:**
- [ ] Toolbar appears on left side of canvas
- [ ] "Add AI Turn" creates new AI turn node
- [ ] "Add User Turn" creates new user turn node
- [ ] "Add Condition" creates new condition node with 2 branches
- [ ] New nodes appear at default position
- [ ] Flow state updates when nodes are added

---

#### 1.7: Basic Auto-Layout (Day 5)

**Install:**
```bash
npm install elkjs
```

**Create:** `src/views/studio-canvas/utils/autoLayout.ts`

```typescript
import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';

const elk = new ELK();

export async function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
) {
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: 200,
      height: node.type === 'condition' ? 150 : 100,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(elkGraph);

  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    return {
      ...node,
      position: {
        x: layoutedNode?.x ?? 0,
        y: layoutedNode?.y ?? 0,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

**Add to CanvasEditor:**

```typescript
const handleAutoLayout = useCallback(async () => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
    nodes,
    edges,
    'TB'
  );
  
  setNodes(layoutedNodes);
  setEdges(layoutedEdges);
}, [nodes, edges, setNodes, setEdges]);
```

**Acceptance Criteria:**
- [ ] "Auto-Layout" button arranges nodes vertically
- [ ] Nodes are evenly spaced
- [ ] Connections are clear and don't overlap
- [ ] Layout runs automatically when new nodes added (optional)

---

#### Phase 1 Acceptance Criteria (Overall)

- [ ] New Flow dialog requires entry point selection
- [ ] Every new flow starts with locked Welcome node
- [ ] Welcome node has correct product name and default prompts
- [ ] Entry point displays in StudioView toolbar
- [ ] Canvas view is accessible from StudioView
- [ ] Can create Turn nodes (AI only - User turns are implicit)
- [ ] Can create Condition nodes with branches
- [ ] Can connect nodes by dragging from handles
- [ ] Cannot delete Welcome node (locked)
- [ ] Can reposition nodes manually (including Welcome)
- [ ] Auto-layout arranges nodes vertically
- [ ] MiniMap shows overview
- [ ] Zoom and pan work smoothly
- [ ] Flow state persists when switching to List view and back

---

## Phase 2: Node Editing & Multi-Component Turns (Weeks 3-4)

### Goal
Enable editing node content including PromptGroup component. Support multiple components within a single Turn. Welcome node is editable but cannot be deleted.

### Tasks

#### 2.1: Node Editor Panel (Day 6-7)

**Create:** `src/views/studio-canvas/NodeEditor.tsx`

```typescript
interface NodeEditorProps {
  step: Turn | Condition | null;
  onUpdate: (step: Turn | Condition) => void;
  onClose: () => void;
}

export function NodeEditor({ step, onUpdate, onClose }: NodeEditorProps) {
  if (!step) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-lg z-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold">
          {step.type === 'turn' ? 'Edit Turn' : 'Edit Condition'}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {step.type === 'turn' ? (
          <TurnEditor turn={step} onUpdate={onUpdate} />
        ) : (
          <ConditionEditor condition={step} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}
```

**Create:** `src/views/studio-canvas/editors/TurnEditor.tsx`

```typescript
import { Turn, Component } from '../../studio/types';

interface TurnEditorProps {
  turn: Turn;
  onUpdate: (turn: Turn) => void;
}

export function TurnEditor({ turn, onUpdate }: TurnEditorProps) {
  const handleAddComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: crypto.randomUUID(),
      type,
      content: getDefaultContent(type)
    };
    
    onUpdate({
      ...turn,
      components: [...turn.components, newComponent]
    });
  };

  const handleUpdateComponent = (componentId: string, updates: Partial<Component>) => {
    onUpdate({
      ...turn,
      components: turn.components.map(c => 
        c.id === componentId ? { ...c, ...updates } : c
      )
    });
  };

  const handleDeleteComponent = (componentId: string) => {
    onUpdate({
      ...turn,
      components: turn.components.filter(c => c.id !== componentId)
    });
  };

  return (
    <div className="space-y-4">
      {/* Turn metadata */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label (optional)
        </label>
        <input
          type="text"
          value={turn.label || ''}
          onChange={(e) => onUpdate({ ...turn, label: e.target.value })}
          placeholder="e.g., Check eligibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phase (optional)
        </label>
        <select
          value={turn.phase || ''}
          onChange={(e) => onUpdate({ ...turn, phase: e.target.value as FlowPhase || undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">No phase</option>
          <option value="welcome">Welcome</option>
          <option value="intent">Intent Recognition</option>
          <option value="info">Information Gathering</option>
          <option value="action">Action</option>
        </select>
      </div>

      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Components
          </label>
          {!turn.locked && <ComponentPaletteMenu onAdd={handleAddComponent} />}
        </div>

        <div className="space-y-2">
          {turn.components.map((component, index) => (
            <ComponentEditor
              key={component.id}
              component={component}
              index={index}
              onUpdate={(updates) => handleUpdateComponent(component.id, updates)}
              onDelete={() => handleDeleteComponent(component.id)}
              isLocked={turn.locked && turn.phase === 'welcome'} // Can edit Welcome, but guidance shown
            />
          ))}

          {turn.components.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              No components yet. Click + to add one.
            </div>
          )}
        </div>
        
        {/* Welcome node guidance */}
        {turn.locked && turn.phase === 'welcome' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="font-semibold text-blue-900 mb-1">ℹ️ Welcome Best Practice</div>
            <div className="text-blue-700">
              This welcome message follows LinkedIn VCA guidelines. You can customize the prompts,
              but keeping the {{'{{'}}productName{{'}}'}} placeholder is recommended.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultContent(type: Component['type']) {
  switch (type) {
    case 'message':
      return { text: '' };
    case 'infoMessage':
      return { title: '', body: '' };
    case 'actionCard':
      return { 
        loadingTitle: 'Processing...', 
        successTitle: 'Done!',
        failureTitle: 'Failed'
      };
    case 'buttons':
      return { options: [] };
    case 'input':
      return { placeholder: '' };
    case 'promptGroup':
      return {
        title: 'Not sure where to start? You can try:',
        prompts: ['Prompt 1', 'Prompt 2', 'Prompt 3']
      };
  }
}
```

**Create:** `src/views/studio-canvas/editors/ComponentPaletteMenu.tsx`

```typescript
import { Component } from '../../studio/types';

interface ComponentPaletteMenuProps {
  onAdd: (type: Component['type']) => void;
}

export function ComponentPaletteMenu({ onAdd }: ComponentPaletteMenuProps) {
  return (
    <details className="relative">
      <summary className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
        + Add Component
      </summary>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
        <button
          onClick={() => onAdd('message')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          💬 Message
        </button>
        <button
          onClick={() => onAdd('infoMessage')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          ℹ️ Info Message
        </button>
        <button
          onClick={() => onAdd('actionCard')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          ⚡ Action Card
        </button>
        <button
          onClick={() => onAdd('buttons')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          🔘 Buttons
        </button>
        <button
          onClick={() => onAdd('input')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          ✏️ Input
        </button>
        <button
          onClick={() => onAdd('promptGroup')}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          💡 Prompt Group
        </button>
      </div>
    </details>
  );
}
```

**Create:** `src/views/studio-canvas/editors/PromptGroupEditor.tsx`

```typescript
import { PromptGroupContent } from '../../studio/types';

interface PromptGroupEditorProps {
  content: PromptGroupContent;
  onChange: (content: PromptGroupContent) => void;
  isLocked?: boolean;
}

export function PromptGroupEditor({ content, onChange, isLocked }: PromptGroupEditorProps) {
  const handleAddPrompt = () => {
    onChange({
      ...content,
      prompts: [...content.prompts, `Prompt ${content.prompts.length + 1}`]
    });
  };
  
  const handleUpdatePrompt = (index: number, value: string) => {
    const updated = [...content.prompts];
    updated[index] = value;
    onChange({ ...content, prompts: updated });
  };
  
  const handleDeletePrompt = (index: number) => {
    onChange({
      ...content,
      prompts: content.prompts.filter((_, i) => i !== index)
    });
  };
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Heading
        </label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Prompts {isLocked && '(Recommended: 2-3 prompts)'}
          </label>
          <button
            onClick={handleAddPrompt}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-2">
          {content.prompts.map((prompt, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                placeholder={`Prompt ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleDeletePrompt(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                disabled={content.prompts.length <= 1}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Clicking a node opens editor panel on right side
- [ ] Can edit turn label and phase
- [ ] Welcome node shows guidance message
- [ ] Welcome node is editable but shows lock icon
- [ ] Cannot delete Welcome node from canvas or editor
- [ ] Can add components via dropdown menu (including PromptGroup)
- [ ] PromptGroup editor allows adding/editing/deleting prompts
- [ ] Can edit component content (reuse existing editors)
- [ ] Can delete non-locked components
- [ ] Can reorder components (drag handles)
- [ ] Changes update the node immediately
- [ ] Preview reflects changes in real-time

---

#### 2.2: Condition Editor (Day 8)

**Create:** `src/views/studio-canvas/editors/ConditionEditor.tsx`

```typescript
import { Condition, Branch } from '../../studio/types';

interface ConditionEditorProps {
  condition: Condition;
  onUpdate: (condition: Condition) => void;
}

export function ConditionEditor({ condition, onUpdate }: ConditionEditorProps) {
  const handleAddBranch = () => {
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      condition: `Option ${condition.branches.length + 1}`
    };
    onUpdate({
      ...condition,
      branches: [...condition.branches, newBranch]
    });
  };

  const handleUpdateBranch = (branchId: string, updates: Partial<Branch>) => {
    onUpdate({
      ...condition,
      branches: condition.branches.map(b =>
        b.id === branchId ? { ...b, ...updates } : b
      )
    });
  };

  const handleDeleteBranch = (branchId: string) => {
    if (condition.branches.length <= 2) {
      alert('Condition must have at least 2 branches');
      return;
    }
    onUpdate({
      ...condition,
      branches: condition.branches.filter(b => b.id !== branchId)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Label
        </label>
        <input
          type="text"
          value={condition.label}
          onChange={(e) => onUpdate({ ...condition, label: e.target.value })}
          placeholder="e.g., User has Premium subscription?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={condition.description || ''}
          onChange={(e) => onUpdate({ ...condition, description: e.target.value })}
          placeholder="Additional context about this condition"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={2}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Branches
          </label>
          <button
            onClick={handleAddBranch}
            className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
          >
            + Add Branch
          </button>
        </div>

        <div className="space-y-2">
          {condition.branches.map((branch, index) => (
            <div key={branch.id} className="flex items-center gap-2">
              <input
                type="text"
                value={branch.condition}
                onChange={(e) => handleUpdateBranch(branch.id, { condition: e.target.value })}
                placeholder={`Branch ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              {condition.branches.length > 2 && (
                <button
                  onClick={() => handleDeleteBranch(branch.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Can edit condition label and description
- [ ] Can add new branches (unlimited)
- [ ] Can edit branch names
- [ ] Can delete branches (minimum 2)
- [ ] Changes update node handles immediately

---

#### Phase 2 Acceptance Criteria (Overall)

- [ ] Clicking any node opens editor panel
- [ ] Welcome node is editable (label, components)
- [ ] Welcome node cannot be deleted
- [ ] Welcome node shows best practice guidance
- [ ] Can edit all Turn properties (speaker, label, phase)
- [ ] Can add multiple components to a Turn
- [ ] PromptGroup component works in editor and preview
- [ ] Can add/edit/delete individual prompts
- [ ] Can edit each component's content
- [ ] Can delete non-locked components
- [ ] Can edit Condition properties (label, description, branches)
- [ ] Node appearance updates when content changes
- [ ] Preview renders multiple components correctly
- [ ] Preview renders PromptGroup with clickable prompts

---

## Phase 3: Preview Traversal, Variables & Polish (Week 5)

### Goal
Make preview follow branching logic. Implement variable replacement for {{productName}}. Add polish and templates.

### Tasks

#### 3.1: Branching Traversal Engine (Day 9-10)

**Create:** `src/utils/flowTraversal.ts`

```typescript
import { Flow, Step, Turn, Condition } from '../views/studio/types';

export class FlowTraverser {
  private flow: Flow;
  private currentStepId: string;
  private visitedSteps: Set<string> = new Set();

  constructor(flow: Flow) {
    this.flow = flow;
    this.currentStepId = flow.startStepId;
  }

  getCurrentStep(): Step | undefined {
    return this.flow.steps.find(s => s.id === this.currentStepId);
  }

  getNextStep(branchId?: string): Step | undefined {
    const current = this.getCurrentStep();
    if (!current) return undefined;

    // Find connection from current step
    const connection = this.flow.connections.find(conn => {
      if (branchId) {
        // For conditions, match specific branch
        return conn.source === current.id && conn.sourceHandle === branchId;
      } else {
        // For turns, any connection works
        return conn.source === current.id;
      }
    });

    if (!connection) return undefined;

    const nextStep = this.flow.steps.find(s => s.id === connection.target);
    if (nextStep) {
      this.currentStepId = nextStep.id;
      this.visitedSteps.add(nextStep.id);
    }

    return nextStep;
  }

  getBranches(): Array<{ id: string; label: string }> {
    const current = this.getCurrentStep();
    if (current?.type !== 'condition') return [];

    return current.branches.map(branch => ({
      id: branch.id,
      label: branch.condition
    }));
  }

  reset() {
    this.currentStepId = this.flow.startStepId;
    this.visitedSteps.clear();
  }
}
```

**Update:** `src/views/studio/FlowPreview.tsx`

Add branch selection UI when condition is encountered:

```typescript
// When traverser encounters a condition
if (currentStep.type === 'condition') {
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 italic">
        Condition: {currentStep.label}
      </div>
      {traverser.getBranches().map(branch => (
        <button
          key={branch.id}
          onClick={() => handleSelectBranch(branch.id)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {branch.label}
        </button>
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Preview starts at Welcome node
- [ ] {{productName}} is replaced with actual product name in preview
- [ ] PromptGroup renders with clickable prompts
- [ ] Clicking prompt advances flow (if connected)
- [ ] When condition is reached, shows branch buttons
- [ ] Clicking branch continues flow down that path
- [ ] Can follow entire flow from start to end
- [ ] Can reset and try different branches

---

#### 3.2: Variable Replacement System (Day 11)

**Create:** `src/utils/variableReplacement.ts`

```typescript
import { Flow, Component } from '../views/studio/types';

// Replace variables in text content
export function replaceVariables(text: string, settings: Flow['settings']): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    switch (variable) {
      case 'productName':
        return settings.productName;
      // Future: Add more variables like userName, accountType, etc.
      default:
        return match; // Keep unreplaced if not found
    }
  });
}

// Process component for preview
export function processComponentForPreview(
  component: Component,
  settings: Flow['settings']
): Component {
  if (component.type === 'message') {
    return {
      ...component,
      content: {
        ...component.content,
        text: replaceVariables(component.content.text || '', settings)
      }
    };
  }
  
  if (component.type === 'infoMessage') {
    return {
      ...component,
      content: {
        ...component.content,
        title: component.content.title ? replaceVariables(component.content.title, settings) : '',
        body: component.content.body ? replaceVariables(component.content.body, settings) : ''
      }
    };
  }
  
  // Other component types pass through unchanged
  return component;
}
```

**Update:** `src/views/studio/FlowPreview.tsx`

Use variable replacement when rendering:

```typescript
import { processComponentForPreview } from '@/utils/variableReplacement';

// In component rendering:
const processedComponent = processComponentForPreview(component, flow.settings);
```

**Acceptance Criteria:**
- [ ] {{productName}} in Message components is replaced in preview
- [ ] {{productName}} in InfoMessage components is replaced in preview
- [ ] Welcome message shows actual product name
- [ ] Editor still shows {{productName}} placeholder (not replaced)
- [ ] System is extensible for future variables

---

#### 3.3: Flow Templates (Day 11-12)

**Create:** `src/utils/flowTemplates.ts`

```typescript
import { Flow } from '../views/studio/types';

export const FLOW_TEMPLATES: Record<string, Flow> = {
  'simple-qa': {
    id: 'template-simple-qa',
    version: 2,
    title: 'Simple Q&A',
    description: 'Basic question and answer flow',
    steps: [
      {
        id: 'turn-1',
        type: 'turn',
        speaker: 'ai',
        phase: 'welcome',
        components: [
          { 
            id: 'c1', 
            type: 'message', 
            content: { text: 'Hi! How can I help you today?' } 
          }
        ],
        position: { x: 250, y: 0 }
      },
      {
        id: 'turn-2',
        type: 'turn',
        speaker: 'user',
        components: [
          { 
            id: 'c2', 
            type: 'input', 
            content: { placeholder: 'Ask a question...' } 
          }
        ],
        position: { x: 250, y: 150 }
      },
      {
        id: 'turn-3',
        type: 'turn',
        speaker: 'ai',
        phase: 'action',
        components: [
          { 
            id: 'c3', 
            type: 'message', 
            content: { text: 'Here\'s the answer to your question...' } 
          }
        ],
        position: { x: 250, y: 300 }
      }
    ],
    connections: [
      { id: 'e1', source: 'turn-1', target: 'turn-2' },
      { id: 'e2', source: 'turn-2', target: 'turn-3' }
    ],
    startStepId: 'turn-1',
    settings: { showDisclaimer: true, simulateThinking: false },
    lastModified: Date.now()
  },

  'eligibility-check': {
    id: 'template-eligibility',
    version: 2,
    title: 'Action with Eligibility Check',
    description: 'Flow with conditional branching based on user status',
    steps: [
      // Welcome
      {
        id: 'turn-1',
        type: 'turn',
        speaker: 'ai',
        phase: 'welcome',
        components: [
          { id: 'c1', type: 'message', content: { text: 'Hi! I can help you with that.' } }
        ],
        position: { x: 250, y: 0 }
      },
      // User intent
      {
        id: 'turn-2',
        type: 'turn',
        speaker: 'user',
        components: [
          { id: 'c2', type: 'input', content: { placeholder: 'I want to...' } }
        ],
        position: { x: 250, y: 150 }
      },
      // Condition: Check eligibility
      {
        id: 'condition-1',
        type: 'condition',
        label: 'User is eligible?',
        description: 'Check if user meets requirements',
        branches: [
          { id: 'branch-yes', condition: 'Eligible' },
          { id: 'branch-no', condition: 'Not eligible' }
        ],
        position: { x: 250, y: 300 }
      },
      // YES path
      {
        id: 'turn-yes',
        type: 'turn',
        speaker: 'ai',
        phase: 'action',
        components: [
          { 
            id: 'c3', 
            type: 'actionCard', 
            content: { 
              loadingTitle: 'Processing...',
              successTitle: 'Done!',
              successDescription: 'Your request has been completed.'
            } 
          }
        ],
        position: { x: 100, y: 500 }
      },
      // NO path
      {
        id: 'turn-no',
        type: 'turn',
        speaker: 'ai',
        phase: 'info',
        components: [
          { 
            id: 'c4', 
            type: 'infoMessage', 
            content: { 
              title: 'Not eligible',
              body: 'You don\'t meet the requirements for this action.'
            } 
          }
        ],
        position: { x: 400, y: 500 }
      }
    ],
    connections: [
      { id: 'e1', source: 'turn-1', target: 'turn-2' },
      { id: 'e2', source: 'turn-2', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', sourceHandle: 'branch-yes', target: 'turn-yes' },
      { id: 'e4', source: 'condition-1', sourceHandle: 'branch-no', target: 'turn-no' }
    ],
    startStepId: 'turn-1',
    settings: { showDisclaimer: true, simulateThinking: false },
    lastModified: Date.now()
  }
};
```

**Add template picker to Dashboard:**

```typescript
// In DashboardView.tsx
<button onClick={() => createFlowFromTemplate('eligibility-check')}>
  Use Template: Eligibility Check
</button>
```

**Update templates to use new flow creation:**

```typescript
export function createFlowFromTemplate(
  templateId: string,
  entryPoint: EntryPointId
): Flow {
  // Start with base flow for entry point
  const baseFlow = createNewFlow(entryPoint);
  
  // Add template-specific nodes
  const template = TEMPLATE_NODES[templateId];
  
  return {
    ...baseFlow,
    title: template.title,
    description: template.description,
    steps: [
      ...baseFlow.steps, // Keep Welcome node
      ...template.additionalSteps // Add template steps
    ],
    connections: template.connections
  };
}
```

**Acceptance Criteria:**
- [ ] Templates available from dashboard
- [ ] Each template requires entry point selection
- [ ] Templates include Welcome node automatically
- [ ] Can customize template after creation
- [ ] Templates demonstrate best practices

---

#### 3.4: Visual Polish (Day 13)

**Tasks:**
- [ ] Color-code nodes by phase (welcome=blue, intent=purple, info=orange, action=green)
- [ ] Add icons to node headers
- [ ] Smooth animations for node creation/deletion
- [ ] Better edge styling (curved edges, arrows)
- [ ] Keyboard shortcuts (Delete key deletes non-locked nodes, Cmd+Z undo)
- [ ] Prevent deletion of Welcome node (show tooltip)
- [ ] Loading states
- [ ] Error states (disconnected nodes, empty components)

**Acceptance Criteria:**
- [ ] Welcome node visually distinguished (lock icon, special color)
- [ ] Nodes have visual hierarchy by phase
- [ ] Smooth transitions feel polished
- [ ] Keyboard shortcuts work (except Delete on Welcome node)
- [ ] Attempting to delete Welcome shows friendly message
- [ ] Validation warnings are helpful, not blocking

---

## Phase 4: Canvas View (Optional - Weeks 6-8)

### Goal
If needed, add full manual positioning control and advanced features.

### Tasks

- [ ] Disable auto-layout, enable manual positioning
- [ ] Alignment guides (snap to grid)
- [ ] Multi-select nodes
- [ ] Copy/paste nodes
- [ ] Search/filter nodes
- [ ] Comments/annotations
- [ ] Export as image
- [ ] Collaborative cursors (very advanced)

---

## Migration Plan

### Automatic Migration on Load

```typescript
// In StudioView.tsx useEffect
useEffect(() => {
  if (id) {
    const loaded = flowStorage.getFlow(id);
    if (loaded) {
      // Check version
      if (!loaded.version || loaded.version < 2) {
        // Migrate old flow
        const migrated = migrateFlowToSteps(loaded);
        setFlow(migrated);
        // Auto-save migrated version
        flowStorage.saveFlow(migrated);
      } else {
        setFlow(loaded);
      }
    }
  }
}, [id]);
```

### Preserve Backward Compatibility

Keep old ScriptEditor working for List view. Users can switch between Canvas and List views freely.

---

## Success Metrics

After implementation, we should be able to:

- [ ] Create a new flow with proper Welcome node in under 30 seconds
- [ ] Welcome node automatically includes product name and relevant prompts
- [ ] Create a "Cancel Subscription" flow with branching in under 5 minutes
- [ ] Visualize complex flows with 3+ conditions clearly
- [ ] Preview flows with variable replacement working correctly
- [ ] Click through prompts and branches in preview
- [ ] Export flows as clean JSON for engineers
- [ ] Onboard a new designer in under 10 minutes

---

## User Experience Principles

### Entry Point is Required
- Every flow must have a defined entry point
- Entry point determines product name and default prompts
- Cannot create flow without selecting entry point

### Welcome Node is Special
- Every flow starts with a Welcome node
- Welcome node follows LinkedIn VCA best practices
- Welcome node is locked (cannot be deleted)
- Welcome node is editable (can customize message and prompts)
- {{productName}} variable ensures consistency

### User Turns are Implicit
- User interactions happen through AI component actions
- Buttons, prompts, inputs imply user response
- No separate "User Turn" nodes needed (keeps graph clean)
- Future: Complex forms may need explicit user nodes

### Prompts are Flexible
- Default prompts based on entry point
- Designer can add, edit, or remove prompts
- Prompts are editable text (not preset library)
- Recommended: 2-3 prompts for clarity

---

## Technical Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Use React Flow | Battle-tested, feature-rich, good docs | 2026-01-20 |
| Entry point required | Ensures consistency, enables smart defaults | 2026-01-20 |
| Welcome node always first | Follows VCA best practices | 2026-01-20 |
| Welcome node locked | Prevents accidental deletion | 2026-01-20 |
| User turns implicit | Keeps graph clean, matches UX reality | 2026-01-20 |
| Prompts are editable text | Flexibility over rigid presets | 2026-01-20 |
| Node-based canvas | Better for designers, industry standard | 2026-01-20 |
| Keep List view | Backward compatibility, fallback option | 2026-01-20 |
| Auto-layout by default | Removes positioning complexity | 2026-01-20 |
| ELK for layout | Standard graph layout algorithm | 2026-01-20 |
| Variable replacement | Enable dynamic content (product names) | 2026-01-20 |
| PromptGroup component | Native support for suggested prompts | 2026-01-20 |

---

## Questions & Answers

**Q: Can a designer create a flow without a Welcome node?**  
A: No. Every flow must start with a Welcome node. This ensures consistency with VCA best practices.

**Q: Can a designer delete the Welcome node?**  
A: No. The Welcome node is locked and cannot be deleted. It can be edited, but not removed.

**Q: What if the default prompts don't fit my use case?**  
A: Designers can fully customize the prompts. The defaults are just a starting point based on the entry point.

**Q: What if a designer wants to create a very simple linear flow?**  
A: Canvas still works great. It's just a vertical sequence. No branches needed.

**Q: How do we handle very large flows (50+ nodes)?**  
A: MiniMap for navigation, zoom controls, collapsible sections (future).

**Q: Can engineers implement the flow directly from the JSON?**  
A: Yes. The JSON clearly shows the graph structure with nodes and edges.

**Q: What about mobile preview?**  
A: Canvas is desktop-only for editing. Preview pane still shows mobile view.

---

## Next Steps

1. Review this plan with team
2. Get design approval for node styles
3. Start Phase 1 implementation
4. Test with real "Cancel Subscription" use case
5. Iterate based on feedback

---

**Last Updated:** January 20, 2026  
**Status:** Ready for implementation
