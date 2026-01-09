
export type SmartNodeType =
    | 'smart-entry'
    | 'smart-collect'
    | 'smart-action'
    | 'smart-response'
    | 'smart-follow-up';

// --- Shared Config Types ---

export interface ComponentConfig {
    type: 'Message' | 'InfoMessage' | 'PromptGroup'; // Capitalized to match likely component names or standardized IDs
    props: Record<string, any>;
}

export interface MockPerson {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
}

// --- specific Node Data Interfaces (Flow Data) ---

export interface SmartEntryNodeData {
    entryPointId: string; // e.g., 'recruiter', 'learning'
    greetingConfig: {
        componentId: string;
        props: {
            content: string;
        };
    };
}

export interface SmartSlot {
    id: string;
    variable: string; // "targetUser"
    type: 'person' | 'text' | 'date' | 'select';
    options?: string[]; // For select type
    question: string; // "Who do you want to remove?"
    required?: boolean;
}

export interface SmartCollectNodeData {
    collectId?: string; // Optional identifier
    slots: SmartSlot[];
    mockData?: MockPerson[];
}

export interface SmartActionNodeData {
    actionId: string; // "remove_user"
    config?: Record<string, any>;
}

export interface SmartResponseNodeData {
    component: ComponentConfig;
}

export interface SmartFollowUpNodeData {
    text: string; // "Is there anything else?"
    suggestions: string[]; // ["Undo", "Home"]
}

// --- React Flow Node Types ---

export type SmartNodeData =
    | SmartEntryNodeData
    | SmartCollectNodeData
    | SmartActionNodeData
    | SmartResponseNodeData
    | SmartFollowUpNodeData
    | Record<string, unknown>; // Fallback for legacy
