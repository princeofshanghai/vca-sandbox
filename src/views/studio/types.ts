

export type BlockType = 'user' | 'ai';

export type AIBlockVariant = 'message' | 'info' | 'action';

export type FlowPhase = 'welcome' | 'intent' | 'info' | 'action';

export interface BaseBlock {
    id: string;
    type: BlockType;
    phase: FlowPhase;
}

export interface UserBlock extends BaseBlock {
    type: 'user';
    content: string; // The text the user sends
    metadata?: {
        disableInput?: boolean;
    };
}

export interface AIMessageContent {
    text?: string;
}

export interface AIInfoContent {
    title?: string;
    body?: string;
    sources?: { text: string; url?: string }[];
    showFeedback?: boolean;
}

export interface AIActionContent {
    loadingTitle: string;

    // Success State (Default)
    successTitle: string;
    successDescription?: string;

    // Failure State (Scenario)
    failureTitle?: string;
    failureDescription?: string;
}



export interface AIBlock extends BaseBlock {
    type: 'ai';
    variant: AIBlockVariant;
    content: AIMessageContent | AIInfoContent | AIActionContent;
    metadata?: {
        prompts?: string[];
    };
}

export type Block = UserBlock | AIBlock;

export interface GlobalSettings {
    showDisclaimer: boolean;
    simulateThinking: boolean;
    entryPoint: string; // Entry point ID (admin-center, recruiter, etc.)
    productName: string; // Display name for the product
}

export interface Flow {
    id: string;
    version?: number; // For migration
    title: string;
    description?: string;
    blocks: Block[]; // OLD: Keep for backward compatibility
    settings: GlobalSettings; // Required in new flows
    lastModified: number;

    // NEW: Turn-based model
    steps?: Step[]; // New turn/condition-based structure
    connections?: Connection[]; // Connections between steps
    startStepId?: string; // ID of the first step (Welcome node)
}

// ============================================
// NEW TURN-BASED MODEL (Canvas)
// ============================================

// Component types match the old AIBlockVariant
export type ComponentType = 'message' | 'infoMessage' | 'actionCard' | 'prompt';

// Component content union
export type ComponentContent =
    | AIMessageContent
    | AIInfoContent
    | AIActionContent
    | PromptContent;

// Individual prompt component
export interface PromptContent {
    text: string;
    showAiIcon?: boolean;
}

// A component is a single UI element
export interface Component {
    id: string;
    type: ComponentType;
    content: ComponentContent;
}

// A turn is one speaker's complete response with multiple components
export interface Turn {
    id: string;
    type: 'turn';
    speaker: 'user' | 'ai';
    phase?: FlowPhase;
    label?: string;
    components: Component[];
    position?: { x: number; y: number };
    locked?: boolean; // For Welcome node
}

// A condition creates branches in the flow
export interface Condition {
    id: string;
    type: 'condition';
    label: string;
    description?: string;
    branches: Branch[];
    position?: { x: number; y: number };
}

// Each branch in a condition
export interface Branch {
    id: string;
    label: string; // e.g., "Yes", "No", "Has Premium"
    nextStepId?: string;
}

// Step is either a Turn or Condition
export type Step = Turn | Condition;

// Connection between nodes on canvas
export interface Connection {
    id: string;
    source: string; // Source step ID
    sourceHandle?: string; // For conditions with multiple outputs
    target: string; // Target step ID
}

