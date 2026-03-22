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

export function NewFlowDialog({ onCreateFlow, onClose }: NewFlowDialogProps) {
    const handleCreate = () => {
        import('@/utils/flowCreation').then(({ createNewFlow }) => {
            const newFlow = createNewFlow();
            onCreateFlow(newFlow);
            onClose();
        });
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[320px] p-shell-0 gap-shell-0 border-shell-border shadow-shell-lg bg-shell-bg dark:bg-shell-surface overflow-hidden" hideClose>
                <div className="px-shell-5 pt-shell-5">
                    <DialogHeader className="mb-shell-3">
                        <DialogTitle className="text-sm font-semibold text-shell-text">
                            Create project
                        </DialogTitle>
                    </DialogHeader>
                    <p className="mb-shell-5 text-xs leading-5 text-shell-muted">
                        New projects start with a generic welcome message and two starter prompts.
                    </p>
                </div>

                <DialogFooter className="p-shell-4 border-t border-shell-border-subtle flex flex-row justify-end gap-shell-1 sm:space-x-0">
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
