import { useState } from 'react';
import { Branch } from '@/views/studio/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ContextInterceptorMessageProps {
    variableName: string;
    branches: Branch[];
    onResolve: (value: string) => void;
}

export function ContextInterceptorMessage({
    variableName,
    branches,
    onResolve
}: ContextInterceptorMessageProps) {
    const [customValue, setCustomValue] = useState('');
    const [isCustom, setIsCustom] = useState(false);

    // Extract suggested values from branches (non-default branches with specific values)
    const suggestedValues = branches
        .filter(b => !b.isDefault && b.logic?.variable === variableName && b.logic?.value)
        .map(b => ({
            value: String(b.logic!.value),
            label: b.condition || String(b.logic!.value)
        }));

    // Check if there's a default/ELSE branch
    const hasDefaultBranch = branches.some(b => b.isDefault);
    const defaultBranchLabel = branches.find(b => b.isDefault)?.condition || 'Default';

    return (
        <div className="flex animate-in fade-in slide-in-from-bottom-2 duration-500 my-4">
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                {/* Stripe Decoration */}
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />

                <div className="pl-3">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                        Choose a value for <code className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-mono text-xs">{variableName}</code>:
                    </p>

                    <div className="space-y-2">
                        {/* Suggested Value Buttons */}
                        {suggestedValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {suggestedValues.map(({ value, label }) => (
                                    <Button
                                        key={value}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onResolve(value)}
                                        className="h-8 text-xs bg-white hover:bg-amber-100 border-amber-200 text-amber-900"
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Default/ELSE Branch Button */}
                        {hasDefaultBranch && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onResolve('__USE_DEFAULT__')}
                                className="h-8 text-xs bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700"
                            >
                                Use default ({defaultBranchLabel})
                            </Button>
                        )}

                        {/* Custom Value Input */}
                        {isCustom ? (
                            <div className="flex gap-2 animate-in fade-in zoom-in-95">
                                <Input
                                    autoFocus
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    placeholder="Type a value..."
                                    className="h-8 text-xs bg-white border-amber-200 focus-visible:ring-amber-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && customValue.trim()) {
                                            onResolve(customValue.trim());
                                        }
                                    }}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => customValue.trim() && onResolve(customValue.trim())}
                                    className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white border-0"
                                >
                                    Continue
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCustom(true)}
                                className="text-xs font-medium text-amber-600/70 hover:text-amber-700 flex items-center gap-1 transition-colors"
                            >
                                <Plus size={12} />
                                Enter a different value...
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
