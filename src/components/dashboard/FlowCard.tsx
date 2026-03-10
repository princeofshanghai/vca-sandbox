import { useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import {
    ShellIconButton,
    ShellInput,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuLabel,
    ShellMenuSeparator,
    ShellMenuTrigger,
} from '@/components/shell';

interface FlowCardProps {
    flow: FlowMetadata;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onDuplicate: (id: string) => void | Promise<void>;
    isDuplicating?: boolean;
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

export const FlowCard = ({
    flow,
    onDelete,
    onRename,
    onDuplicate,
    isDuplicating,
    isTrash,
    onRestore,
    onPermanentDelete
}: FlowCardProps) => {
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

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDuplicating) return;
        void onDuplicate(flow.id);
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
            className={`group cursor-pointer ${isTrash ? 'opacity-75 grayscale hover:grayscale-0' : ''}`}
        >
            <div className="relative min-h-[152px] overflow-hidden rounded-xl border border-shell-border/80 bg-shell-bg p-5 transition-colors duration-200 group-hover:border-shell-accent-border group-focus-within:border-shell-accent-border dark:border-shell-border/55 dark:bg-shell-surface-subtle md:p-6">
                <div className="flex min-h-[104px] items-stretch justify-between gap-4">
                    <div className="flex min-w-0 flex-1 self-stretch flex-col">
                        <div className="flex flex-col gap-1 overflow-hidden pr-2">
                            {isRenaming ? (
                                <ShellInput
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
                                    className="h-7 w-full rounded border-shell-accent-border px-1 py-0.5 text-sm font-medium text-shell-text focus-visible:ring-shell-accent/20"
                                />
                            ) : (
                                <h3 className="line-clamp-2 text-sm font-medium leading-5 text-shell-text">
                                    {flow.title}
                                </h3>
                            )}
                        </div>

                        <div className="mt-auto flex min-w-0 items-center gap-1 pt-8 text-[13px] text-shell-muted">
                            {entryPointName && (
                                <>
                                    <span className="truncate min-w-0">{entryPointName}</span>
                                    <span className="shrink-0">·</span>
                                </>
                            )}
                            <span className="shrink-0">{getRelativeTimeString(flow.lastModified)}</span>
                        </div>
                    </div>

                    <div className="shrink-0 self-start" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <ShellMenu onOpenChange={(open) => { if (open && !isTrash) handleLoadFolders(); }}>
                            <ShellMenuTrigger asChild>
                                <ShellIconButton
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-shell-muted hover:text-shell-muted-strong hover:bg-shell-surface"
                                    aria-label="Open project menu"
                                >
                                    <MoreVertical size={16} />
                                </ShellIconButton>
                            </ShellMenuTrigger>

                            <ShellMenuContent align="end" size="compact" className="w-48">
                                {isTrash ? (
                                    <>
                                        <ShellMenuItem onClick={handleRestore}>
                                            <span>Restore</span>
                                        </ShellMenuItem>
                                        <ShellMenuSeparator />
                                        <ShellMenuItem
                                            variant="destructive"
                                            className="whitespace-nowrap"
                                            onClick={handlePermanentDelete}
                                        >
                                            <span>Delete permanently</span>
                                        </ShellMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <ShellMenuLabel>
                                            Move to...
                                        </ShellMenuLabel>

                                        <ShellMenuItem onClick={() => handleMoveToFolder(undefined)}>
                                            <span>All Conversations</span>
                                        </ShellMenuItem>

                                        {folders.map(folder => (
                                            <ShellMenuItem
                                                key={folder.id}
                                                onClick={() => handleMoveToFolder(folder.id)}
                                            >
                                                <span>{folder.name}</span>
                                            </ShellMenuItem>
                                        ))}

                                        <ShellMenuSeparator />

                                        <ShellMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsRenaming(true);
                                            }}
                                        >
                                            <span>Rename</span>
                                        </ShellMenuItem>

                                        <ShellMenuItem disabled={isDuplicating} onClick={handleDuplicate}>
                                            <span>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
                                        </ShellMenuItem>

                                        <ShellMenuItem variant="destructive" onClick={handleDelete}>
                                            <span>Delete</span>
                                        </ShellMenuItem>
                                    </>
                                )}
                            </ShellMenuContent>
                        </ShellMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};
