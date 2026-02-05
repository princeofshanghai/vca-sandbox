# VCA Sandbox — Technical Specification

**Project:** Virtual Chat Assistant (VCA) Sandbox  
**Version:** 1.0  
**Last Updated:** November 4, 2025

---

## Tech Stack

**Frontend:**
- React 18.3+
- TypeScript 5.0+
- Vite 5.0+

**Styling:**
- Tailwind CSS 3.4+
- shadcn/ui components (Tabs, Sidebar, Buttons, etc.)
- Radix UI primitives (via shadcn/ui)

**State Management:**
- React Context API for global state (selected view, selected component/flow)
- useState for local component state
- No Redux/Zustand needed for MVP

**Routing:**
- React Router 6.x
- Routes: `/components`, `/flows`, `/builder` (disabled)

**Data:**
- Static JSON files in `/src/data/` directory
- No API calls or backend for MVP

---

## Project Structure

```
vca-sandbox-6/
├── public/
│   └── (static assets)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNavigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainContent.tsx
│   │   ├── component-library/
│   │   │   ├── ComponentList.tsx
│   │   │   ├── ComponentDisplay.tsx
│   │   │   └── ComponentVariant.tsx
│   │   ├── flow-preview/
│   │   │   ├── FlowList.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── vca-components/
│   │   │   ├── messages/
│   │   │   │   ├── UserBubble.tsx
│   │   │   │   ├── AssistantBubble.tsx
│   │   │   │   └── SystemMessage.tsx
│   │   │   ├── actions/
│   │   │   │   ├── PrimaryButton.tsx
│   │   │   │   ├── SecondaryButton.tsx
│   │   │   │   └── LinkButton.tsx
│   │   │   ├── inputs/
│   │   │   │   ├── TextField.tsx
│   │   │   │   └── Dropdown.tsx
│   │   │   ├── feedback/
│   │   │   │   ├── TypingIndicator.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorMessage.tsx
│   │   │   └── layout/
│   │   │       ├── ChatContainer.tsx
│   │   │       └── MessageContainer.tsx
│   │   └── ui/
│   │       └── (shadcn/ui components)
│   ├── contexts/
│   │   └── AppContext.tsx
│   ├── data/
│   │   ├── components.json
│   │   └── flows/
│   │       ├── remove-user.json
│   │       ├── check-subscription.json
│   │       └── general-help.json
│   ├── types/
│   │   ├── component.ts
│   │   └── flow.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── flowEngine.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── Product-Requirements.md
│   ├── Technical-Specification.md
│   └── Development-Plan.md
├── .cursor/
│   └── rules/
│       ├── project-overview.mdc
│       └── tech-guidelines.mdc
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Component Architecture

### Layout Components (shadcn/ui)
- `TopNavigation` - Tab navigation using shadcn/ui Tabs component
- `Sidebar` - Reusable sidebar for both Component Library and Flow Preview views
- `MainContent` - Content area wrapper with consistent padding

### VCA Components (Custom from Figma)
- Built from Figma designs using MCP integration
- Fully typed with TypeScript interfaces
- Reusable across Component Library and Flow Preview
- Organized by category (messages, actions, inputs, feedback, layout)

### Container Components
- Handle data fetching and state management
- Pass data down to presentational components
- Examples: `ComponentList`, `FlowList`, `ChatPanel`

### Presentational Components
- Pure functions when possible
- Receive data via props only
- No side effects or state management
- Examples: `ComponentVariant`, `ChatMessage`, `UserBubble`

---

## Data Structure

### Component Data (`src/data/components.json`)

```json
{
  "componentGroups": [
    {
      "id": "messages",
      "name": "Messages",
      "components": [
        {
          "id": "user-bubble",
          "name": "User Message Bubble",
          "description": "Message bubble for user-sent messages, right-aligned with blue background",
          "variants": [
            {
              "name": "Default",
              "props": {
                "message": "This is a user message",
                "timestamp": "2:30 PM"
              }
            },
            {
              "name": "Long Message",
              "props": {
                "message": "This is a much longer user message that wraps to multiple lines to show how the bubble handles longer content",
                "timestamp": "2:30 PM"
              }
            }
          ],
          "states": ["default", "sending", "sent", "error"],
          "usageNotes": "Use for all messages sent by the user. Always right-aligned."
        }
      ]
    }
  ]
}
```

### Flow Data (`src/data/flows/remove-user.json`)

```json
{
  "id": "remove-user",
  "name": "Remove User",
  "category": "Account Management",
  "description": "Guide admin through removing a user from their account",
  "initialMessage": "How can I help you today?",
  "steps": [
    {
      "id": "step-1",
      "type": "assistant",
      "message": "How can I help you today?",
      "buttons": [
        {
          "id": "btn-remove-user",
          "label": "Remove a user",
          "nextStep": "step-2"
        },
        {
          "id": "btn-add-user",
          "label": "Add a user",
          "nextStep": null,
          "note": "Not implemented in this flow"
        },
        {
          "id": "btn-other",
          "label": "Something else",
          "nextStep": null
        }
      ]
    },
    {
      "id": "step-2",
      "type": "assistant",
      "message": "I can help you remove a user. Please provide the email address of the user you'd like to remove.",
      "expectsInput": true,
      "inputType": "email",
      "nextStep": "step-3"
    },
    {
      "id": "step-3",
      "type": "assistant",
      "message": "I found the user: {{userEmail}}. Are you sure you want to remove them?",
      "buttons": [
        {
          "id": "btn-confirm",
          "label": "Yes, remove user",
          "nextStep": "step-4"
        },
        {
          "id": "btn-cancel",
          "label": "Cancel",
          "nextStep": "step-cancelled"
        }
      ]
    },
    {
      "id": "step-4",
      "type": "assistant",
      "message": "✓ User removed successfully. They will receive an email notification.",
      "isEnd": true
    },
    {
      "id": "step-cancelled",
      "type": "assistant",
      "message": "No problem! Is there anything else I can help you with?",
      "isEnd": true
    }
  ]
}
```

---

## TypeScript Types

### Component Types (`src/types/component.ts`)

```typescript
export interface Component {
  id: string;
  name: string;
  description: string;
  variants: ComponentVariant[];
  states: ComponentState[];
  usageNotes: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>;
}

