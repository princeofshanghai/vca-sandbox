// Shared Types for Studio V2

export type ProtoNode = {
    id: string;
    type: 'message' | 'question' | 'choice' | 'info' | 'prompt' | 'action';
    content?: string;
    variable?: string;
    // Compound fields (A single node can have these extras)
    prompts?: string[]; // e.g. ["Yes", "No"]
    info?: { title: string; message: string }; // Attached info card
    // For branching
    options?: {
        id: string;
        label: string;
        nodes: ProtoNode[]
    }[];
};
