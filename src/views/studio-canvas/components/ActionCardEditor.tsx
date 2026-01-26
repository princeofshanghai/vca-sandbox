import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Component, AIActionContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownToolbar } from './MarkdownToolbar';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ActionCardEditorProps {
    component: Component;
    onChange: (updates: Partial<AIActionContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-500">
        {children}
    </label>
);

export function ActionCardEditor({ component, onChange, children, isOpen, onOpenChange }: ActionCardEditorProps) {
    const content = component.content as AIActionContent;
    const successDescRef = useRef<HTMLTextAreaElement>(null);
    const failureDescRef = useRef<HTMLTextAreaElement>(null);

    // Local state for all fields
    const [localLoadingTitle, setLocalLoadingTitle] = useState(content.loadingTitle || '');
    const [localSuccessTitle, setLocalSuccessTitle] = useState(content.successTitle || '');
    const [localSuccessDesc, setLocalSuccessDesc] = useState(content.successDescription || '');
    const [localFailureTitle, setLocalFailureTitle] = useState(content.failureTitle || '');
    const [localFailureDesc, setLocalFailureDesc] = useState(content.failureDescription || '');
    const [showFailureState, setShowFailureState] = useState(false);

    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalLoadingTitle(content.loadingTitle || '');
        setLocalSuccessTitle(content.successTitle || '');
        setLocalSuccessDesc(content.successDescription || '');
        setLocalFailureTitle(content.failureTitle || '');
        setLocalFailureDesc(content.failureDescription || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    // Handle initial focus on open
    useEffect(() => {
        if (isOpen && successDescRef.current) {
            const el = successDescRef.current;
            el.focus();
            setTimeout(() => {
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [isOpen]);

    // Handle focus when failure state is toggled on
    useEffect(() => {
        if (showFailureState && failureDescRef.current) {
            const el = failureDescRef.current;
            // Need a slight delay to ensure it's rendered
            setTimeout(() => {
                el.focus();
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [showFailureState]);

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
        <div className="flex flex-col p-5 space-y-4 max-h-[70vh] overflow-y-auto thin-scrollbar">
            {/* Loading State */}
            <div className="space-y-2">
                <Label>Loading title</Label>
                <input
                    value={localLoadingTitle}
                    onChange={(e) => handleLoadingTitleChange(e.target.value)}
                    placeholder="e.g., Removing user..."
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Success State */}
            <div className="space-y-2">
                <Label>Success title</Label>
                <input
                    value={localSuccessTitle}
                    onChange={(e) => handleSuccessTitleChange(e.target.value)}
                    placeholder="e.g., User removed from Flexis Recruiter"
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="space-y-2">
                <Label>Success description (optional)</Label>
                <TextareaAutosize
                    ref={successDescRef}
                    value={localSuccessDesc}
                    onChange={(e) => handleSuccessDescChange(e.target.value)}
                    placeholder="Provide additional context or next steps..."
                    minRows={2}
                    maxRows={10}
                    className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {/* Markdown Toolbar for success description */}
                <MarkdownToolbar
                    textareaRef={successDescRef}
                    value={localSuccessDesc}
                    onChange={handleSuccessDescChange}
                />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200" />

            {/* Failure State - Collapsible */}
            <div className="space-y-2">
                <button
                    onClick={() => setShowFailureState(!showFailureState)}
                    className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition-colors"
                >
                    <Label>Failure state (optional)</Label>
                    {showFailureState ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>

                {showFailureState && (
                    <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                            <Label>Failure title</Label>
                            <input
                                value={localFailureTitle}
                                onChange={(e) => handleFailureTitleChange(e.target.value)}
                                placeholder="e.g., Unable to remove user"
                                className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Failure description</Label>
                            <TextareaAutosize
                                ref={failureDescRef}
                                value={localFailureDesc}
                                onChange={(e) => handleFailureDescChange(e.target.value)}
                                placeholder="Explain what went wrong..."
                                minRows={2}
                                maxRows={10}
                                className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            {/* Markdown Toolbar for failure description */}
                            <MarkdownToolbar
                                textareaRef={failureDescRef}
                                value={localFailureDesc}
                                onChange={handleFailureDescChange}
                            />
                        </div>
                    </div>
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