export type ComponentState = 
  | 'default' 
  | 'hover' 
  | 'focus' 
  | 'active' 
  | 'disabled' 
  | 'error';

export interface ComponentGroup {
  id: string;
  name: string;
  components: Component[];
}

export interface ComponentData {
  componentGroups: ComponentGroup[];
}
```

### Flow Types (`src/types/flow.ts`)

```typescript
export interface Flow {
  id: string;
  name: string;
  category: string;
  description: string;
  initialMessage: string;
  steps: FlowStep[];
}

export interface FlowStep {
  id: string;
  type: 'user' | 'assistant' | 'system';
  message: string;
  buttons?: FlowButton[];
  expectsInput?: boolean;
  inputType?: 'text' | 'email' | 'number';
  nextStep?: string | null;
  isEnd?: boolean;
}

export interface FlowButton {
  id: string;
  label: string;
  nextStep: string | null;
  note?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  buttons?: FlowButton[];
}

export interface FlowState {
  currentStepId: string;
  messages: ChatMessage[];
  isComplete: boolean;
}
```

### Context Types (`src/contexts/AppContext.tsx`)

```typescript
export interface AppState {
  currentView: 'components' | 'flows' | 'builder';
  selectedComponentId: string | null;
  selectedFlowId: string | null;
}

