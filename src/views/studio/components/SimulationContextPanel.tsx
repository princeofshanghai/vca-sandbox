import { useState, useMemo } from 'react';
import { Flow, Condition, Branch, Step } from '../types';
import { X, Plus, Trash2, Split, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface SimulationContextPanelProps {
    flow: Flow;
    variables: Record<string, string>;
    onUpdateVariables: (variables: Record<string, string>) => void;
    onClose: () => void;
}

export function SimulationContextPanel({
    flow,
    variables,
    onUpdateVariables,
    onClose
}: SimulationContextPanelProps) {
    const [newVarKey, setNewVarKey] = useState('');
    const [newVarValue, setNewVarValue] = useState('');

    // Extract all unique variables used in Condition nodes
    const detectedVariables = useMemo(() => {
        const vars = new Set<string>();
        flow.steps?.forEach((step: Step) => {
            if (step.type === 'condition') {
                (step as Condition).branches.forEach((branch: Branch) => {
                    if (branch.logic?.variable) {
                        vars.add(branch.logic.variable);
                    }
                });
            }
        });
        return Array.from(vars).sort();
    }, [flow.steps]);

    // Merge detected variables with currently set variables
    const allVariableKeys = useMemo(() => {
        const keys = new Set([...detectedVariables, ...Object.keys(variables)]);
        return Array.from(keys).sort();
    }, [detectedVariables, variables]);



    const handleSetVariable = (key: string, value: string) => {
        onUpdateVariables({
            ...variables,
            [key]: value
        });
    };

    const handleRemoveVariable = (key: string) => {
        const newVars = { ...variables };
        delete newVars[key];
        onUpdateVariables(newVars);
    };

    const handleAddNew = () => {
        if (newVarKey.trim()) {
            handleSetVariable(newVarKey.trim(), newVarValue.trim());
            setNewVarKey('');
            setNewVarValue('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-shell-bg border-l border-shell-border/70 w-[320px] shadow-xl z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-shell-border/70 shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-shell-text">
                    <Split size={16} className="text-amber-600" />
                    <span>Choose path</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-shell-surface" onClick={onClose}>
                    <X size={16} className="text-shell-muted" />
                </Button>
            </div>

            {/* Add Variable */}
            <div className="p-4 border-b border-shell-border/70 space-y-3 bg-shell-surface-subtle">
                <div className="flex gap-2">
                    <Input
                        placeholder="Key (e.g. user_tier)"
                        value={newVarKey}
                        onChange={(e) => setNewVarKey(e.target.value)}
                        className="h-8 text-xs flex-1"
                    />
                    <Input
                        placeholder="Value"
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                        className="h-8 text-xs flex-1"
                    />
                    <Button
                        size="icon"
                        className="h-8 w-8 shrink-0 bg-shell-accent hover:bg-shell-accent-hover"
                        onClick={handleAddNew}
                        disabled={!newVarKey.trim()}
                    >
                        <Plus size={14} />
                    </Button>
                </div>
            </div>

            {/* Variable List */}
            <div className="flex-1 overflow-y-auto thin-scrollbar">
                <div className="p-2">
                    {allVariableKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="w-10 h-10 rounded-full bg-shell-surface-subtle flex items-center justify-center mb-3">
                                <Split size={18} className="text-shell-muted" />
                            </div>
                            <p className="text-xs font-medium text-shell-muted">No variables found</p>
                            <p className="text-[11px] text-shell-muted mt-1">
                                Variables used in your Condition nodes will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {allVariableKeys.map(key => {
                                const isSet = key in variables;
                                const isDetected = detectedVariables.includes(key);
                                const value = variables[key] || '';

                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            "group flex items-start gap-2 p-2 rounded-md border transition-all",
                                            isSet
                                                ? "bg-shell-bg border-shell-border/70"
                                                : "bg-shell-surface-subtle border-transparent hover:bg-shell-surface"
                                        )}
                                    >
                                        <div className="mt-1.5">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                isSet ? "bg-shell-accent" : "bg-shell-border"
                                            )} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-xs font-medium text-shell-muted-strong truncate block" title={key}>
                                                    {key}
                                                </span>
                                                {!isDetected && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-shell-surface-subtle text-shell-muted border border-shell-border/60">
                                                        Manual
                                                    </span>
                                                )}
                                                {!isSet && isDetected && (
                                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600 border border-amber-100">
                                                        <AlertCircle size={8} />
                                                        Missing
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={value}
                                                    onChange={(e) => handleSetVariable(key, e.target.value)}
                                                    placeholder="Undefined"
                                                    className={cn(
                                                        "h-7 text-xs px-2",
                                                        !isSet && "text-shell-muted italic"
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {isSet && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 mt-0.5 text-shell-muted hover:text-shell-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveVariable(key)}
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-3 bg-shell-surface-subtle border-t border-shell-border/70 text-[11px] text-shell-muted leading-tight">
                Variables are used in Condition nodes to determine which path to take.
                <br /><br />
                If a variable is missing during preview, the simulation will pause and ask you for a value.
            </div>
        </div>
    );
}
