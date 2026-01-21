import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PromptEditorProps {
    text: string;
    onSave: (text: string) => void;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

export function PromptEditor({ text, onSave, onClose, anchorEl }: PromptEditorProps) {
    const [editedText, setEditedText] = useState(text);
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    // Close on click outside - auto-save
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                // Save with current edited text
                if (editedText.trim() !== text) {
                    onSave(editedText.trim());
                }
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editedText, text, onSave, onClose, anchorEl]);

    const handleSave = () => {
        if (editedText.trim() !== text) {
            onSave(editedText.trim());
        }
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
    };

    // Position popover near anchor element (smart left/right positioning)
    const getPopoverStyle = (): React.CSSProperties => {
        if (!anchorEl) return {};

        const rect = anchorEl.getBoundingClientRect();
        const popoverWidth = 320; // w-80 = 320px
        const spacing = 8;
        const viewportWidth = window.innerWidth;

        // Check if there's space on the right
        const spaceOnRight = viewportWidth - rect.right;
        const hasSpaceOnRight = spaceOnRight >= popoverWidth + spacing;

        // Position to the right if space, otherwise to the left
        const left = hasSpaceOnRight
            ? rect.right + spacing
            : rect.left - popoverWidth - spacing;

        return {
            position: 'fixed',
            top: rect.top,
            left: left,
            zIndex: 50,
        };
    };

    return createPortal(
        <div
            ref={popoverRef}
            style={getPopoverStyle()}
            className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-80"
        >
            <div className="mb-2">
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Prompt Text
                </label>
                <input
                    ref={inputRef}
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter prompt text..."
                />
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Save
                </button>
            </div>
            <div className="mt-1 text-xs text-gray-500">
                Press Esc to cancel, Enter to save
            </div>
        </div>,
        document.body
    );
}
