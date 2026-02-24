import { useState } from 'react';
import { Plus, Grid2x2, Folder, Pencil, Trash2 } from 'lucide-react';
import { Folder as FolderType, flowStorage } from '@/utils/flowStorage';
import { cn } from '@/utils/cn';
import { ShellButton, ShellIconButton, ShellInput } from '@/components/shell';
import Sidebar from '@/components/layout/Sidebar';
import NavLink from '@/components/layout/NavLink';

interface DashboardSidebarProps {
    folders: FolderType[];
    activeFolderId: string | null;
    setActiveFolderId: (id: string | null) => void;
    onFolderUpdate: () => void;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    isMobileOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export const DashboardSidebar = ({
    folders,
    activeFolderId,
    setActiveFolderId,
    onFolderUpdate,
    header,
    footer,
    isMobileOpen,
    setMobileMenuOpen
}: DashboardSidebarProps) => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await flowStorage.createFolder(newFolderName.trim());
        setNewFolderName('');
        setIsCreatingFolder(false);
        onFolderUpdate();
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete folder? Projects inside will be moved to "All projects".')) {
            await flowStorage.deleteFolder(id);
            if (activeFolderId === id) setActiveFolderId(null);
            onFolderUpdate();
        }
    };

    const handleStartRenameFolder = (folder: FolderType, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingFolderId(folder.id);
        setEditingFolderName(folder.name);
    };

    const handleRenameFolder = async () => {
        if (editingFolderId && editingFolderName.trim()) {
            await flowStorage.renameFolder(editingFolderId, editingFolderName.trim());
            setEditingFolderId(null);
            onFolderUpdate();
        } else {
            setEditingFolderId(null);
        }
    };

    return (
        <Sidebar
            header={header}
            footer={footer}
            isMobileOpen={isMobileOpen}
            onClose={() => setMobileMenuOpen(false)}
        >
            <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-2xs font-medium text-shell-text">Projects</h2>
            </div>

            <div className="space-y-0.5">
                <NavLink
                    onClick={() => {
                        setActiveFolderId(null);
                        setMobileMenuOpen(false);
                    }}
                    isActive={activeFolderId === null}
                >
                    <div className="flex items-center gap-2">
                        <Grid2x2 size={16} strokeWidth={1.5} />
                        <span>All</span>
                    </div>
                </NavLink>

                {isCreatingFolder && (
                    <div className="px-2 py-1 mb-2">
                        <ShellInput
                            autoFocus
                            className="w-full h-7 rounded border-shell-accent-border px-2 py-1 text-xs focus-visible:ring-shell-accent/20"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateFolder();
                                if (e.key === 'Escape') setIsCreatingFolder(false);
                            }}
                            onBlur={() => setIsCreatingFolder(false)}
                        />
                    </div>
                )}

                {folders.map(folder => (
                    editingFolderId === folder.id ? (
                        <div key={folder.id} className="px-2 py-1 mb-2">
                            <ShellInput
                                autoFocus
                                className="w-full h-7 rounded border-shell-accent-border px-2 py-1 text-xs focus-visible:ring-shell-accent/20"
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameFolder();
                                    if (e.key === 'Escape') setEditingFolderId(null);
                                }}
                                onBlur={handleRenameFolder}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    ) : (
                        <div
                            key={folder.id}
                            onClick={() => {
                                setActiveFolderId(folder.id);
                                setMobileMenuOpen(false);
                            }}
                            className={cn(
                                "group flex items-center justify-between px-3 py-1.5 rounded-vca-sm text-2xs cursor-pointer transition-colors",
                                activeFolderId === folder.id
                                    ? "bg-shell-border-subtle text-shell-text font-medium"
                                    : "text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Folder size={16} strokeWidth={1.5} className={cn("shrink-0", activeFolderId === folder.id ? "fill-shell-muted text-shell-muted" : "fill-shell-surface text-shell-muted")} />
                                <span className="truncate">{folder.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShellIconButton
                                    onClick={(e) => handleStartRenameFolder(folder, e)}
                                    className="h-6 w-6 text-shell-muted hover:bg-shell-surface hover:text-shell-muted-strong"
                                    aria-label="Rename folder"
                                >
                                    <Pencil size={12} />
                                </ShellIconButton>
                                <ShellIconButton
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="h-6 w-6 text-shell-muted hover:bg-shell-danger-soft hover:text-shell-danger"
                                    aria-label="Delete folder"
                                >
                                    <Trash2 size={12} />
                                </ShellIconButton>
                            </div>
                        </div>
                    )
                ))}

                <ShellButton
                    onClick={() => setIsCreatingFolder(true)}
                    className="w-full justify-start gap-2 rounded-vca-sm px-3 py-1.5 text-2xs text-shell-muted hover:bg-shell-surface-subtle hover:text-shell-text"
                    variant="ghost"
                >
                    <Plus size={16} strokeWidth={1.5} />
                    <span>New folder</span>
                </ShellButton>

                <div className="pt-2 mt-2 border-t border-shell-border-subtle dark:border-shell-border-subtle/70">
                    <div
                        onClick={() => {
                            setActiveFolderId('trash');
                            setMobileMenuOpen(false);
                        }}
                        className={cn(
                            "group flex items-center gap-2 px-3 py-1.5 rounded-vca-sm text-2xs cursor-pointer transition-colors",
                            activeFolderId === 'trash'
                                ? "bg-shell-danger-soft text-shell-danger font-medium"
                                : "text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text"
                        )}
                    >
                        <Trash2 size={16} strokeWidth={1.5} className={cn("shrink-0", activeFolderId === 'trash' ? "text-shell-danger" : "text-shell-muted-strong")} />
                        <span>Trash</span>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};
