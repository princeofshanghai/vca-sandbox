import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Component, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { flowStorage, FlowMetadata, Folder as FolderType } from '@/utils/flowStorage';
import { FlowCard } from '@/components/dashboard/FlowCard';
import { ShellButton, ShellIconButton, ShellSearchInput } from '@/components/shell';
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
            <div className="h-16 px-4 flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src="/vca-logo-black.svg"
                        alt="VCA Sandbox"
                        className="h-7 w-auto dark:hidden"
                    />
                    <img
                        src="/vca-logo-white.svg"
                        alt="VCA Sandbox"
                        className="hidden h-7 w-auto dark:block"
                    />
                </div>
                <UserMenu />
            </div>
            <div className="px-4">
                <div className="h-px bg-shell-border dark:bg-shell-border/60" />
            </div>
            {/* Search */}
            <div className="px-4 pt-4">
                <ShellSearchInput
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    clearAriaLabel="Clear search"
                />
            </div>
        </>
    );

    const sidebarFooter = (
        <div className="p-4 bg-shell-bg">
            <div className="h-px bg-shell-border dark:bg-shell-border/60 mb-4" />
            <NavLink to="/foundations/typography">
                <div className="flex items-center gap-2">
                    <Component size={16} strokeWidth={1.5} />
                    <span>Component Library</span>
                </div>
            </NavLink>
        </div>
    );

    return (
        <div className="flex h-full bg-shell-bg overflow-hidden">
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
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-shell-surface">
                {/* Mobile Header */}
                <div className="h-16 px-4 flex items-center border-b border-shell-border bg-shell-bg md:hidden shrink-0">
                    <ShellIconButton
                        onClick={() => setMobileMenuOpen(true)}
                        className="-ml-2"
                        aria-label="Open mobile menu"
                    >
                        <Menu size={20} />
                    </ShellIconButton>
                    <div className="ml-2.5 flex items-center">
                        <img
                            src="/vca-logo-black.svg"
                            alt="VCA Sandbox"
                            className="h-6 w-auto dark:hidden"
                        />
                        <img
                            src="/vca-logo-white.svg"
                            alt="VCA Sandbox"
                            className="hidden h-6 w-auto dark:block"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 md:px-20 lg:px-32 xl:px-48 py-10 md:py-16 lg:py-24">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h1
                                    className="text-2xl font-bold tracking-tight text-shell-text mb-2"
                                    style={{ fontFamily: '"Community Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
                                >
                                    {activeFolderId === 'trash'
                                        ? 'Trash'
                                        : activeFolderId
                                            ? folders.find(f => f.id === activeFolderId)?.name || 'Folder'
                                            : 'All projects'}
                                </h1>
                            </div>
                            {activeFolderId !== 'trash' && (
                                <ShellButton
                                    onClick={() => setShowNewFlowDialog(true)}
                                    size="compact"
                                    className="gap-2"
                                >
                                    <Plus size={16} />
                                    New
                                </ShellButton>
                            )}
                        </div>


                        {/* Grid */}
                        {isLoading ? (
                            <LoadingScreen className="py-20 bg-transparent" />
                        ) : filteredFlows.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
                    <DialogContent className="max-w-[320px] p-shell-0 gap-shell-0 border-shell-border-subtle shadow-shell-lg bg-shell-bg overflow-hidden" hideClose>
                        <div className="px-5 pt-5 pb-4">
                            <DialogHeader>
                                <DialogTitle className={cn("text-sm font-semibold mb-2", deleteConfirmation?.isPermanent ? "text-shell-danger" : "text-shell-text")}>
                                    {deleteConfirmation?.isPermanent ? "Delete permanently?" : "Delete project?"}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-shell-muted leading-normal">
                                    {deleteConfirmation?.isPermanent
                                        ? `Are you sure you want to permanently delete "${deleteConfirmation?.title}"? This action cannot be undone.`
                                        : `Move "${deleteConfirmation?.title}" to the Trash? You can verify contents before permanent deletion.`}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <DialogFooter className="p-shell-4 bg-shell-surface-subtle border-t border-shell-border-subtle flex flex-row justify-end gap-shell-2">
                            <ShellButton
                                variant="outline"
                                onClick={() => setDeleteConfirmation(null)}
                                className="font-normal"
                            >
                                Cancel
                            </ShellButton>
                            <ShellButton
                                variant="destructive"
                                onClick={handleConfirmDelete}
                            >
                                {deleteConfirmation?.isPermanent ? "Delete permanently" : "Delete project"}
                            </ShellButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </div >
    );
};

export default DashboardView;
