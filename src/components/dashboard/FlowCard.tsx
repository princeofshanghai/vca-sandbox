import { useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { Trash2, MoreVertical, FolderInput } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FlowCardProps {
    flow: FlowMetadata;
    folderName?: string;
    onDelete: (id: string) => void;
}

function getRelativeTimeString(date: number): string {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Edited just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Edited ${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Edited ${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Edited ${diffInDays}d ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `Edited ${diffInMonths}mo ago`;

    return `Edited ${Math.floor(diffInMonths / 12)}y ago`;
}

export const FlowCard = ({ flow, folderName, onDelete }: FlowCardProps) => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<Folder[]>([]);

    const handleClick = () => {
        navigate(`/studio/${flow.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            onDelete(flow.id);
        }
    };

    const handleLoadFolders = () => {
        setFolders(flowStorage.getAllFolders());
    };

    const handleMoveToFolder = (folderId: string | undefined) => {
        flowStorage.moveFlowToFolder(flow.id, folderId);
        window.location.reload();
    };

    return (
        <div
            onClick={handleClick}
            className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-40"
        >
            {/* Minimalist Card Design */}
            <div className="p-4 flex flex-col h-full bg-white">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {flow.title}
                        </h3>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                        <DropdownMenu.Root onOpenChange={(open) => { if (open) handleLoadFolders(); }}>
                            <DropdownMenu.Trigger asChild>
                                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreVertical size={16} />
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content className="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95">
                                    <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1.5">
                                        Move to...
                                    </DropdownMenu.Label>

                                    <DropdownMenu.Item
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                                        onClick={() => handleMoveToFolder(undefined)}
                                    >
                                        <FolderInput size={14} />
                                        <span>All Conversations</span>
                                    </DropdownMenu.Item>

                                    {folders.map(folder => (
                                        <DropdownMenu.Item
                                            key={folder.id}
                                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                                            onClick={() => handleMoveToFolder(folder.id)}
                                        >
                                            <FolderInput size={14} />
                                            <span>{folder.name}</span>
                                        </DropdownMenu.Item>
                                    ))}

                                    <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />

                                    <DropdownMenu.Item
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete</span>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </div>

                {/* Description or Preview */}
                <div className="flex-1 min-h-0 mb-4">
                    <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug">
                        {flow.previewText || flow.description || ""}
                    </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center gap-3 text-[13px] text-gray-500 pt-3 border-t border-gray-50 mt-auto">
                    <span>
                        {getRelativeTimeString(flow.lastModified)}
                    </span>
                    {folderName && (
                        <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                            <FolderInput size={10} />
                            <span className="max-w-[80px] truncate">{folderName}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
