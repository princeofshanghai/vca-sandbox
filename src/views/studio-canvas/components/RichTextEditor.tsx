import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { ShellIconButton } from '@/components/shell';
import { cn } from '@/utils/cn';
import { vcaRichTextEditorContentClassName } from '@/components/vca-components/markdown-renderer/vcaMarkdownTheme';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    readOnly?: boolean;
    surfaceVariant?: 'default' | 'field';
    minHeight?: number;
    resizable?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write something...',
    className,
    autoFocus = false,
    readOnly = false,
    surfaceVariant = 'default',
    minHeight = 60,
    resizable = false,
}: RichTextEditorProps) {

    // --- HTML <-> Markdown Conversion (Robust DOM Approach) ---
    const htmlToMarkdown = useCallback((html: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const wrapInlineMark = (text: string, marker: '**' | '*') => {
            // Keep accidental boundary spaces outside markdown markers so parsing stays reliable.
            const leadingSpace = text.match(/^\s*/)?.[0] || '';
            const trailingSpace = text.match(/\s*$/)?.[0] || '';
            const coreText = text.trim();

            if (!coreText) {
                return text;
            }

            return `${leadingSpace}${marker}${coreText}${marker}${trailingSpace}`;
        };

        function serialize(node: Node): string {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || '';
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
            }

            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            const children = Array.from(element.childNodes).map(serialize).join('');

            switch (tagName) {
                case 'p':
                    // Avoid double spacing in lists
                    if (element.parentElement?.tagName.toLowerCase() === 'li') {
                        return children;
                    }
                    return children.trim() ? `${children}\n\n` : '';
                case 'strong':
                case 'b':
                    return wrapInlineMark(children, '**');
                case 'em':
                case 'i':
                    return wrapInlineMark(children, '*');
                case 'ul':
                case 'ol':
                    return `${children}\n`;
                case 'li': {
                    const parent = element.parentElement?.tagName.toLowerCase();
                    const prefix = parent === 'ol' ? '1. ' : '- ';
                    return `${prefix}${children.trim()}\n`;
                }
                case 'a':
                    return `[${children}](${element.getAttribute('href') || ''})`;
                case 'br':
                    return '\n';
                case 'div':
                    return `${children}\n`;
                default:
                    return children;
            }
        }

        return serialize(doc.body).trim();
    }, []);

    const markdownToHtml = useCallback((md: string): string => {
        if (!md) return '';
        let html = md;
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

        const paragraphs = html.split(/\n\n+/);
        html = paragraphs.map(p => {
            if (p.startsWith('- ')) {
                // Split by newline followed by bullet (lookahead) to keep bullet in chunk, then strip it
                const items = p.trim().split(/\n(?=- )/).map(i => i.replace(/^- /, ''));
                return `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (p.match(/^\d+\. /)) {
                // Split by newline followed by number (lookahead) to keep number in chunk, then strip it
                const items = p.trim().split(/\n(?=\d+\. )/).map(i => i.replace(/^\d+\. /, ''));
                return `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
        return html;
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-shell-accent hover:text-shell-accent-hover hover:underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
                showOnlyCurrent: false,
            }),
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu',
            }),
        ],
        editorProps: {
            attributes: {
                class: vcaRichTextEditorContentClassName,
            },
            handleKeyDown: (_view, event) => {
                event.stopPropagation();
                return false;
            }
        },
        content: markdownToHtml(value),
        onUpdate: ({ editor }) => {
            if (readOnly) return;
            onChange(htmlToMarkdown(editor.getHTML()));
        },
        autofocus: autoFocus ? 'end' : false,
        editable: !readOnly,
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== htmlToMarkdown(editor.getHTML())) {
            // content sync logic
        }
    }, [value, editor, htmlToMarkdown]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        if (readOnly) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const getToolbarButtonClassName = (isActive: boolean) => cn(
        isActive && 'bg-shell-accent-soft text-shell-accent hover:bg-shell-accent-soft hover:text-shell-accent'
    );

    return (
        <div
            className={cn(
                "border border-shell-border rounded-lg overflow-hidden transition-all focus-within:ring-2 focus-within:ring-shell-accent/20 focus-within:border-shell-accent",
                surfaceVariant === 'field' ? "bg-shell-surface" : "bg-shell-bg",
                readOnly ? "focus-within:ring-0 focus-within:border-shell-border" : "",
                className
            )}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {/* Bubble Menu */}
            {editor && !readOnly && (
                <BubbleMenu
                    className="flex items-center gap-1 rounded-lg border border-shell-border bg-shell-surface p-1 shadow-xl"
                    editor={editor}
                    id="markdown-toolbar"
                    data-editor-keep-open
                >
                    <ShellIconButton
                        type="button"
                        size="sm"
                        aria-label="Bold"
                        className={getToolbarButtonClassName(editor.isActive('bold'))}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold size={14} />
                    </ShellIconButton>
                    <ShellIconButton
                        type="button"
                        size="sm"
                        aria-label="Italic"
                        className={getToolbarButtonClassName(editor.isActive('italic'))}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic size={14} />
                    </ShellIconButton>
                    <div className="w-px h-4 bg-shell-border-subtle my-auto mx-1" />
                    <ShellIconButton
                        type="button"
                        size="sm"
                        aria-label="Bulleted list"
                        className={getToolbarButtonClassName(editor.isActive('bulletList'))}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List size={14} />
                    </ShellIconButton>
                    <ShellIconButton
                        type="button"
                        size="sm"
                        aria-label="Numbered list"
                        className={getToolbarButtonClassName(editor.isActive('orderedList'))}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered size={14} />
                    </ShellIconButton>
                    <div className="w-px h-4 bg-shell-border-subtle my-auto mx-1" />
                    <ShellIconButton
                        type="button"
                        size="sm"
                        aria-label="Link"
                        className={getToolbarButtonClassName(editor.isActive('link'))}
                        onClick={setLink}
                    >
                        <LinkIcon size={14} />
                    </ShellIconButton>
                </BubbleMenu>
            )}

            <div
                className={cn(
                    "min-h-0",
                    resizable ? "resize-y overflow-auto" : ""
                )}
                style={{ minHeight }}
            >
                <EditorContent
                    editor={editor}
                    className="[&_.ProseMirror]:h-full [&_.ProseMirror]:min-h-full [&_.tiptap]:h-full [&_.tiptap]:min-h-full"
                />
            </div>
        </div>
    );
}
