// import React from 'react'; // Not needed in new JSX transform if configured, or just import React if needed.
// Actually, I don't use React explicitly either.

import * as Popover from '@radix-ui/react-popover';
import { Plus, X, GitBranch } from 'lucide-react';
import { Branch } from '../../studio/types';

interface BranchManagementContentProps {
    branches: Branch[];
    onChange: (branches: Branch[]) => void;
}

export function BranchManagementContent({ branches, onChange }: BranchManagementContentProps) {
    // Local state to manage edits before finding a way to commit them or just live update?
    // Live update seems best for this UI.

    const handleAddBranch = () => {
        const newBranch: Branch = {
            id: `branch-${Date.now()}`,
            condition: 'New Option',
        };
        onChange([...branches, newBranch]);
    };

    const handleRemoveBranch = (id: string) => {
        onChange(branches.filter(b => b.id !== id));
    };

    const handleUpdateBranch = (id: string, newLabel: string) => {
        onChange(branches.map(b => b.id === id ? { ...b, condition: newLabel } : b));
    };

    // Auto-focus new inputs? Maybe later.

    return (
        <Popover.Content
            side="top"
            sideOffset={12}
            align="center"
            className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-4 w-[320px] z-[1001] animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
            <div className="flex items-center gap-2 mb-3 text-gray-400 px-1">
                <GitBranch className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Condition Branches</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 thin-scrollbar">
                {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center gap-2 group">
                        {/* Drag handle could go here */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={branch.condition}
                                onChange={(e) => handleUpdateBranch(branch.id, e.target.value)}
                                className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                                placeholder="Condition label..."
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveBranch(branch.id)}
                            disabled={branches.length <= 1}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 cursor-default"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleAddBranch}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-gray-700 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all text-sm font-medium cursor-default"
            >
                <Plus className="w-4 h-4" />
                <span>Add Branch</span>
            </button>

            <Popover.Arrow className="fill-gray-900 stroke-gray-800" />
        </Popover.Content>
    );
}
