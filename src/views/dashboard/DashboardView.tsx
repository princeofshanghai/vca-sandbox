import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Component, Menu, X } from 'lucide-react';
import VcaLogo from '@/components/VcaLogo';
import { cn } from '@/utils/cn';
import { flowStorage, FlowMetadata, Folder as FolderType } from '@/utils/flowStorage';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { Button } from '@/components/ui/button';
import { NewFlowDialog } from '@/components/dashboard/NewFlowDialog';
import { LoadingScreen } from '@/components/ui/loading-screen';
import NavLink from '@/components/layout/NavLink';
import { Flow } from '@/views/studio/types';
import { useApp } from '@/contexts/AppContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export const DashboardView = () => {
    const navigate = useNavigate();
    const [flows, setFlows] = useState<FlowMetadata[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = All
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewFlowDialog, setShowNewFlowDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; title: string; isPermanent: boolean } | null>(null);
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
        const flow = flows.find(f => f.id === id);
        if (flow) {
            setDeleteConfirmation({ id, title: flow.title, isPermanent: false });
        }
    };

    const handleRenameFlow = async (id: string, newTitle: string) => {
        const fullFlow = await flowStorage.getFlow(id);
        if (fullFlow) {
            await flowStorage.saveFlow({ ...fullFlow, title: newTitle });
            loadData();
        }
    };

    const handleRestoreFlow = async (id: string) => {
        await flowStorage.restoreFlow(id);
        loadData();
    };

    const handlePermanentDeleteFlow = async (id: string) => {
        const flow = flows.find(f => f.id === id);
        if (flow) {
            setDeleteConfirmation({ id, title: flow.title, isPermanent: true });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        await flowStorage.deleteFlow(deleteConfirmation.id, deleteConfirmation.isPermanent);
        setDeleteConfirmation(null);
        loadData();
    };

    const filteredFlows = flows.filter(f => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFolderId === 'trash') {
            return matchesSearch && f.deletedAt;
        }

        // Normal view: hide deleted items
        if (f.deletedAt) return false;

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
                <div className="relative group/search">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 bg-gray-100 border-transparent rounded-lg text-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
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
                                    {activeFolderId === 'trash'
                                        ? 'Trash'
                                        : activeFolderId
                                            ? folders.find(f => f.id === activeFolderId)?.name || 'Folder'
                                            : 'All'}
                                </h1>
                            </div>
                            {activeFolderId !== 'trash' && (
                                <Button
                                    onClick={() => setShowNewFlowDialog(true)}
                                    size="sm"
                                    className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
                                >
                                    <Plus size={16} />
                                    New
                                </Button>
                            )}
                        </div>


                        {/* Grid */}
                        {isLoading ? (
                            <LoadingScreen className="py-20 bg-transparent" />
                        ) : filteredFlows.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredFlows.map(flow => (
                                    <FlowCard
                                        key={flow.id}
                                        flow={flow}
                                        folderName={folders.find(f => f.id === flow.folderId)?.name}
                                        onDelete={handleDeleteFlow}
                                        onRename={handleRenameFlow}
                                        isTrash={activeFolderId === 'trash'}
                                        onRestore={handleRestoreFlow}
                                        onPermanentDelete={handlePermanentDeleteFlow}
                                    />
                                ))}
                            </div>
                        ) : (
                            <DashboardEmptyState
                                isFolderEmpty={!!activeFolderId}
                                onCreateNew={() => setShowNewFlowDialog(true)}
                                isTrash={activeFolderId === 'trash'}
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

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
                    <DialogContent className="max-w-[320px] p-0 gap-0 border-gray-100 shadow-2xl bg-white overflow-hidden" hideClose>
                        <div className="px-5 pt-5 pb-4">
                            <DialogHeader>
                                <DialogTitle className={cn("text-sm font-semibold mb-2", deleteConfirmation?.isPermanent ? "text-red-700" : "text-gray-900")}>
                                    {deleteConfirmation?.isPermanent ? "Delete permanently?" : "Delete project?"}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 leading-normal">
                                    {deleteConfirmation?.isPermanent
                                        ? `Are you sure you want to permanently delete "${deleteConfirmation?.title}"? This action cannot be undone.`
                                        : `Move "${deleteConfirmation?.title}" to the Trash? You can verify contents before permanent deletion.`}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <DialogFooter className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-row justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmation(null)}
                                size="sm"
                                className="text-gray-600 hover:text-gray-900 border border-gray-200 h-8 text-xs font-normal bg-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={deleteConfirmation?.isPermanent ? "destructive" : "default"}
                                onClick={handleConfirmDelete}
                                size="sm"
                                className={cn(
                                    "h-8 text-xs font-medium shadow-none",
                                    deleteConfirmation?.isPermanent
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                )}
                            >
                                {deleteConfirmation?.isPermanent ? "Delete permanently" : "Delete project"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </div >
    );
};

export default DashboardView;
