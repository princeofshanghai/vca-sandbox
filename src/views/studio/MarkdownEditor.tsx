import { useRef } from 'react';
import { Bold, Italic, Link, List, Code } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    rows?: number;
}

export const MarkdownEditor = ({
    value,
    onChange,
    placeholder,
    className,
    rows = 3
}: MarkdownEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormat = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        onChange(newText);

        // Restore focus and cursor position (wrapping the selection)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length
            );
        }, 0);
    };

    const handleLink = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);

        // If selection looks like a URL, make it the link target. Otherwise make it the text.
        let insert = '';
        if (selection.startsWith('http')) {
            insert = `[Link Text](${selection})`;
        } else if (selection.length > 0) {
            insert = `[${selection}](url)`;
        } else {
            insert = `[Link Text](url)`;
        }

        const newText = text.substring(0, start) + insert + text.substring(end);
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            // TODO: Ideally select "url" part to replace
            textarea.setSelectionRange(start + insert.length, start + insert.length);
        }, 0);
    };

    const handleList = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const before = text.substring(0, start);
        // Expand selection to include full lines if selection exists
        // simplified version: just treat selection as is, or maybe find line start?
        // For now, let's keep it simple: split selected text by newline.

        const selection = text.substring(start, end);
        const after = text.substring(end);

        // If no selection, just insert "- "
        if (selection.length === 0) {
            insertFormat('- ');
            return;
        }

        // Split by newline and add "- " to each non-empty line
        const lines = selection.split('\n');
        const formattedSelection = lines
            .map(line => line.trim().length === 0 ? line : `- ${line}`)
            .join('\n');

        const newText = before + formattedSelection + after;
        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            // Select the formatted text
            textarea.setSelectionRange(start, start + formattedSelection.length);
        }, 0);
    };

    return (
        <div className={cn("border border-gray-200 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b border-gray-100 bg-gray-50/50">
                <ToolbarButton icon={Bold} onClick={() => insertFormat('**', '**')} tooltip="Bold" />
                <ToolbarButton icon={Italic} onClick={() => insertFormat('*', '*')} tooltip="Italic" />
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <ToolbarButton icon={Link} onClick={handleLink} tooltip="Link" />
                <ToolbarButton icon={List} onClick={handleList} tooltip="List" />
                <ToolbarButton icon={Code} onClick={() => insertFormat('`', '`')} tooltip="Code" />
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full p-3 text-sm text-gray-700 placeholder-gray-400 border-0 focus:ring-0 resize-y min-h-[80px] bg-transparent"

            />
        </div>
    );
};

const ToolbarButton = ({ icon: Icon, onClick, tooltip }: { icon: React.ElementType, onClick: () => void, tooltip: string }) => (
    <button
        onClick={onClick}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title={tooltip}
        type="button" // Important to prevent form submission if wrapped in a form
    >
        <Icon size={14} />
    </button>
);
