import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Folder, FolderPlus, Trash2, MessageSquare } from 'lucide-react';
import { flowStorage, FlowMetadata, Folder as FolderType } from '@/utils/flowStorage';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { NewFlowDialog } from '@/components/dashboard/NewFlowDialog';
import { Flow } from '@/views/studio/types';

export const DashboardView = () => {
    const navigate = useNavigate();
    const [flows, setFlows] = useState<FlowMetadata[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = All
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const items = flowStorage.getAllFlows();
        items.sort((a, b) => b.lastModified - a.lastModified);
        setFlows(items);
        setFolders(flowStorage.getAllFolders());
    };

    const handleCreateFlow = (flow: Flow) => {
        // Save flow with folder if active
        if (activeFolderId) {
            flowStorage.saveFlow({ ...flow, folderId: activeFolderId });
        } else {
            flowStorage.saveFlow(flow);
        }
        navigate(`/studio/${flow.id}`);
    };


    const handleDeleteFlow = (id: string) => {
        flowStorage.deleteFlow(id);
        loadData();
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return;
        flowStorage.createFolder(newFolderName.trim());
        setNewFolderName('');
        setIsCreatingFolder(false);
        loadData();
    };

    const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete folder? Flows inside will be moved to "All conversations".')) {
            flowStorage.deleteFolder(id);
            if (activeFolderId === id) setActiveFolderId(null);
            loadData();
        }
    };

    const filteredFlows = flows.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = activeFolderId ? f.folderId === activeFolderId : true;
        return matchesSearch && matchesFolder;
    });

    return (
        <div className="flex h-full bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50/50 flex-shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveFolderId(null)}
                        className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 rounded transition-colors text-sm",
                            activeFolderId === null
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <MessageSquare size={16} strokeWidth={1.25} />
                        All conversations
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-sm font-medium text-gray-900">Folders</h2>
                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                            title="New Folder"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
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
                            <div
                                key={folder.id}
                                onClick={() => setActiveFolderId(folder.id)}
                                className={cn(
                                    "group flex items-center justify-between px-3 py-2 rounded text-sm cursor-pointer transition-colors",
                                    activeFolderId === folder.id
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Folder size={16} className={cn("shrink-0", activeFolderId === folder.id ? "fill-gray-400 text-gray-400" : "fill-gray-100 text-gray-400")} />
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-medium tracking-tight text-gray-900 mb-2">
                                {activeFolderId ? folders.find(f => f.id === activeFolderId)?.name || 'Folder' : 'All conversations'}
                            </h1>
                            <p className="text-gray-500 mt-1">Manage and edit your conversation flows</p>
                        </div>
                        <Button
                            onClick={() => setShowNewFlowDialog(true)}
                            className="bg-black text-white hover:bg-gray-800 gap-2"
                        >
                            <Plus size={18} />
                            New {activeFolderId ? 'in Folder' : 'conversation'}
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredFlows.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredFlows.map(flow => (
                                <FlowCard
                                    key={flow.id}
                                    flow={flow}
                                    folderName={folders.find(f => f.id === flow.folderId)?.name}
                                    onDelete={handleDeleteFlow}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FolderPlus className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">No conversations found</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {activeFolderId ? "This folder is empty" : "Create your first conversation flow to get started"}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setShowNewFlowDialog(true)}
                            >
                                Create new
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Flow Dialog */}
            {showNewFlowDialog && (
                <NewFlowDialog
                    onCreateFlow={handleCreateFlow}
                    onClose={() => setShowNewFlowDialog(false)}
                />
            )}
        </div>
    );
};

export default DashboardView;
