import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { ShellButton } from '@/components/shell';

interface DashboardEmptyStateProps {
    isFolderEmpty: boolean;
    onCreateNew: () => void;
    isTrash?: boolean;
}

export const DashboardEmptyState = ({ isFolderEmpty, onCreateNew, isTrash }: DashboardEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-shell-bg border border-shell-border-subtle rounded-xl shadow-shell-sm flex items-center justify-center mb-5">
                {isTrash ? (
                    <Trash2 className="text-shell-muted" size={24} strokeWidth={1.5} />
                ) : (
                    <FolderPlus className="text-shell-accent" size={24} strokeWidth={1.5} />
                )}
            </div>
            <h3 className="text-lg font-medium text-shell-text mb-1.5 tracking-tight">
                {isTrash ? "Trash is empty" : (isFolderEmpty ? "This folder is empty" : "No projects yet")}
            </h3>
            <p className="text-shell-muted text-sm mb-6 leading-relaxed px-4">
                {isTrash
                    ? "Items in the trash will be permanently deleted after 30 days."
                    : (isFolderEmpty
                        ? "There are no projects in this folder. Move one here or start a new one."
                        : "Start building your first project to see it appear here in the dashboard.")}
            </p>
            {!isTrash && (
                <ShellButton
                    onClick={onCreateNew}
                    size="sm"
                    className="gap-2"
                >
                    <Plus size={16} />
                    New
                </ShellButton>
            )}
        </div>
    );
};
