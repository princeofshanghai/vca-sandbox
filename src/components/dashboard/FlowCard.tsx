import { useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { Trash2, MoreVertical, FolderInput, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';

interface FlowCardProps {
    flow: FlowMetadata;
    folderName?: string;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
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

export const FlowCard = ({ flow, onDelete, onRename }: FlowCardProps) => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(flow.title);

    const handleClick = () => {
        navigate(`/studio/${flow.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            onDelete(flow.id);
        }
    };

    const handleLoadFolders = async () => {
        setFolders(await flowStorage.getAllFolders());
    };

    const handleMoveToFolder = (folderId: string | undefined) => {
        flowStorage.moveFlowToFolder(flow.id, folderId ?? null);
        window.location.reload();
    };

    const handleRename = () => {
        if (newTitle.trim() && newTitle !== flow.title) {
            onRename(flow.id, newTitle.trim());
        } else {
            setNewTitle(flow.title); // Reset if empty or unchanged
        }
        setIsRenaming(false);
    };

    const entryPointName = flow.entryPoint && flow.entryPoint in ENTRY_POINTS
        ? ENTRY_POINTS[flow.entryPoint as EntryPointId].productName
        : null;

    return (
        <div
            onClick={handleClick}
            className="group relative flex flex-col bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:border-blue-400/40 transition-all duration-500 cursor-pointer h-40"
        >
            {/* Swirling Premium Gradient Layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary Swirl */}
                <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)] transition-all duration-700 blur-3xl opacity-60" />

                {/* Accent Swirl */}
                <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_60%)] group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 blur-2xl" />

                {/* Secondary Accent */}
                <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_60%)] group-hover:-rotate-12 transition-all duration-1000 blur-2xl" />
            </div>

            {/* Content Container */}
            <div className="p-6 flex flex-col h-full bg-white/40 backdrop-blur-[2px] relative z-10 transition-colors duration-500 group-hover:bg-white/20">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-col gap-0.5 overflow-hidden w-full pr-2">
                        {isRenaming ? (
                            <input
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={handleRename}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRename();
                                    if (e.key === 'Escape') {
                                        setNewTitle(flow.title);
                                        setIsRenaming(false);
                                    }
                                    e.stopPropagation();
                                }}
                                className="font-medium text-sm text-gray-900 border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full"
                            />
                        ) : (
                            <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {flow.title}
                            </h3>
                        )}
                        {entryPointName && (
                            <span className="text-[13px] text-gray-500 truncate">
                                {entryPointName}
                            </span>
                        )}
                    </div>

                    <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
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
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer outline-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsRenaming(true);
                                        }}
                                    >
                                        <Pencil size={14} />
                                        <span>Rename</span>
                                    </DropdownMenu.Item>

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

                {/* Spacer */}
                <div className="flex-1 min-h-0 mb-2" />

                {/* Footer Metadata */}
                <div className="flex items-center gap-3 text-[13px] text-gray-500 pt-3 border-t border-gray-50 mt-auto">
                    <span>
                        {getRelativeTimeString(flow.lastModified)}
                    </span>
                </div>
            </div>
        </div>
    );
};
