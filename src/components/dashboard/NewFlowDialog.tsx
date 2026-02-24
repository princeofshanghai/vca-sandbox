import { useState } from 'react';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import { Flow } from '@/views/studio/types';
import { ShellButton } from '@/components/shell';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface NewFlowDialogProps {
    onCreateFlow: (flow: Flow) => void;
    onClose: () => void;
}

// Define explicit order for display
const ENTRY_POINT_ORDER: EntryPointId[] = [
    'flagship',
    'admin-center',
    'recruiter',
    'campaign-manager',
    'sales-navigator',
    'learning'
];

export function NewFlowDialog({ onCreateFlow, onClose }: NewFlowDialogProps) {
    const [selectedEntryPoint, setSelectedEntryPoint] = useState<EntryPointId>('flagship');

    const handleCreate = () => {
        // Import here to avoid circular dependency
        import('@/utils/flowCreation').then(({ createNewFlow }) => {
            const newFlow = createNewFlow(selectedEntryPoint);
            onCreateFlow(newFlow);
            onClose();
        });
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[320px] p-shell-0 gap-shell-0 border-shell-border-subtle shadow-shell-lg bg-shell-bg overflow-hidden" hideClose>
                <div className="px-shell-5 pt-shell-5">
                    <DialogHeader className="mb-shell-4">
                        <DialogTitle className="text-sm font-semibold text-shell-text">
                            Create project
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-shell-1 mb-shell-6">
                        <p className="block text-xs font-medium text-shell-muted mb-shell-2 px-shell-1">
                            Choose entry point
                        </p>

                        <div role="radiogroup" aria-label="Choose entry point" className="space-y-shell-1">
                            {ENTRY_POINT_ORDER.map((id) => {
                                const config = ENTRY_POINTS[id];
                                if (!config) return null;

                                const isSelected = selectedEntryPoint === id;

                                return (
                                    <ShellButton
                                        key={id}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setSelectedEntryPoint(id)}
                                        className={`h-auto w-full justify-start gap-2.5 px-shell-3 py-shell-2 text-xs transition-all border ${isSelected
                                            ? 'bg-shell-accent-soft border-shell-accent-border text-shell-accent-text'
                                            : 'bg-shell-bg border-transparent hover:bg-shell-surface hover:border-shell-border-subtle text-shell-muted'
                                            }`}
                                        variant="ghost"
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                            ? 'border-shell-accent bg-shell-accent'
                                            : 'border-shell-border bg-shell-bg'
                                            }`}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-shell-bg" />}
                                        </div>
                                        <span className="text-xs font-medium">{config.productName}</span>
                                    </ShellButton>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-shell-4 bg-shell-surface-subtle border-t border-shell-border-subtle flex flex-row justify-end gap-shell-1 sm:space-x-0">
                    <ShellButton
                        size="compact"
                        variant="outline"
                        onClick={onClose}
                        className="font-normal"
                    >
                        Cancel
                    </ShellButton>
                    <ShellButton
                        size="compact"
                        onClick={handleCreate}
                    >
                        Create project
                    </ShellButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
