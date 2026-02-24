import { useEffect, useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENTRY_POINTS, EntryPointId } from '@/utils/entryPoints';
import { ShellIconButton, ShellInput } from '@/components/shell';
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
    const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(flow.thumbnailUrl);
    const [thumbnailState, setThumbnailState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
        flow.thumbnailUrl ? 'loading' : 'idle'
    );

    useEffect(() => {
        let cancelled = false;
        setThumbnailUrl(flow.thumbnailUrl);

        const loadThumbnail = async () => {
            if (!flow.thumbnailPath || flow.thumbnailUnavailable) {
                setThumbnailState(flow.thumbnailUnavailable ? 'error' : 'idle');
                return;
            }

            if (flow.thumbnailUrl) {
                setThumbnailState('loading');
                return;
            }

            setThumbnailState('loading');
            const signedUrl = await flowStorage.getFlowThumbnailUrl(flow.thumbnailPath);
            if (cancelled) return;

            if (signedUrl) {
                setThumbnailUrl(signedUrl);
                setThumbnailState('loading');
            } else {
                setThumbnailState('error');
            }
        };

        void loadThumbnail();

        return () => {
            cancelled = true;
        };
    }, [flow.id, flow.thumbnailPath, flow.thumbnailUnavailable, flow.thumbnailUrl]);

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
    const hasThumbnail = Boolean(thumbnailUrl);
    const isPreviewGenerating = !hasThumbnail && thumbnailState !== 'error';
    const isPreviewUnavailable = thumbnailState === 'error';
    const showFallbackPreview = isPreviewGenerating || isPreviewUnavailable;
    const previewTileStyle = showFallbackPreview
        ? { backgroundColor: 'rgb(var(--shell-bg) / 1)' }
        : {
            backgroundColor: 'rgb(var(--shell-canvas) / 1)',
            backgroundImage: 'radial-gradient(rgb(var(--shell-canvas-grid) / 1) 1.1px, transparent 1.1px)',
            backgroundSize: '20px 20px',
        };

    return (
        <div
            onClick={handleClick}
            className={`group cursor-pointer ${isTrash ? 'opacity-75 grayscale hover:grayscale-0' : ''}`}
        >
            <div className="relative overflow-hidden rounded-xl border border-shell-border/80 dark:border-shell-border/60 bg-shell-bg transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_14px_rgb(var(--shell-muted-strong)/0.2)] group-focus-within:-translate-y-0.5 group-focus-within:shadow-[0_4px_14px_rgb(var(--shell-muted-strong)/0.2)]">
                <div className="aspect-[3/2] w-full relative overflow-hidden" style={previewTileStyle}>
                    {hasThumbnail ? (
                        <>
                            {thumbnailState === 'loading' && (
                                <div className="absolute inset-0 animate-pulse bg-shell-surface" />
                            )}
                            <img
                                src={thumbnailUrl}
                                alt={`${flow.title} canvas preview`}
                                loading="lazy"
                                onLoad={() => setThumbnailState('ready')}
                                onError={() => setThumbnailState('error')}
                                className={`h-full w-full object-cover transition-opacity duration-200 ${thumbnailState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </>
                    ) : null}
                    {showFallbackPreview && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="/vca-bug.svg"
                                alt={isPreviewGenerating ? 'Generating preview' : 'Preview unavailable'}
                                className="h-9 w-9 opacity-40 grayscale"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-3 px-0.5">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5 overflow-hidden mb-0.5">
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
                                <h3 className="font-medium text-sm text-shell-text truncate">
                                    {flow.title}
                                </h3>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-[13px] text-shell-muted min-w-0">
                            {entryPointName && (
                                <>
                                    <span className="truncate min-w-0">{entryPointName}</span>
                                    <span className="shrink-0">·</span>
                                </>
                            )}
                            <span className="shrink-0">{getRelativeTimeString(flow.lastModified)}</span>
                        </div>
                    </div>

                    <div className="shrink-0" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <DropdownMenu onOpenChange={(open) => { if (open && !isTrash) handleLoadFolders(); }}>
                            <DropdownMenuTrigger asChild>
                                <ShellIconButton
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-shell-muted hover:text-shell-muted-strong hover:bg-shell-surface"
                                    aria-label="Open project menu"
                                >
                                    <MoreVertical size={16} />
                                </ShellIconButton>
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
            </div>
        </div>
    );
};
