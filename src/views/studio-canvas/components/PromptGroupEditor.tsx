import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Prompt {
    id: string;
    text: string;
}

interface PromptGroupEditorProps {
    title?: string;
    prompts: Prompt[];
    onSave: (title: string | undefined, prompts: Prompt[]) => void;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

export function PromptGroupEditor({ title, prompts, onSave, onClose, anchorEl }: PromptGroupEditorProps) {
    const [editedTitle, setEditedTitle] = useState(title || '');
    const [editedPrompts, setEditedPrompts] = useState<Prompt[]>(prompts);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handleSave = useCallback(() => {
        const cleanedPrompts = editedPrompts.filter(p => p.text.trim());
        onSave(editedTitle.trim() || undefined, cleanedPrompts);
        onClose();
    }, [editedTitle, editedPrompts, onSave, onClose]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                handleSave();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editedTitle, editedPrompts, anchorEl, handleSave]);

    const updatePrompt = (id: string, text: string) => {
        setEditedPrompts(editedPrompts.map(p => p.id === id ? { ...p, text } : p));
    };

    const addPrompt = () => {
        setEditedPrompts([...editedPrompts, { id: crypto.randomUUID(), text: '' }]);
    };

    const removePrompt = (id: string) => {
        setEditedPrompts(editedPrompts.filter(p => p.id !== id));
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
            className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-80 max-h-96 overflow-y-auto"
        >
            {/* Title */}
            <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., How can I help?"
                />
            </div>

            {/* Prompts */}
            <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Prompts
                </label>
                <div className="space-y-2">
                    {editedPrompts.map((prompt, index) => (
                        <div key={prompt.id} className="flex gap-2">
                            <input
                                type="text"
                                value={prompt.text}
                                onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder={`Prompt ${index + 1}`}
                                autoFocus={index === editedPrompts.length - 1}
                            />
                            <button
                                onClick={() => removePrompt(prompt.id)}
                                className="px-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Remove prompt"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={addPrompt}
                    className="mt-2 w-full px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded border border-dashed border-gray-300 transition-colors"
                >
                    + Add prompt
                </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
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
        </div>,
        document.body
    );
}
