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

    const handleUpdateBranch = (id: string, updates: Partial<Branch>) => {
        onChange(branches.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    // Auto-focus new inputs? Maybe later.

    return (
        <Popover.Content
            side="top"
            sideOffset={12}
            align="center"
            className="bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl p-4 w-[320px] z-[1001] animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
            <div className="flex items-center gap-2 mb-3 text-shell-dark-muted px-1">
                <GitBranch className="w-4 h-4" />
                <span className="text-xs font-medium text-shell-dark-muted">Condition branches</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 thin-scrollbar">
                {branches.map((branch) => (
                    <div key={branch.id} className="p-3 bg-shell-dark-bg/60 rounded-lg border border-shell-dark-border space-y-2">
                        {/* Branch Label Row */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={branch.condition}
                                    onChange={(e) => handleUpdateBranch(branch.id, { condition: e.target.value })}
                                    className="w-full bg-shell-dark-bg border border-shell-dark-border rounded-md px-3 py-1.5 text-sm text-shell-dark-text focus:border-shell-accent focus:outline-none focus:ring-1 focus:ring-shell-accent transition-all placeholder:text-shell-dark-muted"
                                    placeholder="Branch label (e.g. Yes)..."
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveBranch(branch.id)}
                                disabled={branches.length <= 1}
                                className="p-1.5 text-shell-dark-muted hover:text-shell-danger hover:bg-shell-dark-surface rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-shell-dark-muted cursor-pointer disabled:cursor-not-allowed"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Logic Row */}
                        <div className="flex items-center gap-2 px-1">
                            <GitBranch className="w-3 h-3 text-shell-dark-muted shrink-0" />
                            <div className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={branch.logic?.variable || ''}
                                    onChange={(e) => handleUpdateBranch(branch.id, {
                                        logic: {
                                            variable: e.target.value,
                                            value: branch.logic?.value || '',
                                            operator: 'eq'
                                        }
                                    })}
                                    className="w-full bg-shell-dark-bg border border-shell-dark-border rounded px-2 py-1 text-xs text-shell-accent-text placeholder:text-shell-dark-muted focus:border-shell-accent-border focus:outline-none"
                                    placeholder="Variable..."
                                />
                                <span className="text-shell-dark-muted text-xs font-mono">==</span>
                                <input
                                    type="text"
                                    value={branch.logic?.value || ''}
                                    onChange={(e) => handleUpdateBranch(branch.id, {
                                        logic: {
                                            variable: branch.logic?.variable || '',
                                            value: e.target.value,
                                            operator: 'eq'
                                        }
                                    })}
                                    className="w-full bg-shell-dark-bg border border-shell-dark-border rounded px-2 py-1 text-xs text-vca-positive placeholder:text-shell-dark-muted focus:border-shell-accent-border focus:outline-none"
                                    placeholder="Value..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleAddBranch}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-shell-dark-border text-shell-dark-muted hover:text-shell-accent-text hover:border-shell-accent-border hover:bg-shell-dark-surface transition-all text-sm font-medium cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>Add Branch</span>
            </button>

            <Popover.Arrow className="fill-shell-dark-panel stroke-shell-dark-border" />
        </Popover.Content>
    );
}
