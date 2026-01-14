
export type BlockType = 'message' | 'user-input' | 'action' | 'handoff' | 'system';

export type AIBlockVariant = 'standard' | 'info';

export interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface MessageBlock extends BaseBlock {
    type: 'message';
    variant: AIBlockVariant;
    content: {
        text?: string;        // For Standard
        title?: string;       // For Info
        body?: string;        // For Info (Markdown-like)
        sources?: { text: string; url?: string }[];
        showFeedback?: boolean; // For Info
    };
    metadata?: {
        prompts?: string[]; // Suggested replies
    };
}

export interface UserInputBlock extends BaseBlock {
    type: 'user-input';
    content: string; // The label/text the user "says"
    metadata?: {
        disableInput?: boolean; // If true, only clickable options allowed?
    };
}

export interface ActionBlock extends BaseBlock {
    type: 'action';
    content: {
        loadingTitle: string;
        successTitle: string;
        successDescription?: string;
    };
}

export interface HandoffBlock extends BaseBlock {
    type: 'handoff';
    content: string;
}

export type Block = MessageBlock | UserInputBlock | ActionBlock | HandoffBlock;

export interface GlobalSettings {
    showDisclaimer: boolean;
    simulateThinking: boolean;
}

export interface Flow {
    id: string;
    title: string;
    description?: string;
    blocks: Block[];
    settings?: GlobalSettings;
    lastModified: number;
}
