import {
    SmartNodeData,
    SmartNodeType,
    SmartCollectNodeData,
    SmartSlot,
    ComponentConfig,
    MockPerson,
    SmartActionNodeData,
    SmartResponseNodeData,
    SmartFollowUpNodeData,
    SmartEntryNodeData
} from '@/types/smartFlow';

// Runtime Types
export interface RuntimeVariable {
    name: string;
    value: unknown;
    type: 'person' | 'text' | 'date' | 'select';
}

export interface SmartFlowState {
    currentNodeId: string;
    variables: Record<string, RuntimeVariable>; // "targetUser" -> { ... }
    history: unknown[]; // For undo/debugging

    // For Smart Collection Nodes:
    internalNodeState: {
        activeSlotIndex: number; // 0, 1, 2...
        isDisambiguating: boolean; // Are we showing a "Did you mean?" menu?
        disambiguationCandidates?: MockPerson[];
    }
}

export interface EngineMessage {
    id: string;
    text?: string;
    component?: ComponentConfig;
    isSystemMessage?: boolean; // True if it's "Thinking..." or debug info
    buttons?: { label: string; value: string }[];
}

export class SmartFlowEngine {
    private nodes: Map<string, { id: string; type: string; data: SmartNodeData }> = new Map();
    private edges: Map<string, string> = new Map(); // sourceId -> targetId (Simple linear flow for now)

    private state: SmartFlowState = {
        currentNodeId: '',
        variables: {},
        history: [],
        internalNodeState: {
            activeSlotIndex: 0,
            isDisambiguating: false
        }
    };

    constructor(nodes: { id: string; type: string; data: SmartNodeData }[], edges: { source: string; target: string }[]) {
        // Hydrate the graph
        // STORE THE FULL NODE Object, not just data, so we can access .type
        nodes.forEach(n => this.nodes.set(n.id, n));
        // Simple edge mapping: find outgoing edge for each node
        edges.forEach(e => this.edges.set(e.source, e.target));

        // Find Start Node
        const startNode = nodes.find(n => n.type === 'smart-entry');
        if (startNode) {
            this.state.currentNodeId = startNode.id;
        }
    }

    public start(): EngineMessage[] {
        if (!this.state.currentNodeId) return [{ id: 'err', text: 'No Start Node', isSystemMessage: true }];
        return this.processCurrentNode();
    }

    public handleInput(input: string): EngineMessage[] {
        const nodeId = this.state.currentNodeId;
        const node = this.nodes.get(nodeId);

        if (!node) return [{ id: 'err', text: 'Lost in flow', isSystemMessage: true }];

        const nodeType = (node as unknown as { type: string }).type as SmartNodeType;

        // 1. Handle Smart Collection Logic
        if (nodeType === 'smart-collect') {
            return this.processInputForCollectNode(node as unknown as SmartCollectNodeData, input);
        }

        // Default: If we are not in a collect node but received input, 
        // it might be a button click for a follow-up or just stray input.
        // For now, assume it's valid if we are asking a question.
        // But if we are stuck, maybe auto-advance? 
        return [{ id: 'err', text: "Unexpected input at this stage." }];
    }

    // --- Core Logic: The Smart Collection Loop ---

    private processInputForCollectNode(node: SmartCollectNodeData, input: string): EngineMessage[] {
        const { internalNodeState } = this.state;
        const currentSlot = node.slots[internalNodeState.activeSlotIndex];

        // A. Handling Disambiguation Choice
        if (internalNodeState.isDisambiguating && internalNodeState.disambiguationCandidates) {
            // User input is likely the name of the candidate or "None"
            const chosen = internalNodeState.disambiguationCandidates.find(c => c.name === input);

            if (chosen) {
                // Resolved!
                this.saveVariable(currentSlot.variable, chosen, 'person');
                this.state.internalNodeState.isDisambiguating = false;
                this.state.internalNodeState.activeSlotIndex++;
                return this.advanceValidation(node);
            } else {
                return [{ id: 'err', text: "I didn't recognize that choice. Please select one of the options." }];
            }
        }

        // B. Handling Normal Input
        if (currentSlot.type === 'person') {
            return this.validatePersonInput(input, node.mockData || [], currentSlot);
        } else {
            // Text/Simple input
            this.saveVariable(currentSlot.variable, input, currentSlot.type);
            this.state.internalNodeState.activeSlotIndex++;
            return this.advanceValidation(node);
        }
    }

