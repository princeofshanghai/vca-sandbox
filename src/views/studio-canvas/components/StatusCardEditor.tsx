import { useEffect, useState } from 'react';
import { Component, AIStatusContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { Plus, X, Zap } from 'lucide-react';

import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { RichTextEditor } from './RichTextEditor';

interface StatusCardEditorProps {
    component: Component;
    onChange: (updates: Partial<AIStatusContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StatusCardEditor({ component, onChange, children, isOpen, onOpenChange }: StatusCardEditorProps) {
    const content = component.content as AIStatusContent;
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
        <EditorRoot>
            <EditorHeader
                icon={Zap}
                title="Status Card"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>
                {/* 1. Loading State */}
                <EditorSection title="Loading State">
                    <EditorField
                        label="Loading label"
                        value={localLoadingTitle}
                        onChange={handleLoadingTitleChange}
                        placeholder="e.g., Removing user..."
                    />
                </EditorSection>

                {/* 2. Success State */}
                <EditorSection title="Success State">
                    <EditorField
                        label="Success label"
                        value={localSuccessTitle}
                        onChange={handleSuccessTitleChange}
                        placeholder="e.g., User removed from Flexis Recruiter"
                    />

                    {showSuccessDesc ? (
                        <div className="group/desc relative animate-in fade-in slide-in-from-top-1 duration-200 pt-2">
                            <div className="flex justify-between items-baseline mb-1.5">
                                <label className="text-[11px] font-medium text-gray-500">
                                    Success description
                                </label>
                                <button
                                    onClick={() => {
                                        handleSuccessDescChange('');
                                        setShowSuccessDesc(false);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove description"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            <RichTextEditor
                                value={localSuccessDesc}
                                onChange={handleSuccessDescChange}
                                placeholder="Provide additional context or next steps..."
                            />
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
                </EditorSection>

                {/* 3. Error State */}
                <EditorSection title="Error State" collapsible defaultOpen={showErrorState}>
                    {!showErrorState ? (
                        <div className="pt-2">
                            <button
                                onClick={() => setShowErrorState(true)}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors w-fit rounded hover:bg-blue-50"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add error state
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        handleFailureTitleChange('');
                                        handleFailureDescChange('');
                                        setShowErrorState(false);
                                        setShowErrorDesc(false);
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    Remove state
                                </button>
                            </div>

                            <EditorField
                                label="Error label"
                                value={localFailureTitle}
                                onChange={handleFailureTitleChange}
                                placeholder="e.g., Unable to remove user"
                            />

                            {showErrorDesc ? (
                                <div className="group/errdesc relative animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <label className="text-[11px] font-medium text-gray-500">
                                            Error description
                                        </label>
                                        <button
                                            onClick={() => {
                                                handleFailureDescChange('');
                                                setShowErrorDesc(false);
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove description"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <RichTextEditor
                                        value={localFailureDesc}
                                        onChange={handleFailureDescChange}
                                        placeholder="Explain what went wrong..."
                                    />
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
                    )}
                </EditorSection>
            </EditorContent>
        </EditorRoot>
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
