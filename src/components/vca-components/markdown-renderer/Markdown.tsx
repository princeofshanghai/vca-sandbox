import ReactMarkdown from 'react-markdown';
import { cn } from '@/utils';

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

export const MarkdownRenderer = ({ children, className }: MarkdownRendererProps) => {
    return (
        <div className={cn(
            // Base styles for all markdown content
            "prose prose-sm max-w-none",
            // Remove default margins from prose to fit in components
            "prose-p:my-1 prose-headings:my-2",
            // Link styles
            "prose-a:text-vca-link prose-a:font-semibold prose-a:no-underline hover:prose-a:underline",
            // List styles
            "prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4",
            className
        )}>
            <ReactMarkdown
                components={{
                    // Ensure links open in new tab if external (optional, but good for chatbots)
                    a: ({ node: _node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};
