

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

// A turn is one speaker's complete response
export interface Turn {
    id: string;
    type: 'turn';
    speaker: 'ai'; // AI Turns only
    phase?: FlowPhase;
    label?: string; // Custom label
    components: Component[]; // Can contain multiple components
    position?: { x: number; y: number }; // For canvas positioning
    locked?: boolean; // If true, node cannot be deleted (used for Welcome node)
}

export interface UserTurn {
    id: string;
    type: 'user-turn';
    label: string;
    inputType: 'text' | 'prompt' | 'button'; // How they interacted
    triggerValue?: string; // The specific value (e.g., "Remove User")
    position?: { x: number; y: number };
}

// Condition creates branches in the flow
export interface Condition {
    id: string;
    type: 'condition';
    label: string; // e.g., "User has Premium subscription?"
    description?: string; // Additional context
    branches: Branch[];
    position?: { x: number; y: number }; // For canvas positioning
}

// Each branch represents one possible path
export interface Branch {
    id: string;
    condition: string; // e.g., "Has Premium", "No subscription"
    logic?: {
        variable: string;
        value: string;
        operator: 'eq'; // For now just equality
    };
    isDefault?: boolean; // If true, this branch matches if no others do
    nextStepId?: string; // ID of next Step
}

// Sticky Note for annotations
export interface Note {
    id: string;
    type: 'note';
    label?: string;
    content: string;
    position?: { x: number; y: number };
}

// Step is Union of all node types
export type Step = Turn | UserTurn | Condition | StartNode | Note;

export interface StartNode {
    id: string;
    type: 'start';
    position?: { x: number; y: number };
}

// Connection between nodes on canvas
export interface Connection {
    id: string;
    source: string; // Source step ID
    sourceHandle?: string; // For conditions with multiple outputs
    target: string; // Target step ID
    targetHandle?: string; // For future support of multi-input nodes
}