    private validatePersonInput(input: string, mockData: MockPerson[], slot: SmartSlot): EngineMessage[] {
        const lowerInput = input.toLowerCase();

        // Mock Data Default if empty
        const effectiveMockData = mockData.length > 0 ? mockData : [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
            { id: '3', name: 'John Davis', email: 'jd@example.com', role: 'user' }
        ];

        // 1. Exact Match (Name or Email)
        const exact = effectiveMockData.find(p => p.email.toLowerCase() === lowerInput || p.name.toLowerCase() === lowerInput);
        if (exact) {
            this.saveVariable(slot.variable, exact, 'person');
            this.state.internalNodeState.activeSlotIndex++;
            return this.advanceValidation(null as unknown as SmartCollectNodeData);
        }

        // 2. Fuzzy / Ambiguous Match
        const candidates = effectiveMockData.filter(p => p.name.toLowerCase().includes(lowerInput));

        if (candidates.length > 1) {
            // TRIGGER DISAMBIGUATION
            this.state.internalNodeState.isDisambiguating = true;
            this.state.internalNodeState.disambiguationCandidates = candidates;

            return [{
                id: 'ambiguous',
                text: `I found multiple people matching '${input}'. Did you mean:`,
                buttons: candidates.map(c => ({ label: c.name, value: c.name }))
            }];
        }

        if (candidates.length === 1) {
            this.saveVariable(slot.variable, candidates[0], 'person');
            this.state.internalNodeState.activeSlotIndex++;
            return this.advanceValidation(null as unknown as SmartCollectNodeData);
        }

        // 3. No Match
        return [{
            id: 'err-no-match',
            text: `I couldn't find anyone named '${input}'. Please try providing their email address instead.`
        }];
    }

    // Check if we are done with this node or need to ask the next question
    private advanceValidation(node: SmartCollectNodeData): EngineMessage[] {
        // If passed null (recursive step), retrieve from storage
        const actualNode = node || (this.nodes.get(this.state.currentNodeId) as unknown as { data: SmartCollectNodeData }).data;

        // Are we done with all slots?
        if (this.state.internalNodeState.activeSlotIndex >= actualNode.slots.length) {
            // Done with this node!
            return this.advanceToNextNode();
        }

        // Not done, ask the next question
        const nextSlot = actualNode.slots[this.state.internalNodeState.activeSlotIndex];

        const message: EngineMessage = {
            id: `ask-${nextSlot.id}`,
            text: nextSlot.question
        };

        return [message];
    }

    private advanceToNextNode(): EngineMessage[] {
        const nextNodeId = this.edges.get(this.state.currentNodeId);
        if (!nextNodeId) {
            return [{ id: 'end', text: 'Flow Complete', isSystemMessage: true }];
        }

        // Transition
        this.state.currentNodeId = nextNodeId;
        this.state.internalNodeState = { activeSlotIndex: 0, isDisambiguating: false };

        return this.processCurrentNode();
    }

    private processCurrentNode(): EngineMessage[] {
        const nodeId = this.state.currentNodeId;
        const node = this.nodes.get(nodeId);

        if (!node) return [{ id: 'err', text: 'Node not found' }];

        const nodeType = node.type as SmartNodeType;
        const data = node.data;

        // 1. Entry / Start
        if (nodeType === 'smart-entry') {
            const messages: EngineMessage[] = [];

            // Greeting Text
            const entryData = data as SmartEntryNodeData;
            if (entryData.greetingConfig?.props?.content) {
                messages.push({
                    id: 'greeting',
                    text: (entryData.greetingConfig.props.content as string),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    component: entryData.greetingConfig as any // Pass full config if needed
                });
            } else {
                messages.push({ id: 'greeting', text: "Hello!" });
            }

            return messages;
        }

        // 2. Collection
        if (nodeType === 'smart-collect') {
            return this.advanceValidation(data as SmartCollectNodeData);
        }

        // 3. Action
        if (nodeType === 'smart-action') {
            return this.processSmartAction(data as SmartActionNodeData);
        }

        // 4. Response
        if (nodeType === 'smart-response') {
            const respData = data as SmartResponseNodeData;
            // Process template strings in content
            let content = (respData.component?.props?.content as string) || '';
            // Simple variable substitution
            Object.entries(this.state.variables).forEach(([key, val]) => {
                const replacement = val.type === 'person' ? (val.value as MockPerson).name : String(val.value);
                content = content.replace(new RegExp(`\\$${key}`, 'g'), replacement);
            });

            return [{
                id: 'response',
                component: {
                    ...respData.component,
                    props: { ...respData.component?.props, content }
                },
                text: content // Also put in text for Fallback
            }];
        }

        // 5. Follow Up
        if (nodeType === 'smart-follow-up') {
            const followData = data as SmartFollowUpNodeData;
            const buttons = followData.suggestions?.map((s: string) => ({ label: s, value: s })) || [];
            return [{
                id: 'followup',
                text: followData.text || "Is there anything else?",
                buttons: buttons
            }];
        }

        return [{ id: 'unknown', text: `Unknown Node Type: ${nodeType}` }];
    }

    private processSmartAction(data: SmartActionNodeData): EngineMessage[] {
        const actionId = data.actionId;

        // MOCKED ACTIONS
        if (actionId === 'remove_license_api') {
            const targetVarName = (data.config?.target as string)?.replace('$', '');
            const targetUser = this.state.variables[targetVarName]?.value as MockPerson;

            if (targetUser) {
                console.log(`[SmartAction] Removing license for ${targetUser.name} (${targetUser.email})`);
                // In a real app, await emit/fetch here
            } else {
                console.error("[SmartAction] Target user not found in variables");
            }

            // Auto advance after action
            return this.advanceToNextNode();
        }

        // Fallback for unknown action
        console.warn(`[SmartAction] Unknown actionId: ${actionId}`);
        return this.advanceToNextNode();
    }

    private saveVariable(name: string, value: unknown, type: 'person' | 'text' | 'date' | 'select') {
        this.state.variables[name] = { name, value, type };
        console.log(`[SmartEngine] Saved ${name} =`, value);
    }
}
