import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils';

interface MarkdownRendererProps {
    children: string;
    className?: string;
}

/**
 * MarkdownRenderer - Renders markdown with VCA typography tokens
 * 
 * This component inherits typography from its parent (e.g., Message uses text-vca-small-open)
 * and applies VCA-native styling to markdown elements without using Tailwind prose plugin
 * to avoid conflicts with VCA's custom design tokens.
 */
export const MarkdownRenderer = ({ children, className }: MarkdownRendererProps) => {
    return (
        <div className={cn(className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Paragraphs - use text-vca-small-open to override global p styles
                    p: ({ node: _node, ...props }) => (
                        <p className="text-vca-small-open my-1" {...props} />
                    ),
                    // Bold - use text-vca-small-bold-open weight within VCA system
                    strong: ({ node: _node, ...props }) => (
                        <strong className="text-vca-small-bold-open" {...props} />
                    ),
                    // Italic - use italic style with inherited VCA font
                    em: ({ node: _node, ...props }) => (
                        <em {...props} />
                    ),
                    // Unordered lists - use VCA spacing and typography
                    ul: ({ node: _node, ...props }) => (
                        <ul className="text-vca-small-open list-disc pl-2 space-y-1 my-2" {...props} />
                    ),
                    // Ordered lists - use VCA spacing and typography
                    ol: ({ node: _node, ...props }) => (
                        <ol className="text-vca-small-open list-decimal pl-2 space-y-1 my-2" {...props} />
                    ),
                    // List items - inherit VCA typography
                    li: ({ node: _node, ...props }) => (
                        <li className="text-vca-small-open" {...props} />
                    ),
                    // Links - use VCA link color tokens with hover underline
                    a: ({ node: _node, ...props }) => (
                        <a
                            className="text-vca-link hover:text-vca-link-hover active:text-vca-link-active hover:underline font-semibold no-underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};

