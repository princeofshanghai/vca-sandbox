import { RefObject, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, Link, List } from 'lucide-react';

interface MarkdownToolbarProps {
    textareaRef: RefObject<HTMLTextAreaElement>;
    value: string;
    onChange: (newValue: string) => void;
}

/**
 * MarkdownToolbar - Selection-based floating toolbar for markdown formatting
 * 
 * Only visible when text is selected in the textarea. Positioned above/below selection.
 * Provides buttons for: Bold, Italic, List, Link
 */
export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updateToolbarVisibility = useCallback(() => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const hasSelection = start !== end;

        setIsVisible(hasSelection);

        if (hasSelection) {
            // Calculate position relative to textarea
            const rect = textarea.getBoundingClientRect();
            setPosition({
                // Position above textarea
                top: rect.top - 45,
                left: rect.left + (rect.width / 2) - 100, // Center horizontally
            });
        }
    }, [textareaRef]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Update on selection change
        textarea.addEventListener('select', updateToolbarVisibility);
        textarea.addEventListener('mouseup', updateToolbarVisibility);
        textarea.addEventListener('keyup', updateToolbarVisibility);

        return () => {
            textarea.removeEventListener('select', updateToolbarVisibility);
            textarea.removeEventListener('mouseup', updateToolbarVisibility);
            textarea.removeEventListener('keyup', updateToolbarVisibility);
        };
    }, [textareaRef, updateToolbarVisibility]);

    const handleFormat = (type: 'bold' | 'italic' | 'link' | 'list') => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;
        const selected = text.substring(start, end);

        let newText = text;
        let newCursor = end;

        switch (type) {
            case 'bold':
                newText = text.substring(0, start) + `**${selected}**` + text.substring(end);
                newCursor = end + 4;
                break;
            case 'italic':
                newText = text.substring(0, start) + `*${selected}*` + text.substring(end);
                newCursor = end + 2;
                break;
            case 'link':
                newText = text.substring(0, start) + `[${selected}](url)` + text.substring(end);
                newCursor = end + 6;
                break;
            case 'list': {
                const lines = selected.split('\n');
                const listText = lines.map(line => `- ${line}`).join('\n');
                newText = text.substring(0, start) + listText + text.substring(end);
                newCursor = start + listText.length;
                break;
            }
        }

        onChange(newText);

        // Restore focus and cursor position
        setTimeout(() => {
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(newCursor, newCursor);
                updateToolbarVisibility();
            }
        }, 0);
    };

    if (!isVisible) return null;

    return (
        <div
            id="markdown-toolbar"
            className="fixed z-[60] flex items-center gap-1 bg-gray-900 rounded-lg p-1 shadow-lg"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <button
                onClick={() => handleFormat('bold')}
                className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"
                title="Bold"
                type="button"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleFormat('italic')}
                className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"
                title="Italic"
                type="button"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleFormat('list')}
                className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"
                title="List"
                type="button"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleFormat('link')}
                className="p-1.5 text-white hover:bg-gray-700 rounded transition-colors"
                title="Link"
                type="button"
            >
                <Link className="w-4 h-4" />
            </button>
        </div>
    );
}
