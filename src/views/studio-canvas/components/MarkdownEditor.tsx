import { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Link, List, ListOrdered, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Premium WYSIWYG Markdown Editor (Refactored)
 * Features:
 * - Persistent Minimalist Toolbar
 * - Keyboard Shortcuts (Cmd+B, Cmd+I, Cmd+K)
 * - Safe Delete Handling (Stops propagation)
 * - Strict 12px Styling
 * - Numbered Lists & Tighter Indentation
 */
export const MarkdownEditor = ({
    value,
    onChange,
    placeholder,
    className
}: MarkdownEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    // --- Bi-directional Conversion ---

    const mdToHtml = useCallback((md: string) => {
        if (!md) return '';

        // Simple markdown to HTML conversion
        const html = md
            // Escape html special chars to avoid breaking layout
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            // Handle Bold+Italic (***) first
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            // Handle Bold (**)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Handle Italic (*)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Handle Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-vca-link hover:text-vca-link-hover font-semibold" target="_blank">$1</a>');

        // Handle lists
        const lines = html.split('\n');
        let listType: 'ul' | 'ol' | null = null;

        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            const isUl = trimmed.startsWith('- ');
            const isOl = /^\d+\.\s/.test(trimmed);

            if (isUl || isOl) {
                const content = trimmed.substring(isUl ? 2 : trimmed.indexOf(' ') + 1);
                let result = '';
                const newListType = isUl ? 'ul' : 'ol';

                if (listType !== newListType) {
                    if (listType) result += `</${listType}>`;
                    const listClass = isUl ? 'list-disc' : 'list-decimal';
                    result += `<${newListType} class="${listClass} pl-2 mb-1 text-xs">`;
                    listType = newListType;
                }
                result += `<li class="mb-0.5 text-xs">${content}</li>`;
                return result;
            } else {
                if (listType) {
                    const closeTag = `</${listType}>`;
                    listType = null;
                    if (trimmed === '') return closeTag + '<br>';
                    return closeTag + `<p class="mb-1 text-xs">${line}</p>`;
                }
                if (trimmed === '') return '<br>';
                return `<p class="mb-1 text-xs">${line}</p>`;
            }
        });

        if (listType) {
            processedLines.push(`</${listType}>`);
        }

        return processedLines.join('');
    }, []);

    const htmlToMd = useCallback((html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html;

        const processNode = (node: Node): string => {
            if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
            if (node.nodeType !== Node.ELEMENT_NODE) return '';

            const el = node as HTMLElement;
            const children = Array.from(node.childNodes).map(processNode).join('');
            const parentTag = el.parentElement?.tagName.toLowerCase();

            switch (el.tagName.toLowerCase()) {
                case 'p': return children + '\n';
                case 'strong': case 'b': return `**${children}**`;
                case 'em': case 'i': return `*${children}*`;
                case 'a': return `[${children}](${el.getAttribute('href') || ''})`;
                case 'li': return parentTag === 'ol' ? `1. ${children}\n` : `- ${children}\n`;
                case 'ul': case 'ol': return children + '\n';
                case 'div': return children + '\n';
                case 'br': return '\n';
                default: return children;
            }
        };

        // Post-processing to clean up nested markdown and newlines
        let md = processNode(div);

        // Fix nested ** and * if regex duplicated them
        md = md.replace(/\*\*\*\*/g, '**').replace(/\*\*/g, '**');

        return md.replace(/\n\n+/g, '\n\n').replace(/\n\s+(\d+\.|-)/g, '\n$1').trim();
    }, []);

    // Initial load
    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = mdToHtml(value);
        }
    }, [mdToHtml, value]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const md = htmlToMd(html);
            onChange(md);
        }
    };

    // --- Command Handling ---

    const applyCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // CRITICAL: Stop propagation of Delete/Backspace to prevent deleting the parent node
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.stopPropagation();
        }

        // Shortcuts
        if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyCommand('italic');
                    break;
                case 'k':
                    e.preventDefault();
                    setShowLinkInput(true);
                    break;
                case 'u': // standard mostly unsupported in md but good UX to prevent browser default
                    e.preventDefault();
                    break;
            }
        }
    };


    // --- Selection Management ---
    const selectionRef = useRef<Range | null>(null);

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectionRef.current = selection.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (selectionRef.current) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(selectionRef.current);
            }
        }
    };

    const handleCreateLink = (e: React.FormEvent) => {
        e.preventDefault();
        restoreSelection(); // Restore selection before applying command
        applyCommand('createLink', linkUrl);
        setShowLinkInput(false);
        setLinkUrl('');
    };

    return (
        <div className={cn(
            "relative group border border-gray-200 rounded-xl bg-white transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 overflow-hidden",
            className
        )}>
            {/* 1. Persistent Toolbar */}
            <div id="markdown-toolbar" className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
                {!showLinkInput ? (
                    <>
                        {/* Minimalist Controls */}
                        <ToolbarButton icon={Bold} onClick={() => applyCommand('bold')} label="Bold (Cmd+B)" />
                        <ToolbarButton icon={Italic} onClick={() => applyCommand('italic')} label="Italic (Cmd+I)" />
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <ToolbarButton icon={Link} onClick={() => { saveSelection(); setShowLinkInput(true); }} label="Link (Cmd+K)" />
                        <ToolbarButton icon={List} onClick={() => applyCommand('insertUnorderedList')} label="Bullet List" />
                        <ToolbarButton icon={ListOrdered} onClick={() => applyCommand('insertOrderedList')} label="Numbered List" />
                    </>
                ) : (
                    <form onSubmit={handleCreateLink} className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <input
                            autoFocus
                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs outline-none focus:border-blue-500 placeholder:text-gray-400"
                            placeholder="Paste link URL..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowLinkInput(false);
                                    e.stopPropagation(); // Prevent parent closing
                                }
                                // Allow 'Enter' to submit form naturally
                            }}
                        />
                        <button type="submit" className="text-[10px] bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded font-medium">Add</button>
                        <button
                            type="button"
                            onClick={() => setShowLinkInput(false)}
                            className="text-[10px] text-gray-500 hover:text-gray-700 px-1"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            {/* 2. Editor Content Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="w-full p-4 min-h-[100px] outline-none text-xs text-gray-800 leading-relaxed cursor-text [&_p]:mb-1 [&_p]:text-xs [&_ul]:list-disc [&_ul]:pl-2 [&_ul]:mb-1 [&_ul]:text-xs [&_ol]:list-decimal [&_ol]:pl-2 [&_ol]:mb-1 [&_ol]:text-xs [&_li]:mb-0.5 [&_li]:text-xs [&_a]:text-vca-link [&_a]:hover:text-vca-link-hover [&_a]:font-semibold"
            />

            {(!value || value.trim() === '') && (
                <div className="absolute top-[3.25rem] left-4 text-gray-400 text-xs pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
};

const ToolbarButton = ({ icon: Icon, onClick, label }: { icon: LucideIcon, onClick: () => void, label: string }) => (
    <button
        onClick={onClick}
        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-all active:scale-95"
        title={label}
        type="button"
        onMouseDown={(e) => e.preventDefault()} // Prevent stealing focus
    >
        <Icon size={14} />
    </button>
);

