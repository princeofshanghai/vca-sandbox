import { useState } from 'react';
import { DirectEditor } from './DirectEditor';
import { MiniMap } from './MiniMap';
import { ChevronRight, Home } from 'lucide-react';
import { ProtoNode } from './types';


export const StudioV2View = () => {
    // We store the full tree in state
    const [rootNodes, setRootNodes] = useState<ProtoNode[]>([
        {
            id: '1',
            type: 'message',
            content: 'Hi there! With the help of AI, I can answer questions about administration or connect you to someone who can.'
        },
        {
            id: '2',
            type: 'message',
            content: 'This experience is powered by AI. Mistakes may be possible. Learn more'
        },
        {
            id: '3',
            type: 'message',
            content: 'Not sure where to start? You can try:',
            prompts: ['How can admins manage permissions for other admins?', 'How can I assign a seat to a user?']
        }
    ]);

    // Path tells us where we are: [] = root, ['nodeId', 'optionId'] = inside a branch
    const [path, setPath] = useState<string[]>([]);

    // Helper to get the current list of nodes based on path
    const getCurrentNodes = () => {
        let currentLevel = rootNodes;

        for (let i = 0; i < path.length; i += 2) {
            const nodeId = path[i];
            const optionId = path[i + 1];

            const node = currentLevel.find(n => n.id === nodeId);
            if (node && node.options) {
                const option = node.options.find(o => o.id === optionId);
                if (option) {
                    currentLevel = option.nodes;
                }
            }
        }
        return currentLevel;
    };

    // Helper to update the current level
    const updateCurrentNodes = (newNodes: ProtoNode[]) => {
        const newRoot = [...rootNodes];

        // If at root, easy
        if (path.length === 0) {
            setRootNodes(newNodes);
            return;
        }

        // If deep, we need to traverse and update
        let currentLevel = newRoot;
        for (let i = 0; i < path.length; i += 2) {
            const nodeId = path[i];
            const optionId = path[i + 1];

            const node = currentLevel.find(n => n.id === nodeId);
            if (node && node.options) {
                const option = node.options.find(o => o.id === optionId);
                if (option) {
                    if (i === path.length - 2) {
                        // Found the parent option, update its nodes
                        option.nodes = newNodes;
                    } else {
                        currentLevel = option.nodes;
                    }
                }
            }
        }
        setRootNodes(newRoot);
    };

    const addNode = (type: 'message' | 'question' | 'choice' | 'info' | 'prompt' | 'action') => {
        const newNode: ProtoNode = {
            id: Date.now().toString(),
            type,
            content: type === 'message' ? 'New message...' :
                type === 'question' ? 'What do you want to ask?' :
                    type === 'info' ? 'System Information' :
                        type === 'prompt' ? 'New Prompt' :
                            type === 'action' ? 'New Action' :
                                'Choice Question?',
            variable: type === 'question' ? 'variable_name' : undefined,
            options: type === 'choice' ? [
                { id: `opt-${Date.now()}-1`, label: 'Option A', nodes: [] },
                { id: `opt-${Date.now()}-2`, label: 'Option B', nodes: [] }
            ] : undefined,
            // Add default prompts if it's a prompt integration (prototype logic)
            prompts: type === 'prompt' ? ['Option 1', 'Option 2'] : undefined
        };
        updateCurrentNodes([...getCurrentNodes(), newNode]);
    };

    const updateNode = (id: string, updates: Partial<ProtoNode>) => {
        const current = getCurrentNodes();
        const updated = current.map(n => n.id === id ? { ...n, ...updates } : n);
        updateCurrentNodes(updated);
    };

    const handleDrillDown = (nodeId: string, optionId: string) => {
        setPath([...path, nodeId, optionId]);
    };

    const handleNavigateUp = (index: number) => {
        // index -1 means root. index 0 means first navigation pair...
        if (index === -1) {
            setPath([]);
        } else {
            // keep up to that navigation point (2 items per level)
            setPath(path.slice(0, (index + 1) * 2));
        }
    };

    const getBreadcrumbs = () => {
        const crumbs = [{ label: 'Main Flow', pathIndex: -1 }];
        let currentLevel = rootNodes;

        for (let i = 0; i < path.length; i += 2) {
            const nodeId = path[i];
            const optionId = path[i + 1];

            const node = currentLevel.find(n => n.id === nodeId);
            if (node && node.options) {
                const option = node.options.find(o => o.id === optionId);
                if (option) {
                    crumbs.push({ label: option.label, pathIndex: i / 2 });
                    currentLevel = option.nodes;
                }
            }
        }
        return crumbs;
    };

    return (
        <div className="flex h-full w-full bg-gray-50 overflow-hidden">
            {/* Logic Sidebar (MiniMap) */}
            <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
                <MiniMap nodes={rootNodes} activePath={path} />
            </div>

            {/* Main Direct Editor (Canvas) */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Breadcrumbs Navigation */}
                <div className="h-12 bg-white border-b border-gray-200 px-8 flex items-center gap-2 text-sm">
                    {getBreadcrumbs().map((crumb, i, arr) => (
                        <div key={i} className="flex items-center gap-2">
                            <button
                                onClick={() => handleNavigateUp(crumb.pathIndex)}
                                className={`flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-colors ${i === arr.length - 1 ? 'font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {i === 0 && <Home size={14} />}
                                {crumb.label}
                            </button>
                            {i < arr.length - 1 && <ChevronRight size={14} className="text-gray-400" />}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                    <div className="w-full max-w-2xl pb-32">
                        <DirectEditor
                            nodes={getCurrentNodes()}
                            onAddNode={addNode}
                            onUpdateNode={updateNode}
                            onDrillDown={handleDrillDown}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioV2View;
