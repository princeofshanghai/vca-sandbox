

export type BlockType = 'user' | 'ai';

export type AIBlockVariant = 'message' | 'info' | 'action';

export interface BaseBlock {
    id: string;
    type: BlockType;
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
    successTitle: string;
    successDescription?: string;
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
}

export interface Flow {
    id: string;
    title: string;
    description?: string;
    blocks: Block[];
    settings?: GlobalSettings;
    lastModified: number;
}
