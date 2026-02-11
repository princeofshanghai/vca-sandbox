import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardEmptyStateProps {
    isFolderEmpty: boolean;
    onCreateNew: () => void;
    isTrash?: boolean;
}

export const DashboardEmptyState = ({ isFolderEmpty, onCreateNew, isTrash }: DashboardEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center mb-5">
                {isTrash ? (
                    <Trash2 className="text-gray-400" size={24} strokeWidth={1.5} />
                ) : (
                    <FolderPlus className="text-blue-500" size={24} strokeWidth={1.5} />
                )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1.5 tracking-tight">
                {isTrash ? "Trash is empty" : (isFolderEmpty ? "This folder is empty" : "No projects yet")}
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed px-4">
                {isTrash
                    ? "Items in the trash will be permanently deleted after 30 days."
                    : (isFolderEmpty
                        ? "There are no projects in this folder. Move one here or start a new one."
                        : "Start building your first project to see it appear here in the dashboard.")}
            </p>
            {!isTrash && (
                <Button
                    onClick={onCreateNew}
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
                >
                    <Plus size={16} />
                    New
                </Button>
            )}
        </div>
    );
};