export interface AppContextType {
  state: AppState;
  setCurrentView: (view: AppState['currentView']) => void;
  selectComponent: (componentId: string) => void;
  selectFlow: (flowId: string) => void;
}
```

---

## State Management

### Global State (Context API)

**AppContext** manages:
- Current active view (Components, Flow Preview, or Builder)
- Selected component ID in Component Library
- Selected flow ID in Flow Preview

**Context Provider Pattern:**
```typescript
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentView: 'components',
    selectedComponentId: null,
    selectedFlowId: null,
  });

  const setCurrentView = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  const selectComponent = (componentId: string) => {
    setState(prev => ({ ...prev, selectedComponentId: componentId }));
  };

  const selectFlow = (flowId: string) => {
    setState(prev => ({ ...prev, selectedFlowId: flowId }));
  };

  return (
    <AppContext.Provider value={{ state, setCurrentView, selectComponent, selectFlow }}>
      {children}
    </AppContext.Provider>
  );
};
```

### Local State

Each component manages its own local state using `useState`:
- Chat panel: Current messages, flow progress
- Component display: Selected variant, selected state
- Sidebar: Hover states, scroll position

---

## Routing Structure

### Routes (`src/App.tsx`)

```typescript
<Routes>
  <Route path="/" element={<Navigate to="/components" replace />} />
  <Route path="/components" element={<ComponentLibraryView />} />
  <Route path="/flows" element={<FlowPreviewView />} />
  <Route path="/builder" element={<BuilderView />} /> {/* Disabled in MVP */}
  <Route path="*" element={<Navigate to="/components" replace />} />
</Routes>
```

**URL Structure:**
- `/components` - Component Library view
- `/components/:componentId` - Specific component selected (optional for MVP)
- `/flows` - Flow Preview view
- `/flows/:flowId` - Specific flow selected (optional for MVP)
- `/builder` - Flow Builder (disabled, redirects to /components)

---

## Utilities

### `cn()` - Conditional Classnames (`src/utils/cn.ts`)

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
```

**Usage:**
```typescript
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)} />
```

### Flow Engine (`src/utils/flowEngine.ts`)

```typescript
export class FlowEngine {
  private flow: Flow;
  private currentStepId: string;
  private messages: ChatMessage[];

  constructor(flow: Flow) {
    this.flow = flow;
    this.currentStepId = flow.steps[0].id;
    this.messages = [];
  }

  public getCurrentStep(): FlowStep | undefined {
    return this.flow.steps.find(step => step.id === this.currentStepId);
  }

  public handleButtonClick(buttonId: string): ChatMessage[] {
    const currentStep = this.getCurrentStep();
    if (!currentStep?.buttons) return this.messages;

    const button = currentStep.buttons.find(btn => btn.id === buttonId);
    if (!button || !button.nextStep) return this.messages;

    // Add user message (simulating user's selection)
    this.addMessage({
      type: 'user',
      content: button.label,
    });

    // Move to next step
    this.currentStepId = button.nextStep;
    const nextStep = this.getCurrentStep();

    if (nextStep) {
      this.addMessage({
        type: nextStep.type,
        content: nextStep.message,
        buttons: nextStep.buttons,
      });
    }

    return this.messages;
  }

  public reset(): void {
    this.currentStepId = this.flow.steps[0].id;
    this.messages = [];
  }

  private addMessage(data: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    this.messages.push({
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
      ...data,
    });
  }
}
```

---

## Performance Considerations

### Code Splitting
- Lazy load route components using React.lazy()
- Load VCA components on demand in Component Library

### Memoization
- Use React.memo() for expensive VCA components
- Use useMemo() for computed values (filtered lists, sorted data)
- Use useCallback() for event handlers passed to child components

### Bundle Size
- Tree-shake unused Tailwind classes in production
- Only import needed shadcn/ui components
- Minify production builds

---

## Development Tools

### Required Extensions (VS Code / Cursor)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Configuration Files

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tailwind.config.js`:**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## Testing Strategy (Phase 2)

**Unit Tests:**
- Flow engine logic
- Utility functions (cn, data transformations)
- Individual VCA components

**Integration Tests:**
- Component Library navigation
- Flow Preview interactions
- State management across views

**E2E Tests:**
- Complete user journeys
- Cross-browser compatibility
- Accessibility compliance

---

## Deployment

### Build Process
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Environment
- Development: Local Vite dev server (http://localhost:5173)
- Production: Static build deployed to internal hosting

---

## References

- Product Requirements: `docs/Product-Requirements.md`
- Development Plan: `docs/Development-Plan.md`
- React Documentation: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

**Document Control:**
- **Version:** 1.0
- **Created:** November 4, 2025
- **Last Updated:** November 4, 2025
- **Next Review:** After MVP completion

