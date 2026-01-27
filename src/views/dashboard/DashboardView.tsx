import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Folder, FolderPlus, Trash2, Grid2x2, Component } from 'lucide-react';
import VcaLogo from '@/components/VcaLogo';
import { flowStorage, FlowMetadata, Folder as FolderType } from '@/utils/flowStorage';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { NewFlowDialog } from '@/components/dashboard/NewFlowDialog';
import NavLink from '@/components/layout/NavLink';
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
                {/* App Header */}
                <div className="h-14 px-4 flex items-center gap-2">
                    <VcaLogo className="h-5" />
                    <span className="font-medium text-lg text-gray-700 tracking-tight">Sandbox</span>
                </div>

                <div className="px-4">
                    <div className="h-px bg-gray-200" />
                </div>

                {/* Search */}
                <div className="px-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border-transparent rounded-lg text-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Sidebar Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-2xs font-medium text-gray-900">Conversations</h2>
                    </div>

                    <div className="space-y-1">
                        <NavLink
                            onClick={() => setActiveFolderId(null)}
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
                            <div
                                key={folder.id}
                                onClick={() => setActiveFolderId(folder.id)}
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
                                <button
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 transition-colors text-2xs"
                        >
                            <Plus size={16} strokeWidth={1.5} />
                            <span>New folder</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar Footer (Pinned) */}
                <div className="px-4">
                    <div className="h-px bg-gray-200" />
                </div>
                <div className="p-4 bg-gray-50/50">
                    <NavLink to="/foundations/typography">
                        <div className="flex items-center gap-2">
                            <Component size={16} strokeWidth={1.5} />
                            <span>Component Library</span>
                        </div>
                    </NavLink>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-20 py-16">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-medium tracking-tight text-gray-900 mb-2">
                                    {activeFolderId ? folders.find(f => f.id === activeFolderId)?.name || 'Folder' : 'All'}
                                </h1>
                            </div>
                            <Button
                                onClick={() => setShowNewFlowDialog(true)}
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
                            >
                                <Plus size={16} />
                                New
                            </Button>
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
        </div>
    );
};

export default DashboardView;
