import { useState } from 'react';
import { Plus, Grid2x2, Folder, Pencil, Trash2 } from 'lucide-react';
import { Folder as FolderType, flowStorage } from '@/utils/flowStorage';
import { cn } from '@/utils/cn';
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
                <h2 className="text-2xs font-medium text-gray-900">Projects</h2>
            </div>

            <div className="space-y-1">
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
                        <input
                            autoFocus
                            className="w-full text-sm px-2 py-1 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                            <input
                                autoFocus
                                className="w-full text-xs px-2 py-1 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                                "group flex items-center justify-between px-3 py-2 rounded text-2xs cursor-pointer transition-colors",
                                activeFolderId === folder.id
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Folder size={16} strokeWidth={1.5} className={cn("shrink-0", activeFolderId === folder.id ? "fill-gray-400 text-gray-400" : "fill-gray-100 text-gray-400")} />
                                <span className="truncate">{folder.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleStartRenameFolder(folder, e)}
                                    className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded transition-all"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    )
                ))}

                <button
                    onClick={() => setIsCreatingFolder(true)}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 transition-colors text-2xs"
                >
                    <Plus size={16} strokeWidth={1.5} />
                    <span>New folder</span>
                </button>
            </div>
        </Sidebar>
    );
};
