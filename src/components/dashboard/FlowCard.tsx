import { useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FlowCardProps {
    flow: FlowMetadata;
    folderName?: string;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    isTrash?: boolean;
    onRestore?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
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

export const FlowCard = ({ flow, onDelete, onRename, isTrash, onRestore, onPermanentDelete }: FlowCardProps) => {
    const navigate = useNavigate();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newTitle, setNewTitle] = useState(flow.title);

    const handleClick = () => {
        if (!isTrash) navigate(`/studio/${flow.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(flow.id);
    };

    const handleRestore = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRestore?.(flow.id);
    };

    const handlePermanentDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPermanentDelete?.(flow.id);
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
            className={`group relative flex flex-col bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:border-blue-400/40 transition-all duration-0 cursor-pointer h-40 ${isTrash ? 'opacity-75 grayscale hover:grayscale-0' : ''}`}
        >
            {/* Swirling Premium Gradient Layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary Swirl */}
                <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_70%)] blur-3xl opacity-60" />

                {/* Accent Swirl */}
                <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06),transparent_60%)] blur-2xl" />

                {/* Secondary Accent */}
                <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_60%)] blur-2xl" />
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col h-full bg-white/40 backdrop-blur-[2px] relative z-10">
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
                            <h3 className="font-medium text-sm text-gray-900 truncate">
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
                        <DropdownMenu onOpenChange={(open) => { if (open && !isTrash) handleLoadFolders(); }}>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100 outline-none">
                                    <MoreVertical size={16} />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                {isTrash ? (
                                    <>
                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={handleRestore}
                                        >
                                            <span>Restore</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            className="gap-2 whitespace-nowrap"
                                            onClick={handlePermanentDelete}
                                        >
                                            <span>Delete permanently</span>
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuLabel>
                                            Move to...
                                        </DropdownMenuLabel>

                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={() => handleMoveToFolder(undefined)}
                                        >
                                            <span>All Conversations</span>
                                        </DropdownMenuItem>

                                        {folders.map(folder => (
                                            <DropdownMenuItem
                                                key={folder.id}
                                                className="gap-2"
                                                onClick={() => handleMoveToFolder(folder.id)}
                                            >
                                                <span>{folder.name}</span>
                                            </DropdownMenuItem>
                                        ))}

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsRenaming(true);
                                            }}
                                        >
                                            <span>Rename</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            variant="destructive"
                                            className="gap-2"
                                            onClick={handleDelete}
                                        >
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
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
