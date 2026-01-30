import { useEffect, useState } from 'react';
import { Component, AIActionContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownEditor } from './MarkdownEditor';
import { Plus, X } from 'lucide-react';
import { EditorField } from './EditorField';

interface ActionCardEditorProps {
    component: Component;
    onChange: (updates: Partial<AIActionContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActionCardEditor({ component, onChange, children, isOpen, onOpenChange }: ActionCardEditorProps) {
    const content = component.content as AIActionContent;
    // Local state for all fields
    const [localLoadingTitle, setLocalLoadingTitle] = useState(content.loadingTitle || '');
    const [localSuccessTitle, setLocalSuccessTitle] = useState(content.successTitle || '');
    const [localSuccessDesc, setLocalSuccessDesc] = useState(content.successDescription || '');
    const [localFailureTitle, setLocalFailureTitle] = useState(content.failureTitle || '');
    const [localFailureDesc, setLocalFailureDesc] = useState(content.failureDescription || '');

    // Local state for visibility
    const [showSuccessDesc, setShowSuccessDesc] = useState(!!content.successDescription);
    const [showErrorState, setShowErrorState] = useState(!!content.failureTitle || !!content.failureDescription);
    const [showErrorDesc, setShowErrorDesc] = useState(!!content.failureDescription);

    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalLoadingTitle(content.loadingTitle || '');
        setLocalSuccessTitle(content.successTitle || '');
        setLocalSuccessDesc(content.successDescription || '');
        setLocalFailureTitle(content.failureTitle || '');
        setLocalFailureDesc(content.failureDescription || '');

        // Auto-show states if content exists
        setShowSuccessDesc(!!content.successDescription);
        setShowErrorState(!!content.failureTitle || !!content.failureDescription);
        setShowErrorDesc(!!content.failureDescription);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    // Handle initial focus on open
    useEffect(() => {
        if (isOpen && !localSuccessTitle && !localLoadingTitle) {
            // Focus loading title if it's a new component
            const el = document.querySelector('input[placeholder="e.g., Removing user..."]') as HTMLInputElement;
            if (el) el.focus();
        }
    }, [isOpen]);

    const handleLoadingTitleChange = (value: string) => {
        setLocalLoadingTitle(value);
        onChange({ ...content, loadingTitle: value });
    };

    const handleSuccessTitleChange = (value: string) => {
        setLocalSuccessTitle(value);
        onChange({ ...content, successTitle: value });
    };

    const handleSuccessDescChange = (value: string) => {
        setLocalSuccessDesc(value);
        onChange({ ...content, successDescription: value });
    };

    const handleFailureTitleChange = (value: string) => {
        setLocalFailureTitle(value);
        onChange({ ...content, failureTitle: value });
    };

    const handleFailureDescChange = (value: string) => {
        setLocalFailureDesc(value);
        onChange({ ...content, failureDescription: value });
    };

    const editorContent = (
        <div className="flex flex-col p-5 space-y-5 max-h-[85vh] overflow-y-auto thin-scrollbar">
            {/* Loading State */}
            <EditorField
                label="Loading label"
                value={localLoadingTitle}
                onChange={handleLoadingTitleChange}
                placeholder="e.g., Removing user..."
            />

            {/* Success State */}
            <div className="space-y-4">
                <div className="space-y-3">
                    <EditorField
                        label="Success label"
                        value={localSuccessTitle}
                        onChange={handleSuccessTitleChange}
                        placeholder="e.g., User removed from Flexis Recruiter"
                    />

                    {showSuccessDesc ? (
                        <div className="group/desc relative animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-[11px] font-medium text-gray-500">
                                    Success description (optional)
                                </label>
                                <MarkdownEditor
                                    value={localSuccessDesc}
                                    onChange={handleSuccessDescChange}
                                    placeholder="Provide additional context or next steps..."
                                />
                            </div>
                            <button
                                onClick={() => {
                                    handleSuccessDescChange('');
                                    setShowSuccessDesc(false);
                                }}
                                className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover/desc:opacity-100"
                                title="Remove description"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSuccessDesc(true)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors w-fit px-1 py-0.5 -ml-1 rounded hover:bg-blue-50"
                        >
                            <Plus className="w-3 h-3" />
                            Add success description
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            <div className="space-y-4 border-t border-gray-100 pt-4">
                {showErrorState ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-500">
                                Error label
                            </label>
                            <button
                                onClick={() => {
                                    handleFailureTitleChange('');
                                    handleFailureDescChange('');
                                    setShowErrorState(false);
                                    setShowErrorDesc(false);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                title="Remove error state"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <EditorField
                                value={localFailureTitle}
                                onChange={handleFailureTitleChange}
                                placeholder="e.g., Unable to remove user"
                            />

                            {showErrorDesc ? (
                                <div className="group/errdesc relative animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <label className="text-[11px] font-medium text-gray-500">
                                            Error description (optional)
                                        </label>
                                        <MarkdownEditor
                                            value={localFailureDesc}
                                            onChange={handleFailureDescChange}
                                            placeholder="Explain what went wrong..."
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleFailureDescChange('');
                                            setShowErrorDesc(false);
                                        }}
                                        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover/errdesc:opacity-100"
                                        title="Remove description"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowErrorDesc(true)}
                                    className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors w-fit px-1 py-0.5 -ml-1 rounded hover:bg-blue-50"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add error description
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowErrorState(true)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors w-fit px-1 py-0.5 -ml-1 rounded hover:bg-blue-50"
                    >
                        <Plus className="w-3 h-3" />
                        Add error state
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={component.id}
            editorContent={editorContent}
            width={400}
        >
            {children}
        </ComponentEditorPopover>
    );
}
