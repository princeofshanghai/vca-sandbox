import { memo, useState, useRef, useEffect } from 'react';
import { NodeProps, useStore } from '@xyflow/react';
import { StickyNote } from 'lucide-react';

interface NoteNodeData {
    label?: string;
    content: string;
    onLabelChange?: (nodeId: string, newLabel: string) => void;
    onContentChange?: (nodeId: string, newContent: string) => void;
}

export const NoteNode = memo(({ id, data, selected }: NodeProps) => {
    const typedData = data as unknown as NoteNodeData;

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Content state
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [localContent, setLocalContent] = useState(typedData.content);

    // Focus label input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    // Sync from parent if changed externally, but NOT if we are editing
    useEffect(() => {
        if (typedData.content !== localContent && document.activeElement !== contentRef.current) {
            setLocalContent(typedData.content);
        }
    }, [typedData.content, localContent]);

    // Auto-resize textarea
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto';
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
        }
    }, [localContent]); // Depend on localContent now

    // Timeout ref for debouncing
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalContent(newValue);

        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            typedData.onContentChange?.(id, newValue);
            debounceTimeoutRef.current = null;
        }, 500);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Commit on blur (and clear pending debounce to avoid double update)
    const handleContentBlur = () => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        if (localContent !== typedData.content) {
            typedData.onContentChange?.(id, localContent);
        }
    };

    const handleLabelSave = () => {
        if (editedLabel.trim() !== (typedData.label || '')) {
            typedData.onLabelChange?.(id, editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSave();
        } else if (e.key === 'Escape') {
            setEditedLabel(typedData.label || '');
            setIsEditingLabel(false);
        }
    };

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);

    return (
        <div
            className={`bg-yellow-50 rounded-lg border shadow-sm w-[300px] transition-colors cursor-default relative group ${selected
                ? 'border-yellow-400 ring-1 ring-yellow-400'
                : 'border-yellow-200 hover:border-yellow-300'
                }`}
        >
            {/* Node Label - Above the card */}
            <div
                className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                <StickyNote size={14} className="text-yellow-600 flex-shrink-0" fill="currentColor" />

                {isEditingLabel ? (
                    <input
                        ref={labelInputRef}
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={handleLabelKeyDown}
                        className="w-full h-full text-xs font-medium text-gray-900 bg-transparent border border-blue-500 rounded px-1 outline-none nodrag"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div
                        className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-gray-400' : 'text-gray-500 hover:text-gray-900'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingLabel(true);
                        }}
                        title="Click to rename"
                    >
                        {typedData.label || 'Sticky Note'}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4">
                <textarea
                    ref={contentRef}
                    value={localContent}
                    onChange={handleContentChange}
                    onBlur={handleContentBlur}
                    placeholder="Write a note..."
                    className="w-full bg-transparent border-none resize-none outline-none text-sm text-gray-800 placeholder-yellow-800/30 leading-relaxed overflow-hidden min-h-[80px] nodrag"
                    spellCheck={false}
                    rows={1}
                />
            </div>
        </div>
    );
});

NoteNode.displayName = 'NoteNode';
