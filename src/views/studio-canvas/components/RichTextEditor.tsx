import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write something...',
    className,
    autoFocus = false
}: RichTextEditorProps) {

    // --- HTML <-> Markdown Conversion (Robust DOM Approach) ---
    const htmlToMarkdown = useCallback((html: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

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
                    return `**${children}**`;
                case 'em':
                case 'i':
                    return `*${children}*`;
                case 'ul':
                case 'ol':
                    return `${children}\n`;
                case 'li':
                    const parent = element.parentElement?.tagName.toLowerCase();
                    const prefix = parent === 'ol' ? '1. ' : '- ';
                    return `${prefix}${children.trim()}\n`;
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
                    class: 'text-blue-500 hover:underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu',
            }),
        ],
        editorProps: {
            attributes: {
                class: cn(
                    "max-w-none outline-none text-xs leading-relaxed text-gray-800 min-h-[80px] p-3",
                    // List Styling
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
                    "[&_li]:my-0.5",
                    // Nested Paragraphs in Lists (Fix for "moving down")
                    "[&_li_p]:m-0 [&_li_p]:inline",
                    // Paragraph Styling
                    "[&_p]:my-2 [&_p]:leading-relaxed first:[&_p]:mt-0 last:[&_p]:mb-0"
                ),
            },
            handleKeyDown: (_view, event) => {
                event.stopPropagation();
                return false;
            }
        },
        content: markdownToHtml(value),
        onUpdate: ({ editor }) => {
            onChange(htmlToMarkdown(editor.getHTML()));
        },
        autofocus: autoFocus ? 'end' : false,
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
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div
            className={cn(
                "border border-gray-200 rounded-xl bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300",
                className
            )}
            onKeyDown={(e) => e.stopPropagation()}
        >
            {/* Bubble Menu */}
            {editor && (
                <BubbleMenu className="flex bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden" editor={editor}>
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-2 hover:bg-gray-100", editor.isActive('bold') ? 'text-blue-600' : 'text-gray-600')}>
                        <Bold size={14} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-2 hover:bg-gray-100", editor.isActive('italic') ? 'text-blue-600' : 'text-gray-600')}>
                        <Italic size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 my-auto mx-1" />
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("p-2 hover:bg-gray-100", editor.isActive('bulletList') ? 'text-blue-600' : 'text-gray-600')}>
                        <List size={14} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("p-2 hover:bg-gray-100", editor.isActive('orderedList') ? 'text-blue-600' : 'text-gray-600')}>
                        <ListOrdered size={14} />
                    </button>
                    <div className="w-px h-4 bg-gray-200 my-auto mx-1" />
                    <button onClick={setLink} className={cn("p-2 hover:bg-gray-100", editor.isActive('link') ? 'text-blue-600' : 'text-gray-600')}>
                        <LinkIcon size={14} />
                    </button>
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}

