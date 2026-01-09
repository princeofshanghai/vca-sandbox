import { HelpCircle, Split, CornerDownRight } from 'lucide-react';
import { ProtoNode } from './types';

interface MiniMapProps {
    nodes: ProtoNode[];
    activePath: string[]; // ['nodeId', 'optionId', ...]
}

export const MiniMap = ({ nodes, activePath }: MiniMapProps) => {

    // Recursive helper to render tree
    const renderLevel = (levelNodes: ProtoNode[], depth: number, parentPath: string[]) => {
        return (
            <div className={`space-y-1 ${depth > 0 ? 'ml-3 border-l border-gray-100 pl-3' : ''}`}>
                {levelNodes.map((node) => {
                    const isActive = activePath.includes(node.id);

                    return (
                        <div key={node.id}>
                            <div className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}>
                                {/* Icon */}
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${node.type === 'choice' ? 'text-orange-500'
                                    : node.type === 'question' ? 'text-indigo-500'
                                        : 'text-gray-400'
                                    }`}>
                                    {node.type === 'choice' ? <Split size={12} />
                                        : node.type === 'question' ? <HelpCircle size={12} />
                                            : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </div>

                                <span className={`text-[10px] truncate ${isActive ? 'font-medium text-blue-700' : 'text-gray-600'}`}>
                                    {node.content || 'Untitled'}
                                </span>
                            </div>

                            {/* Render Options/Branches if they exist */}
                            {node.options && (
                                <div className="ml-2 mt-1 space-y-1">
                                    {node.options.map(option => {
                                        // Check if this option is part of active path
                                        // Path format: [... nodeId, optionId ...]
                                        const nodeIndexInPath = activePath.indexOf(node.id);
                                        const isOptionActive = nodeIndexInPath !== -1 && activePath[nodeIndexInPath + 1] === option.id;

                                        return (
                                            <div key={option.id}>
                                                <div className={`text-[9px] flex items-center gap-1 py-0.5 px-2 rounded ${isOptionActive ? 'text-orange-600 font-bold bg-orange-50' : 'text-gray-400'}`}>
                                                    <CornerDownRight size={8} />
                                                    {option.label}
                                                </div>
                                                {/* Recursively render children if this option is the one selected OR we just want to show structure (for now only active path expanded) */}
                                                {isOptionActive && renderLevel(option.nodes, depth + 1, [...parentPath, node.id, option.id])}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Logic Flow</h3>
            {renderLevel(nodes, 0, [])}
        </div>
    );
};
