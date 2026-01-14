import { useState } from 'react';
import { FlowMetadata, flowStorage, Folder } from '@/utils/flowStorage';
import { MessageSquare, Trash2, Clock, MoreVertical, FolderInput } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FlowCardProps {
    flow: FlowMetadata;
    folderName?: string;
    onDelete: (id: string) => void;
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
            className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-64"
        >
            {/* Thumbnail Area - Placeholder for now */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white opacity-50" />
                <MessageSquare className="text-gray-300 w-12 h-12" strokeWidth={1} />

                {/* Preview text if available */}
                {flow.previewText && (
                    <div className="absolute inset-0 p-6 flex items-center justify-center opacity-40 hover:opacity-10 pointer-events-none">
                        <p className="text-[10px] text-gray-400 font-mono text-center line-clamp-6">
                            {flow.previewText}
                        </p>
                    </div>
                )}

                {/* Context Menu Trigger (Only visible on hover) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <DropdownMenu.Root onOpenChange={(open) => { if (open) handleLoadFolders(); }}>
                        <DropdownMenu.Trigger asChild>
                            <button className="p-1.5 bg-white/90 backdrop-blur border border-gray-200 rounded-md hover:bg-gray-100 text-gray-500">
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

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {flow.title}
                    </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(flow.lastModified).toLocaleDateString()}</span>
                    </div>

                    {folderName && (
                        <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 max-w-[50%]">
                            <FolderInput size={10} />
                            <span className="truncate">{folderName}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
