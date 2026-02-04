import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Component, Loader2, Menu } from 'lucide-react';
import VcaLogo from '@/components/VcaLogo';
import { flowStorage, FlowMetadata, Folder as FolderType } from '@/utils/flowStorage';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { Button } from '@/components/ui/button';
import { NewFlowDialog } from '@/components/dashboard/NewFlowDialog';
import NavLink from '@/components/layout/NavLink';
import { Flow } from '@/views/studio/types';
import { useApp } from '@/contexts/AppContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';

export const DashboardView = () => {
    const navigate = useNavigate();
    const [flows, setFlows] = useState<FlowMetadata[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = All
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { state, setMobileMenuOpen } = useApp();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [loadedFlows, loadedFolders] = await Promise.all([
            flowStorage.getAllFlows(),
            flowStorage.getAllFolders()
        ]);

        loadedFlows.sort((a, b) => b.lastModified - a.lastModified);
        setFlows(loadedFlows);
        setFolders(loadedFolders);
        setIsLoading(false);
    }, []);


    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateFlow = async (flow: Flow) => {
        // Save flow with folder if active
        if (activeFolderId) {
            await flowStorage.saveFlow({ ...flow, folderId: activeFolderId });
        } else {
            await flowStorage.saveFlow(flow);
        }
        navigate(`/studio/${flow.id}`);
    };


    const handleDeleteFlow = async (id: string) => {
        await flowStorage.deleteFlow(id);
        loadData();
    };

    const handleRenameFlow = async (id: string, newTitle: string) => {
        const fullFlow = await flowStorage.getFlow(id);
        if (fullFlow) {
            await flowStorage.saveFlow({ ...fullFlow, title: newTitle });
            loadData();
        }
    };

    const filteredFlows = flows.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = activeFolderId ? f.folderId === activeFolderId : true;
        return matchesSearch && matchesFolder;
    });

    const sidebarHeader = (
        <>
            <div className="h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <VcaLogo className="h-5" />
                    <span className="font-medium text-lg text-gray-700 tracking-tight">Sandbox</span>
                </div>
                <UserMenu />
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
        </>
    );

    const sidebarFooter = (
        <div className="p-4 bg-white">
            <div className="h-px bg-gray-200 mb-4" />
            <NavLink to="/foundations/typography">
                <div className="flex items-center gap-2">
                    <Component size={16} strokeWidth={1.5} />
                    <span>Component Library</span>
                </div>
            </NavLink>
        </div>
    );

    return (
        <div className="flex h-full bg-white overflow-hidden">
            <DashboardSidebar
                folders={folders}
                activeFolderId={activeFolderId}
                setActiveFolderId={setActiveFolderId}
                onFolderUpdate={loadData}
                header={sidebarHeader}
                footer={sidebarFooter}
                isMobileOpen={state.mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                {/* Mobile Header */}
                <div className="h-14 px-4 flex items-center border-b border-gray-200 bg-white md:hidden shrink-0">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="ml-2 flex items-center gap-2">
                        <VcaLogo className="h-4" />
                        <span className="font-medium text-sm text-gray-700">Sandbox</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 md:px-20 lg:px-32 xl:px-48 py-10 md:py-16 lg:py-24">
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
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-gray-400" size={32} />
                            </div>
                        ) : filteredFlows.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredFlows.map(flow => (
                                    <FlowCard
                                        key={flow.id}
                                        flow={flow}
                                        folderName={folders.find(f => f.id === flow.folderId)?.name}
                                        onDelete={handleDeleteFlow}
                                        onRename={handleRenameFlow}
                                    />
                                ))}
                            </div>
                        ) : (
                            <DashboardEmptyState
                                isFolderEmpty={!!activeFolderId}
                                onCreateNew={() => setShowNewFlowDialog(true)}
                            />
                        )}
                    </div>
                </div>

                {/* New Flow Dialog */}
                {
                    showNewFlowDialog && (
                        <NewFlowDialog
                            onCreateFlow={handleCreateFlow}
                            onClose={() => setShowNewFlowDialog(false)}
                        />
                    )
                }
            </div >
        </div >
    );
};

export default DashboardView;
